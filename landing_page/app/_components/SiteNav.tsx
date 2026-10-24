"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav";

// Figma "Nav link" (2018:537): State=Active marks the current page, Hover turns the label blue.
export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="flex h-11 items-center px-4">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full p-2 text-btn font-bold transition-colors duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active ? "bg-blue-pale text-brand" : "text-ink hover:text-brand"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
