export type AdminRole = "administrator" | "manufacturer";

export type AdminSection = {
  href: string;
  label: string;
  description: string;
  roles?: readonly AdminRole[];
};

// Section navigation configuration matching the OpenAPI contract and Sprint F0 roadmap.
// In F0-3, the App Shell will filter navigation items based on the signed-in user's role:
// - administrator: Devices, Users, Files
// - manufacturer: Devices, Files
export const adminSections = {
  devices: {
    href: "/devices",
    label: "Devices",
    description: "Manage registered AMTRAV devices, claim codes and audit logs.",
    roles: ["administrator", "manufacturer"],
  },
  users: {
    href: "/users",
    label: "Users",
    description: "Manage user accounts, staff roles and administrative access.",
    roles: ["administrator"],
  },
  files: {
    href: "/files",
    label: "Files",
    description: "Access and upload private files, firmware bundles and exports.",
    roles: ["administrator", "manufacturer"],
  },
  login: {
    href: "/login",
    label: "Sign In",
    description: "Staff portal authentication for administrators and manufacturers.",
  },
} as const satisfies Record<string, AdminSection>;

export type AdminSectionKey = keyof typeof adminSections;

/**
 * Safely sanitizes dynamic route parameters before rendering or metadata generation.
 * Handles URL decoding, whitespace trimming, and bounds checking to prevent UI truncation.
 */
export function sanitizeIdentifier(rawId: string): string {
  try {
    const decoded = decodeURIComponent(rawId);
    return decoded.trim().slice(0, 100);
  } catch {
    return rawId.trim().slice(0, 100);
  }
}
