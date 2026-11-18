"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/shop";
import CartDrawer from "./CartDrawer";
import LanguageSwitcher from "./LanguageSwitcher";
import Button from "./Button";
import { GET_THE_APP_HREF } from "./nav";
import { useI18n } from "@/lib/i18n/context";

export default function HeaderActions({ isMobile = false }: { isMobile?: boolean }) {
  const { t } = useI18n();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex h-9 items-center justify-center rounded-full border border-line bg-surface/80 px-2.5 text-navy backdrop-blur-sm transition-colors hover:border-sky hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky"
          aria-label={t("shop.cartLabel", "Cart, {count} items", { count: totalItems })}
        >
          <ShoppingBag className="size-4" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-xs">
              {totalItems}
            </span>
          )}
        </button>

        {!isMobile && (
          <Button href={GET_THE_APP_HREF} label={t("nav.joinShort", "Join the list")} size="s" />
        )}
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
