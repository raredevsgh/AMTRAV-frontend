import type { AdminRole } from "@/lib/admin-sections";
const roleLabels: Record<AdminRole | "user", string> = {
  administrator: "Admin",
  manufacturer: "Manufacturer",
  user: "User",
};
export function RoleBadge({ role }: { role: AdminRole | "user" }) {
  return (
    <span className="status-badge status-registered">{roleLabels[role]}</span>
  );
}
