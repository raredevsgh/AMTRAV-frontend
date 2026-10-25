import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";
import { adminSections } from "@/lib/admin-sections";

export const metadata: Metadata = {
  title: "Users",
  description:
    "AMTRAV user administration, account management and role changes.",
};

export default function UsersPage() {
  return (
    <SectionPage section={adminSections.users}>
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          Sprint F0 Route Skeleton: Users
        </p>
        <p className="mt-1">
          Staff account directory (GET /api/v1/admin/users) and role changes
          (PUT /api/v1/admin/users/&#123;id&#125;/role) arrive in Sprint F4.
          Accessible to the administrator role only.
        </p>
      </div>
    </SectionPage>
  );
}
