import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";
import { adminSections } from "@/lib/admin-sections";

export const metadata: Metadata = {
  title: "Files",
  description:
    "AMTRAV private files, firmware release packages and system exports.",
};

export default function FilesPage() {
  return (
    <SectionPage section={adminSections.files}>
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          Sprint F0 Route Skeleton: Files
        </p>
        <p className="mt-1">
          Private file listing (GET /api/v1/files), firmware uploads and exports
          arrive in Sprint F4. Accessible to administrator and manufacturer
          roles.
        </p>
      </div>
    </SectionPage>
  );
}
