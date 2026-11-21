"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/shop";
import CartDrawer from "./CartDrawer";
import CurrencySwitcher from "./CurrencySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import Button from "./Button";
import Link from "next/link";
import { GET_THE_APP_HREF } from "./nav";
import { useI18n } from "@/lib/i18n/context";

export default function HeaderActions({
  isMobile = false,
  isNegative = false,
}: {
  isMobile?: boolean;
  isNegative?: boolean;
}) {
  const { t } = useI18n();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <CurrencySwitcher isNegative={isNegative} />
        <LanguageSwitcher isNegative={isNegative} />

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className={`relative flex h-9 items-center justify-center rounded-full px-2.5 backdrop-blur-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky ${
            isNegative
              ? "border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 shadow-xs"
              : "border border-line bg-surface/80 text-navy hover:border-sky hover:bg-surface"
          }`}
          aria-label={t("shop.cartLabel", "Cart, {count} items", { count: totalItems })}
        >
          <ShoppingBag className="size-4" />
          {totalItems > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold shadow-xs ${
                isNegative ? "bg-sky text-navy" : "bg-brand text-white"
              }`}
            >
              {totalItems}
            </span>
          )}
        </button>

        {!isMobile && (
          <Link
            href={GET_THE_APP_HREF}
            className="flex h-9 items-center justify-center rounded-full bg-brand px-4 text-btn-sm font-bold text-white shadow-md hover:bg-navy-deep transition-all active:scale-95"
          >
            <span>{t("nav.joinShort", "Join")}</span>
          </Link>
        )}
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}