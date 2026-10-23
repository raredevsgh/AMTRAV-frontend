import { Breadcrumbs } from "@/components/breadcrumbs";
import type { AdminSection } from "@/lib/admin-sections";

export function SectionPage({ section }: { section: AdminSection }) {
  return (
    <main className="flex w-full max-w-5xl flex-col gap-6 px-6 py-8 sm:px-10">
      <Breadcrumbs section={section} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {section.label}
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          {section.description}
        </p>
      </header>
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        The {section.label.toLowerCase()} tools arrive in a later sprint.
      </p>
    </main>
  );
}
