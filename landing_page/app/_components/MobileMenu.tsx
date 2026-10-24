"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { GET_THE_APP_HREF, NAV_LINKS } from "./nav";

// Figma "Mobile menu" slide-out drawer, opened by the menu button in "Header / Mobile".
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // Prevent background scrolling while slide drawer is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const slideDrawer = (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[100]"
    >
      {/* Semi-transparent backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className="fixed inset-0 bg-navy/40 backdrop-blur-xs transition-opacity motion-safe:animate-[fade-in_200ms_ease-out]"
      />

      {/* Slide drawer panel */}
      <div className="fixed inset-y-0 right-0 z-10 flex h-full w-[320px] max-w-[85vw] flex-col justify-between bg-white p-5 shadow-2xl motion-safe:animate-[slide-drawer-in_280ms_cubic-bezier(0.16,1,0.3,1)]">
        <div>
          {/* Header row inside drawer */}
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <Link href="/" onClick={close} className="relative h-6 w-[116px] shrink-0">
              <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="116px" className="object-cover" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-navy transition-colors hover:bg-stale/40"
            >
              <Image src="/icons/close.svg" alt="" width={18} height={18} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col py-3">
            {[{ href: "/", label: "Home" }, ...NAV_LINKS].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="flex items-center justify-between border-b border-divider/60 py-4 text-base font-semibold text-navy transition-colors hover:text-brand active:text-brand"
              >
                <span>{label}</span>
                <Image src="/icons/chevron.svg" alt="" width={18} height={18} className="opacity-60" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="mt-auto flex flex-col gap-3 border-t border-divider pt-6">
          <Button href={GET_THE_APP_HREF} label="Get the app" arrow onClick={close} className="w-full justify-center" />
          <p className="text-center text-caption-m text-mid">©2026 Amortrav</p>
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

      {open && mounted && createPortal(slideDrawer, document.body)}
    </>
  );
}
