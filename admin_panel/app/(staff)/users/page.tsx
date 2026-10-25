import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";
import { createMockApi } from "@/lib/api";
import { adminSections } from "@/lib/admin-sections";

export const metadata: Metadata = {
  title: "Users",
  description:
    "AMTRAV user administration, account management and role changes.",
};

export default async function UsersPage() {
  const users = await createMockApi().listUsers({ limit: 3, offset: 0 });

  return (
    <SectionPage section={adminSections.users}>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Typed mock API preview
          </p>
          <p className="mt-1">
            This read-only preview consumes the F0-2 user DTOs. Account changes
            remain scheduled for Sprint F4.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {users.items.map((user) => (
            <li
              key={user.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user.email}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {user.role} · {user.email_verified ? "verified" : "unverified"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </SectionPage>
  );
}
