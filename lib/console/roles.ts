// What each console role may do, mirroring the API (axum-backend src/auth/extractor.rs,
// Capability). The API is what enforces it; the console uses this to show only the pages and
// buttons a role can use. Manufacturers keep their own access to the bags they make.
import type { StaffRole } from "./types";

export type Capability =
  "read" | "support" | "incidents" | "fleet" | "firmware" | "fulfil" | "money" | "admin";

const grants: Record<StaffRole, Capability[]> = {
  admin: [
    "read",
    "support",
    "incidents",
    "fleet",
    "firmware",
    "fulfil",
    "money",
    "admin",
  ],
  support: ["read", "support", "incidents"],
  operations: ["read", "incidents", "fleet", "firmware", "fulfil"],
  finance: ["read", "money"],
  read_only: ["read"],
  manufacturer: [],
};

export function can(role: string, capability: Capability) {
  return grants[role as StaffRole]?.includes(capability) ?? false;
}

/** Amortrav's own staff: everyone but manufacturers (and travellers). */
export const isAmortrav = (role: string) => can(role, "read");

export const roleLabels: Record<StaffRole, string> = {
  admin: "Admin",
  support: "Support",
  operations: "Operations",
  finance: "Finance",
  read_only: "Read only",
  manufacturer: "Manufacturer",
};

/** What each staff role is for, where an administrator picks one. */
export const roleHints: Record<StaffRole, string> = {
  admin: "Everything, including staff, roles and security.",
  support: "Support requests, warranty claims, incidents and travellers.",
  operations: "The fleet, incidents, firmware and shipping.",
  finance: "Refunds, orders held for review, products and prices.",
  read_only: "Sees everything, changes nothing.",
  manufacturer: "Their own bags: registering, provisioning, firmware status.",
};
