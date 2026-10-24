"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "./Button";
import { GET_THE_APP_HREF, NAV_LINKS } from "./nav";

// Figma "Mobile menu (overlay)" (2020:1076), opened by the menu button in "Header / Mobile".
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface"
      >
        <Image src="/icons/menu.svg" alt="" width={20} height={20} />
      </button>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col gap-2 overflow-y-auto bg-surface px-3 pt-3 pb-8 motion-safe:animate-[menu-in_240ms_var(--ease-out-soft)]"
        >
          <div className="flex w-full items-center gap-2 rounded-full bg-white py-2 pr-2 pl-5 shadow-hairline">
            <Link href="/" onClick={close} className="relative h-6 w-[116px] shrink-0">
              <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="116px" className="object-cover" />
            </Link>
            <div className="flex-1" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface"
            >
              <Image src="/icons/close.svg" alt="" width={20} height={20} />
            </button>
          </div>

          <nav data-stagger className="flex w-full flex-col px-5 pt-4">
            {[{ href: "/", label: "Home" }, ...NAV_LINKS].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                data-enter
                className="flex items-center justify-between border-b border-stale py-[18px] text-h2-m font-semibold text-navy transition-colors duration-200 active:text-brand"
              >
                {label}
                <Image src="/icons/chevron.svg" alt="" width={20} height={20} />
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex w-full flex-col gap-3 px-5">
            <Button href={GET_THE_APP_HREF} label="Get the app" arrow onClick={close} className="w-full" />
            <p className="text-center text-caption-m text-mid">©2026 Amortrav</p>
          </div>
        </div>
      )}
    </>
  );
}
