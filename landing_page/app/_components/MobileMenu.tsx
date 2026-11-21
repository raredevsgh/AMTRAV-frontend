"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GET_THE_APP_HREF } from "./nav";
import { useI18n } from "@/lib/i18n/context";
import { useRegion } from "@/lib/region";
import CurrencySwitcher from "./CurrencySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileMenu({ isNegative = false }: { isNegative?: boolean }) {
  const pathname = usePathname();
  return <NavigationMenu key={pathname} pathname={pathname} isNegative={isNegative} />;
}

// A route change resets local menu state, including browser back/forward navigation.
function NavigationMenu({ pathname, isNegative = false }: { pathname: string; isNegative?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className={`flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          isNegative
            ? "border border-white/25 bg-white/10 text-white hover:bg-white/20 shadow-xs"
            : "bg-surface hover:bg-stale/40 text-navy"
        }`}
      >
        <Image
          src="/icons/menu.svg"
          alt=""
          width={20}
          height={20}
          loading="eager"
          className={isNegative ? "brightness-0 invert" : ""}
        />
      </button>
      {open && createPortal(
        <NavigationDialog pathname={pathname} close={close} restoreFocus={() => trigger.current?.focus()} />,
        document.body,
      )}
    </>
  );
}

function NavigationDialog({ pathname, close, restoreFocus }: {
  pathname: string;
  close: () => void;
  restoreFocus: () => void;
}) {
  const { t } = useI18n();
  const { currency, country } = useRegion();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const focusReturn = useRef(restoreFocus);

  const links = [
    { href: "/features", label: t("nav.features", "Features") },
    { href: "/how-it-works", label: t("nav.how", "How it works") },
    { href: "/for-brands", label: t("nav.brands", "For brands") },
    { href: "/shop", label: t("nav.shop", "Shop now") },
    { href: "/shop?product=duffel-side-bag", label: "Suede Duffel Bag", badge: "New" },
    { href: "/customise", label: "AMTRAV UNIQUE Studio", badge: "3D" },
    { href: "/services", label: "Client Services" },
  ];

  useEffect(() => {
    const element = dialog.current;
    const returnFocus = focusReturn.current;
    const overflow = document.body.style.overflow;
    const desktop = matchMedia("(min-width: 1280px)");
    if (desktop.matches) {
      close();
      return;
    }
    // Native modal dialogs provide top-layer stacking, background inertness and tab containment.
    element?.showModal();
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    const onResize = () => { if (desktop.matches) close(); };
    desktop.addEventListener("change", onResize);
    return () => {
      desktop.removeEventListener("change", onResize);
      element?.close();
      document.body.style.overflow = overflow;
      returnFocus();
    };
  }, [close]);

  return (
    <dialog
      ref={dialog}
      id="mobile-menu"
      aria-labelledby="mobile-menu-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      className="fixed inset-0 m-0 z-50 h-dvh max-h-none w-screen max-w-none border-0 bg-[#F4F6F8] p-0 text-navy backdrop:bg-transparent open:flex open:flex-col overflow-y-auto"
    >
      <div className="flex min-h-dvh w-full flex-col justify-between px-5 pt-[max(16px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-xs border border-gray-100">
          <p id="mobile-menu-title" className="sr-only">Navigation menu</p>
          <Link href="/" onClick={close} className="relative h-6 w-[116px] shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
            <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="116px" className="object-contain" />
          </Link>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Image src="/icons/close.svg" alt="" width={16} height={16} />
          </button>
        </div>

        {/* Links List */}
        <nav aria-label={t("nav.mobile", "Mobile navigation")} className="my-auto flex flex-col py-6">
          {links.map(({ href, label, badge }) => {
            const isShop = href === "/shop";
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                aria-current={pathname === href ? "page" : undefined}
                className="flex items-center justify-between border-b border-[#E2E8F0] py-4 text-[20px] font-bold text-navy transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                  {badge && (
                    <span className="rounded-full bg-navy/5 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-brand border border-brand/20">
                      {badge}
                    </span>
                  )}
                </div>
                {isShop ? (
                  <Image src="/icons/shop-cart.svg" alt="" width={22} height={22} className="opacity-80" />
                ) : (
                  <Image src="/icons/chevron.svg" alt="" width={16} height={16} className="opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom CTA, Region & Footer */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-divider shadow-xs">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-mid">
                Currency & Region
              </span>
              <span className="text-xs font-bold text-navy">
                {currency.code} ({currency.symbol}) · {country.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>
          </div>

          <Link
            href={GET_THE_APP_HREF}
            onClick={close}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span>{t("nav.joinShort", "Join the list")}</span>
            <Image src="/icons/arrow-white.svg" alt="" width={16} height={16} />
          </Link>
          <p className="text-caption text-mid">©2026 Amortrav</p>
        </div>
      </div>
    </dialog>
  );
}
