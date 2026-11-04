// Converts between the API's JSON WebAuthn options (base64url strings) and the
// browser's ArrayBuffer-based credential API.
import { useSyncExternalStore } from "react";

type Json = Record<string, unknown>;
type Descriptor = { id: string; type: string; transports?: string[] };

function passkeysSupported() {
  return typeof window !== "undefined" && "PublicKeyCredential" in window;
}

const unchanged = () => () => {};

/** False during server rendering, so hydration matches before the browser is known. */
export function usePasskeySupport() {
  return useSyncExternalStore(unchanged, passkeysSupported, () => false);
}

function toBuffer(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)).buffer;
}

function toBase64Url(buffer: ArrayBuffer | null) {
  if (!buffer) return null;
  let binary = "";
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Browsers reject null for optional dictionary members, so drop them.
function withoutNulls<T extends Json>(value: T): T {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [
        k,
        v && typeof v === "object" && !Array.isArray(v) ? withoutNulls(v as Json) : v,
      ]),
  ) as T;
}

const descriptors = (list?: Descriptor[]) =>
  list?.map((item) => ({ ...item, id: toBuffer(item.id) })) as
    PublicKeyCredentialDescriptor[] | undefined;

function cancelled(error: unknown): never {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    throw new Error("Passkey request was cancelled or timed out.");
  }
  if (error instanceof DOMException && error.name === "InvalidStateError") {
    throw new Error("This passkey is already registered to your account.");
  }
  throw error instanceof Error ? error : new Error("Passkey request failed.");
}

export async function createPasskey(options: { publicKey: Json }) {
  const source = withoutNulls(options.publicKey) as Json & {
    challenge: string;
    user: Json & { id: string };
    excludeCredentials?: Descriptor[];
  };
  const credential = (await navigator.credentials
    .create({
      publicKey: {
        ...(source as unknown as PublicKeyCredentialCreationOptions),
        challenge: toBuffer(source.challenge),
        user: {
          ...(source.user as unknown as PublicKeyCredentialUserEntity),
          id: toBuffer(source.user.id),
        },
        excludeCredentials: descriptors(source.excludeCredentials),
      },
    })
    .catch(cancelled)) as PublicKeyCredential;
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    extensions: credential.getClientExtensionResults(),
    response: {
      attestationObject: toBase64Url(response.attestationObject),
      clientDataJSON: toBase64Url(response.clientDataJSON),
      transports: response.getTransports?.(),
    },
  };
}

export async function getPasskey(options: { publicKey: Json }) {
  const source = withoutNulls(options.publicKey) as Json & {
    challenge: string;
    allowCredentials?: Descriptor[];
  };
  // The server suggests conditional mediation; a button press uses the modal prompt.
  const credential = (await navigator.credentials
    .get({
      publicKey: {
        ...(source as unknown as PublicKeyCredentialRequestOptions),
        challenge: toBuffer(source.challenge),
        allowCredentials: descriptors(source.allowCredentials),
      },
    })
    .catch(cancelled)) as PublicKeyCredential;
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    extensions: credential.getClientExtensionResults(),
    response: {
      authenticatorData: toBase64Url(response.authenticatorData),
      clientDataJSON: toBase64Url(response.clientDataJSON),
      signature: toBase64Url(response.signature),
      userHandle: toBase64Url(response.userHandle),
    },
  };
}
