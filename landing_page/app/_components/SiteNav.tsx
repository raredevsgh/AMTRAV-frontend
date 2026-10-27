"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SHOP_LINK } from "./nav";

// Clean navigation with underline active indicator
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

// Shop cart button for desktop and mobile navigation
export function ShopLink() {
  const active = usePathname() === SHOP_LINK.href;
  return (
    <Link
      href={SHOP_LINK.href}
      aria-label={SHOP_LINK.label}
      aria-current={active ? "page" : undefined}
      className={`group flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#EEF1F7] focus-visible:outline-2 focus-visible:outline-brand ${
        active ? "bg-blue-pale" : "border border-navy/15 hover:border-navy/35"
      }`}
    >
      <Image
        src="/icons/shop-cart.svg"
        alt=""
        width={18}
        height={18}
        className={`${active ? "opacity-100" : "opacity-75"} group-hover:opacity-100`}
      />
    </Link>
  );
}

