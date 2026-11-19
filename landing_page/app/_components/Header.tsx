import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import MegaMenu from "./MegaMenu";
import HeaderActions from "./HeaderActions";

export default function Header() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-[1480px] px-3 pt-[max(10px,env(safe-area-inset-top))] xl:px-6 xl:pt-4">
        <header className="glass pointer-events-auto relative flex items-center justify-between gap-3 rounded-full py-2 pr-3 pl-5 border border-line/60 bg-white/85 shadow-card backdrop-blur-xl xl:grid xl:grid-cols-[auto_1fr_auto] xl:gap-6 xl:py-2.5 xl:pr-3 xl:pl-6">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="relative h-6 w-[116px] shrink-0 rounded-sm transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand xl:h-[28px] xl:w-[136px]"
          >
            <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="140px" className="object-contain" priority />
          </Link>

          {/* RIMOWA-Style Mega Menu 8 Pillars (Desktop) */}
          <div className="hidden xl:flex justify-center">
            <MegaMenu />
          </div>

          {/* Actions & Utilities (Mobile & Desktop) */}
          <div className="flex items-center gap-2">
            <HeaderActions />
            <div className="xl:hidden">
              <MobileMenu />
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}