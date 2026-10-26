"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav";

// Figma "Nav link" (2018:537): State=Active marks the current page, Hover turns the label blue.
export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex h-11 items-center gap-7 px-2">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 text-btn font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 rounded-sm ${
              active ? "text-brand" : "text-ink hover:text-brand"
            }`}
          >
            <span>{label}</span>
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-[2.5px] rounded-full bg-brand"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
