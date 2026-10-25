import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";
import { createMockApi } from "@/lib/api";
import { adminSections } from "@/lib/admin-sections";

export const metadata: Metadata = {
  title: "Files",
  description:
    "AMTRAV private files, firmware release packages and system exports.",
};

export default async function FilesPage() {
  const files = await createMockApi().listFiles({ limit: 2, offset: 0 });

  return (
    <SectionPage section={adminSections.files}>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Typed mock API preview
          </p>
          <p className="mt-1">
            This read-only preview consumes file metadata without contacting
            MinIO or the backend. Uploads arrive in Sprint F4.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {files.items.map((file) => (
            <li
              key={file.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {file.filename}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {file.content_type} · {file.size_bytes} bytes
              </p>
            </li>
          ))}
        </ul>
      </div>
    </SectionPage>
  );
}
