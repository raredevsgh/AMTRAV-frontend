import type { RegisterDevice } from "./types";

const bytes = (value: string) => new TextEncoder().encode(value).length;
export function validEmail(value: string): boolean {
  const email = value.trim();
  const parts = email.split("@");
  return (
    parts.length === 2 &&
    parts[0].length > 0 &&
    parts[0].length <= 64 &&
    parts[1].includes(".") &&
    bytes(email) <= 254 &&
    /^[\x21-\x7e]+$/.test(email)
  );
}
export function validMetadata(value: string, max: number): boolean {
  return (
    value.trim().length > 0 &&
    bytes(value.trim()) <= max &&
    !/[\p{Cc}]/u.test(value.trim())
  );
}
export function registrationErrors(
  input: RegisterDevice,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(input.serial_number.trim()))
    errors.serial_number =
      "Use 6–64 ASCII letters, digits, hyphens or underscores.";
  if (!validMetadata(input.model, 128))
    errors.model =
      "Enter a model of at most 128 UTF-8 bytes, without control characters.";
  if (!validMetadata(input.firmware_version, 64))
    errors.firmware_version =
      "Enter a declared firmware version of at most 64 UTF-8 bytes.";
  return errors;
}
export function validPassword(value: string): boolean {
  return bytes(value) >= 12 && bytes(value) <= 128;
}
export const FILE_LIMIT = 10 * 1024 * 1024;
export const FILE_TYPES = [
  "application/octet-stream",
  "application/pdf",
  "application/json",
  "text/plain",
  "image/png",
  "image/jpeg",
] as const;
export function fileError(
  name: string,
  type: string,
  size: number,
): string | null {
  if (
    !/^[A-Za-z0-9 ._-]{1,120}$/.test(name.trim()) ||
    [".", ".."].includes(name.trim())
  )
    return "Use a filename of 1–120 ASCII letters, digits, spaces, dots, hyphens or underscores, without a path.";
  if (size < 1) return "The file is empty.";
  if (size > FILE_LIMIT) return "The file exceeds 10 MiB.";
  if (
    !(FILE_TYPES as readonly string[]).includes(
      type || "application/octet-stream",
    )
  )
    return "Unsupported file type. Use PDF, PNG, JPEG, JSON, plain text or binary.";
  return null;
}
