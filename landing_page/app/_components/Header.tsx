"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import SiteNav from "./SiteNav";
import HeaderActions from "./HeaderActions";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if we are on a page with a dark hero section
  const hasDarkHero = pathname === "/" || pathname === "/shop" || pathname.startsWith("/customise");

  // Negative UI is active when on a dark hero and not yet scrolled onto light content
  const isNegative = hasDarkHero && !scrolled;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-[1440px] px-3 pt-[max(12px,env(safe-area-inset-top))] xl:px-5 xl:pt-5">
        <header
          className={`pointer-events-auto relative flex items-center justify-between gap-2 rounded-full py-2 pr-2 pl-5 transition-all duration-300 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-7 xl:py-2.5 xl:pr-2.5 xl:pl-7 ${
            isNegative
              ? "border border-white/25 bg-white/[0.09] shadow-[0_12px_36px_0_rgba(0,0,0,0.35)] backdrop-blur-2xl"
              : "border border-divider/90 bg-white/90 shadow-[0_8px_30px_0_rgba(0,10,31,0.08)] backdrop-blur-2xl"
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
                isNegative ? "brightness-0 invert drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" : ""
              }`}
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:block">
            <SiteNav isNegative={isNegative} />
          </div>

          {/* Mobile Actions & Menu */}
          <div className="flex items-center gap-2 xl:hidden">
            <HeaderActions isMobile isNegative={isNegative} />
            <MobileMenu isNegative={isNegative} />
          </div>

          {/* Desktop Header Actions */}
          <div className="hidden items-center gap-3 justify-self-end xl:flex">
            <HeaderActions isNegative={isNegative} />
          </div>
        </header>
      </div>
    </div>
  );
}
