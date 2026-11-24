"use client";

// useCart removed – cart icon is rendered via ShopLink
import CurrencySwitcher from "./CurrencySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShopLink } from "./SiteNav";
import Link from "next/link";
import { GET_THE_APP_HREF } from "./nav";
import { useI18n } from "@/lib/i18n/context";

export default function HeaderActions({
  isNegative = false,
  onOpenCart,
}: {
  isMobile?: boolean;
  isNegative?: boolean;
  onOpenCart?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 xl:gap-2.5">
      <CurrencySwitcher isNegative={isNegative} />
      <LanguageSwitcher isNegative={isNegative} />
      <ShopLink isNegative={isNegative} onClick={onOpenCart} />
      <Link
        href={GET_THE_APP_HREF}
        className="flex h-11 items-center justify-center rounded-full bg-brand px-5 text-btn font-semibold text-white shadow-md hover:bg-navy-deep transition-all duration-200 active:scale-95"
      >
        <span>{t("nav.joinShort", "Join the list")}</span>
      </Link>
    </div>
  );
}
