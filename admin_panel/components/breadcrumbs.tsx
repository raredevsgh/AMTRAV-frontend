import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={crumb.href ?? `${crumb.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="select-none text-zinc-400 dark:text-zinc-600"
                >
                  /
                </span>
              )}
              {isLast || !crumb.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
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
          );
        })}
      </ol>
    </nav>
  );
}
