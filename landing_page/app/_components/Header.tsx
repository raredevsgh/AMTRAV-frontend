"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import SiteNav, { ShopLink } from "./SiteNav";
import HeaderActions from "./HeaderActions";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const pathname = usePathname();
  const [isNegative, setIsNegative] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const updateContrast = () => {
      const header = document.getElementById("site-header");
      const darkSections = document.querySelectorAll<HTMLElement>('[data-theme="dark"]');

      // Exact vertical midpoint of the floating header pill on screen
      const headerRect = header ? header.getBoundingClientRect() : { top: 20, height: 50 };
      const headerMidY = headerRect.top + (headerRect.height || 50) / 2;

      // On homepage, the dark hero occupies the initial screen from top until scrolled past
      if (pathname === "/") {
        const hero = document.getElementById("hero-dark");
        if (hero) {
          const heroRect = hero.getBoundingClientRect();
          if (heroRect.bottom > headerMidY) {
            setIsNegative(true);
            return;
          }
        }
      }

      if (!darkSections.length) {
        setIsNegative(false);
        return;
      }

      let overDark = false;
      for (let i = 0; i < darkSections.length; i++) {
        const rect = darkSections[i].getBoundingClientRect();
        if (rect.top <= headerMidY && rect.bottom >= headerMidY) {
          overDark = true;
          break;
        }
      }
      setIsNegative(overDark);
    };

    updateContrast();
    window.addEventListener("scroll", updateContrast, { passive: true });
    window.addEventListener("resize", updateContrast, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateContrast);
      window.removeEventListener("resize", updateContrast);
    };
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-[1440px] px-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-4 xl:px-5 xl:pt-5">
        <header
          id="site-header"
          className={`pointer-events-auto relative flex items-center justify-between gap-3 rounded-full py-2 pr-2.5 pl-4 transition-all duration-300 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-7 xl:py-2.5 xl:pr-2.5 xl:pl-7 ${
            isNegative ? "glass-negative text-white shadow-lifted" : "glass text-navy shadow-card"
          }`}
        >
          {/* Brand Logo with Negative UI Invert Filter */}
          <Link
            href="/"
            className="relative h-6 w-[116px] shrink-0 rounded-sm transition-all duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand xl:h-[30.76px] xl:w-[150px]"
          >
            <Image
              src="/img/logo.png"
              alt="AMORTRAV"
              fill
              sizes="150px"
              className={`object-contain transition-all duration-300 ${
                isNegative ? "brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : ""
              }`}
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:block">
            <SiteNav isNegative={isNegative} />
          </div>

          {/* Mobile Actions: Clean Classic AMTRAV Style (Shop Icon + Hamburger Menu Only) */}
          <div className="flex items-center gap-2 xl:hidden">
            <ShopLink isNegative={isNegative} onClick={() => setCartOpen(true)} />
            <MobileMenu isNegative={isNegative} />
          </div>

          {/* Desktop Header Actions */}
          <div className="hidden items-center gap-3 justify-self-end xl:flex">
            <HeaderActions isNegative={isNegative} onOpenCart={() => setCartOpen(true)} />
          </div>
        </header>

        {/* Global Cart Slide-Over Drawer */}
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </div>
  );
}
