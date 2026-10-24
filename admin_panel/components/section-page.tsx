import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import type { AdminSection } from "@/lib/admin-sections";

export function SectionPage({
  section,
  breadcrumbs,
  children,
  as: Component = "main",
}: {
  section: AdminSection;
  breadcrumbs?: readonly BreadcrumbItem[];
  children?: React.ReactNode;
  as?: "main" | "div" | "section";
}) {
  const defaultCrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: section.label },
  ];

  return (
    <Component
      id="main-content"
      className="flex w-full max-w-5xl flex-col gap-6 px-6 py-8 sm:px-10"
    >
      <Breadcrumbs items={breadcrumbs ?? defaultCrumbs} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {section.label}
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          {section.description}
        </p>
      </header>
      {children ?? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          The {section.label.toLowerCase()} tools arrive in a later sprint.
        </div>
      )}
    </Component>
  );
}
