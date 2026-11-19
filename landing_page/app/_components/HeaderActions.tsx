"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Heart, User, Globe, ShieldCheck, Package, RotateCcw } from "lucide-react";
import { useCart } from "@/lib/shop";
import { useWishlist } from "@/lib/wishlist";
import { useRegion } from "@/lib/region";
import { useI18n, LOCALES } from "@/lib/i18n/context";
import CartDrawer from "./CartDrawer";
import SearchDrawer from "./SearchDrawer";
import RegionModal from "./RegionModal";

export default function HeaderActions() {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { country } = useRegion();
  const { locale } = useI18n();

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const currentLangLabel = LOCALES[locale]?.label || "English";

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Region & Language Selector Button (e.g. "Norway | English") */}
        <button
          type="button"
          onClick={() => setRegionOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 text-caption font-semibold text-navy backdrop-blur-sm transition-colors hover:border-navy hover:bg-surface"
          aria-label="Change country and language"
        >
          <Globe className="size-3.5 text-mid" />
          <span className="hidden md:inline">{country.name} | {currentLangLabel}</span>
          <span className="md:hidden">{country.code}</span>
        </button>

        {/* Predictive Search Trigger (Pill shaped like RIMOWA "Find your gifts") */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface/70 px-3 text-caption text-mid backdrop-blur-sm transition-colors hover:border-navy hover:text-navy"
          aria-label="Search catalog"
        >
          <Search className="size-3.5" />
          <span className="hidden xl:inline font-medium">Find your gifts</span>
        </button>

        {/* Account / Services Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface/70 text-navy backdrop-blur-sm transition-colors hover:border-navy hover:bg-surface"
            aria-label="Account menu"
          >
            <User className="size-4" />
          </button>

          {accountOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-divider bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              onMouseLeave={() => setAccountOpen(false)}
            >
              <div className="border-b border-divider pb-2 px-2">
                <p className="text-caption-m font-bold text-navy">Client Portal</p>
                <p className="text-[11px] text-mid">Access orders, tracking & warranty</p>
              </div>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link
                    href="/services/tracking"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-caption font-medium text-navy hover:bg-surface"
                  >
                    <Package className="size-3.5 text-mid" />
                    <span>Track an Order</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/registration"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-caption font-medium text-navy hover:bg-surface"
                  >
                    <ShieldCheck className="size-3.5 text-sky" />
                    <span>Register Your Luggage</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/repairs"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-caption font-medium text-navy hover:bg-surface"
                  >
                    <RotateCcw className="size-3.5 text-mid" />
                    <span>Request a Repair</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Wishlist Trigger */}
        <Link
          href="/shop?tab=wishlist"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface/70 text-navy backdrop-blur-sm transition-colors hover:border-navy hover:bg-surface"
          aria-label={`Wishlist, ${wishlistCount} items`}
        >
          <Heart className="size-4" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex h-9 items-center justify-center rounded-full border border-line bg-surface/80 px-2.5 text-navy backdrop-blur-sm transition-colors hover:border-sky hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky"
          aria-label={`Shopping bag, ${totalItems} items`}
        >
          <ShoppingBag className="size-4" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-xs">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Modals & Drawers */}
      <RegionModal isOpen={regionOpen} onClose={() => setRegionOpen(false)} />
      <SearchDrawer isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}