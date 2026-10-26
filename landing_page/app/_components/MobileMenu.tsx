"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { GET_THE_APP_HREF, NAV_LINKS } from "./nav";

const ALL_LINKS = [{ href: "/", label: "Home" }, ...NAV_LINKS];

export default function MobileMenu() {
  const pathname = usePathname();
  return <NavigationMenu key={pathname} pathname={pathname} />;
}

// A route change resets local menu state, including browser back/forward navigation.
function NavigationMenu({ pathname }: { pathname: string }) {
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
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface transition-colors hover:bg-stale/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Image src="/icons/menu.svg" alt="" width={20} height={20} />
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
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const focusReturn = useRef(restoreFocus);

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
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-navy backdrop:bg-navy/40 open:flex open:justify-end"
    >
      <div className="flex h-full w-[min(22rem,90vw)] flex-col gap-4 overflow-y-auto rounded-l-[28px] bg-white px-5 pt-[max(20px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] shadow-2xl motion-safe:animate-[slide-drawer-in_280ms_var(--ease-out-soft)]">
        <div className="flex items-center justify-between gap-4">
          <p id="mobile-menu-title" className="sr-only">Navigation menu</p>
          <Link href="/" onClick={close} className="relative h-6 w-[116px] shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
            <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="116px" className="object-cover" />
          </Link>
          <button ref={closeButton} type="button" aria-label="Close menu" onClick={close} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-blue-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            <Image src="/icons/close.svg" alt="" width={18} height={18} />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 py-4">
          {ALL_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={close} aria-current={pathname === href ? "page" : undefined} className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand ${pathname === href ? "bg-blue-pale text-brand" : "text-navy hover:bg-surface"}`}>
              {label}
              <Image src="/icons/chevron.svg" alt="" width={16} height={16} />
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-divider pt-5">
          <Button href={GET_THE_APP_HREF} label="Join the list" arrow onClick={close} className="w-full" />
        </div>
      </div>
    </dialog>
  );
}
