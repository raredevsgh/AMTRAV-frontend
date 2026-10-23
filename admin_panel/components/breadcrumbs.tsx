import Link from "next/link";
import { adminSections, type AdminSection } from "@/lib/admin-sections";

export function Breadcrumbs({ section }: { section: AdminSection }) {
  const home = adminSections.dashboard;
  const trail = section.href === home.href ? [home] : [home, section];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        {trail.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === trail.length - 1 ? (
              <span
                aria-current="page"
                className="font-medium text-zinc-950 dark:text-zinc-50"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="rounded-sm hover:text-zinc-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
