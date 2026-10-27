"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SHOP_LINK } from "./nav";

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

// Recreated from the supplied header screenshot with the owner's approval; not a Figma export.
export function ShopLink() {
  const active = usePathname() === SHOP_LINK.href;
  return (
    <Link
      href={SHOP_LINK.href}
      aria-label={SHOP_LINK.label}
      aria-current={active ? "page" : undefined}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-pale transition-colors hover:bg-blue-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active ? "ring-2 ring-brand ring-offset-2" : ""}`}
    >
      <Image src="/icons/shop-cart.svg" alt="" width={24} height={24} loading="eager" />
    </Link>
  );
}
