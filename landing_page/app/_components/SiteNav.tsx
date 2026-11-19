"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SHOP_LINK } from "./nav";
import { useI18n } from "@/lib/i18n/context";
import { useCart } from "@/lib/shop";

export default function SiteNav() {
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
                ? "bg-blue-pale text-brand shadow-xs"
                : "text-ink hover:text-brand hover:bg-white/40"
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
              ? "bg-blue-pale text-brand shadow-xs"
              : "text-ink hover:text-brand hover:bg-white/40"
          }`}
        >
          <span>Services</span>
          <ChevronDown className={`size-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
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

export function ShopLink({ onClick }: { onClick?: () => void }) {
  const active = usePathname() === SHOP_LINK.href;
  const { t } = useI18n();
  const { totalItems } = useCart();

  return (
    <Link
      href={SHOP_LINK.href}
      onClick={onClick}
      aria-label={t("nav.shop", "Shop")}
      aria-current={active ? "page" : undefined}
      className={`relative group flex size-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out-soft hover:bg-sky hover:shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active ? "bg-blue-pale" : "border-[1.5px] border-ink"
      }`}
    >
      <Image
        src="/icons/shop-cart.svg"
        alt=""
        width={22}
        height={22}
        loading="eager"
        className={`transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6 ${
          active ? "" : "brightness-50"
        } group-hover:brightness-0 group-hover:invert`}
      />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-xs">
          {totalItems}
        </span>
      )}
    </Link>
  );
}