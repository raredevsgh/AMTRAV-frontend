"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SHOP_LINK } from "./nav";
import { useI18n } from "@/lib/i18n/context";
import { useCart } from "@/lib/shop";

export default function SiteNav({ isNegative = false }: { isNegative?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { href: "/features", label: t("nav.features", "Features") },
    { href: "/how-it-works", label: t("nav.how", "How it works") },
    { href: "/for-brands", label: t("nav.brands", "For brands") },
  ];

  const serviceLinks = [
    { href: "/shop?product=duffel-side-bag", label: "Suede Duffel Side Bag", desc: "Handcrafted suede with aluminium accents", badge: "New" },
    { href: "/customise", label: "AMTRAV UNIQUE Studio", desc: "Bespoke 3D luggage configurator", badge: "3D" },
    { href: "/services/registration", label: "Luggage Registration", desc: "Activate your Lifetime Guarantee" },
    { href: "/services/lock-tutorial", label: "TSA Lock Tutorial", desc: "Interactive combination dial guide" },
    { href: "/services/tracking", label: "Order & Return Tracking", desc: "DHL luxury logistics milestones" },
    { href: "/services/repairs", label: "Repair Service Portal", desc: "Certified global repair hubs" },
    { href: "/services/stores", label: "Boutique Store Locator", desc: "VIP in-store appointments" },
  ];

  return (
    <nav aria-label={t("nav.main", "Main navigation")} className="flex h-11 items-center gap-1.5 xl:gap-2 px-1">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-btn font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              active
                ? isNegative
                  ? "bg-white/20 text-white border border-white/30 shadow-xs"
                  : "bg-brand/10 text-brand font-bold border border-brand/20 shadow-xs"
                : isNegative
                ? "text-white/85 hover:text-white hover:bg-white/10"
                : "text-navy hover:text-brand hover:bg-navy/5"
            }`}
          >
            {label}
          </Link>
        );
      })}

      {/* Services & Bespoke Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-btn font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
            dropdownOpen || pathname.startsWith("/services") || pathname.startsWith("/customise")
              ? isNegative
                ? "bg-white/20 text-white border border-white/30 shadow-xs"
                : "bg-brand/10 text-brand font-bold border border-brand/20 shadow-xs"
              : isNegative
              ? "text-white/85 hover:text-white hover:bg-white/10"
              : "text-navy hover:text-brand hover:bg-navy/5"
          }`}
        >
          <span>Services</span>
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            } ${isNegative ? "text-white/80" : "text-navy/70"}`}
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 rounded-2xl border border-divider bg-white p-3 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="border-b border-divider pb-2 px-2.5 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-mid">
                Atelier & Client Care
              </span>
            </div>
            <div className="space-y-1">
              {serviceLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-start justify-between rounded-xl px-2.5 py-2 hover:bg-surface transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-small font-semibold text-navy">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-mid mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function ShopLink({ onClick, isNegative = false }: { onClick?: () => void; isNegative?: boolean }) {
  const pathname = usePathname();
  const active = pathname === SHOP_LINK.href;
  const { t } = useI18n();
  const { totalItems } = useCart();

  const className = `relative group flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out-soft hover:bg-sky hover:shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    active
      ? isNegative
        ? "bg-white/20 border border-white/40 text-white shadow-xs"
        : "bg-blue-pale border border-brand/30 shadow-xs"
      : isNegative
      ? "border border-white/25 bg-white/10 hover:border-white/50 text-white"
      : "border-[1.5px] border-ink/80 bg-surface/80 hover:border-ink hover:bg-surface text-navy"
  }`;

  const content = (
    <>
      <Image
        src="/icons/shop-cart.svg"
        alt=""
        width={22}
        height={22}
        loading="eager"
        className={`transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6 ${
          isNegative
            ? "brightness-0 invert"
            : active
            ? ""
            : "brightness-50 group-hover:brightness-0 group-hover:invert"
        }`}
      />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-xs">
          {totalItems}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={t("nav.cart", "Cart & Shop")}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={SHOP_LINK.href}
      aria-label={t("nav.shop", "Shop")}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}