import type { AdminRole } from "@/lib/admin-sections";

const roleLabels: Record<AdminRole, string> = {
  administrator: "Administrator",
  manufacturer: "Manufacturer",
};

export function RoleBadge({ role }: { role: AdminRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        role === "administrator"
          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
      }`}
    >
      {roleLabels[role]}
    </span>
  );
}
