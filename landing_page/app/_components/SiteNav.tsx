"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SHOP_LINK } from "./nav";

// Figma "Nav link" (2018:537, 124:776): State=Active marks current page with rounded-full light-blue pill badge.
export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex h-11 items-center gap-2 xl:gap-3 px-1">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-btn font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              active
                ? "bg-blue-pale text-brand shadow-xs"
                : "text-ink hover:text-brand hover:bg-white/30"
            }`}
          >
            {label}
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
      className={`group flex size-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out-soft hover:bg-sky hover:shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active ? "bg-blue-pale" : "border-[1.5px] border-ink"}`}
    >
      <Image
        src="/icons/shop-cart.svg"
        alt=""
        width={24}
        height={24}
        loading="eager"
        className={`transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6 ${active ? "" : "brightness-50"} group-hover:brightness-0 group-hover:invert`}
      />
    </Link>
  );
}
