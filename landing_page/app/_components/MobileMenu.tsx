"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { GET_THE_APP_HREF, NAV_LINKS, SHOP_LINK } from "./nav";

const ALL_LINKS = [{ href: "/", label: "Home" }, ...NAV_LINKS, SHOP_LINK];
const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Top slide-down sheet menu matching the reference design concept
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // Prevent background scrolling while menu is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const slideDownMenu = (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[100]"
    >
      {/* Semi-transparent backdrop overlay without blur - clicking closes the menu */}
      <div
        onClick={close}
        aria-hidden="true"
        className="fixed inset-0 bg-navy/40 transition-opacity motion-safe:animate-[fade-in_200ms_ease-out]"
      />

      {/* Top slide-down menu sheet - covers top portion only, page content stays visible below */}
      <div className="fixed inset-x-0 top-0 z-10 flex max-h-[85vh] flex-col overflow-y-auto rounded-b-[28px] border-b border-navy/10 bg-white px-5 pt-4 pb-6 shadow-2xl motion-safe:animate-[slide-down_280ms_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header row with logo and close button */}
        <div className="flex items-center justify-between pb-3">
          <Link href="/" onClick={close} className="relative h-6 w-[116px] shrink-0">
            <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="116px" className="object-cover" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-navy transition-colors hover:bg-stale/40 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Image src="/icons/close.svg" alt="" width={18} height={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1 pt-2">
          {ALL_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                  isActive
                    ? "bg-navy/5 font-bold text-navy"
                    : "text-navy/80 hover:bg-surface hover:text-navy active:text-brand"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isActive && <span className="size-2 rounded-full bg-brand" />}
                  <span>{label}</span>
                </div>
                <Image
                  src="/icons/chevron.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={isActive ? "opacity-90" : "opacity-45"}
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA Button at bottom of dropdown panel */}
        <div className="mt-4 border-t border-divider/60 pt-4">
          <Button href={GET_THE_APP_HREF} label="Get the app" arrow onClick={close} className="w-full justify-center" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface transition-colors hover:bg-stale/40"
      >
        <Image src="/icons/menu.svg" alt="" width={20} height={20} />
      </button>

      {open && mounted && createPortal(slideDownMenu, document.body)}
    </>
  );
}
