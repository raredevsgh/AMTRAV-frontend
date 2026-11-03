import type { Role } from "./api/types";
export type AdminRole = "administrator" | "manufacturer";
export type AdminSectionIcon =
  | "overview"
  | "devices"
  | "register"
  | "operations"
  | "journeys"
  | "customers"
  | "alerts"
  | "manufacturers"
  | "files"
  | "users"
  | "settings";
export type AdminSection = {
  href: string;
  label: string;
  description: string;
  icon?: AdminSectionIcon;
  roles?: readonly AdminRole[];
};
export const adminSections = {
  overview: {
    href: "/",
    label: "Overview",
    description: "Fleet performance, active operations, and recent activity.",
    icon: "overview",
    roles: ["administrator", "manufacturer"],
  },
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
  operations: {
    href: "/operations",
    label: "Device Operations",
    description: "Fleet operational control, diagnostics, and telemetry.",
    icon: "operations",
    roles: ["administrator", "manufacturer"],
  },
  journeys: {
    href: "/journeys",
    label: "Journeys",
    description: "Active transit routes, flight waypoints, and luggage milestones.",
    icon: "journeys",
    roles: ["administrator", "manufacturer"],
  },
  customers: {
    href: "/customers",
    label: "Customers",
    description: "Passenger directory, claimed bags, and travel profiles.",
    icon: "customers",
    roles: ["administrator"],
  },
  alerts: {
    href: "/alerts",
    label: "Alerts",
    description: "Security incidents, tamper detection, and fleet exceptions.",
    icon: "alerts",
    roles: ["administrator", "manufacturer"],
  },
  manufacturers: {
    href: "/manufacturers",
    label: "Manufacturers",
    description: "Authorized partner organizations and production quotas.",
    icon: "manufacturers",
    roles: ["administrator"],
  },
  files: {
    href: "/files",
    label: "Files",
    description: "Private files. Owners and administrators only.",
    icon: "files",
    roles: ["administrator", "manufacturer"],
  },
  users: {
    href: "/users",
    label: "Accounts",
    description: "Create manufacturer accounts and manage staff roles.",
    icon: "users",
    roles: ["administrator"],
  },
  settings: {
    href: "/settings",
    label: "Settings",
    description: "Workspace preferences and device policies.",
    icon: "settings",
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
