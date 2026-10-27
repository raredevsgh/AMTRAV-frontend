import type { Role } from "./api/types";
export type AdminRole = "administrator" | "manufacturer";
export type AdminSectionIcon = "devices" | "users" | "files" | "register";
export type AdminSection = {
  href: string;
  label: string;
  description: string;
  icon?: AdminSectionIcon;
  roles?: readonly AdminRole[];
};
export const adminSections = {
  devices: {
    href: "/devices",
    label: "Devices",
    description: "Registry records across your accessible inventory.",
    icon: "devices",
    roles: ["administrator", "manufacturer"],
  },
  register: {
    href: "/devices/new",
    label: "Register device",
    description: "Add a registry record and receive its one-time claim code.",
    icon: "register",
    roles: ["administrator", "manufacturer"],
  },
  users: {
    href: "/users",
    label: "Accounts",
    description: "Create manufacturer accounts and manage staff roles.",
    icon: "users",
    roles: ["administrator"],
  },
  files: {
    href: "/files",
    label: "Files",
    description: "Private files. Owners and administrators only.",
    icon: "files",
    roles: ["administrator", "manufacturer"],
  },
  login: { href: "/login", label: "Sign in", description: "Staff access" },
} as const satisfies Record<string, AdminSection>;
export type AdminSectionKey = keyof typeof adminSections;
export function toAdminRole(role: Role): AdminRole | null {
  return role === "admin"
    ? "administrator"
    : role === "manufacturer"
      ? "manufacturer"
      : null;
}
export function sanitizeIdentifier(rawId: string) {
  try {
    return decodeURIComponent(rawId).trim().slice(0, 100);
  } catch {
    return rawId.trim().slice(0, 100);
  }
}
