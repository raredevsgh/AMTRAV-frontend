import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SiteNav, { ShopLink } from "./SiteNav";

// Fixed navbar pinned to the top edge so scrolling content slides underneath cleanly.
export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-navy/5 bg-white/98 shadow-[0_2px_12px_rgba(0,31,77,0.06)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 xl:px-8 xl:py-3.5">
        <Link
          href="/"
          className="relative h-6 w-[116px] shrink-0 rounded-sm transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand xl:h-[30.76px] xl:w-[150px]"
        >
          <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="150px" className="object-cover" preload />
        </Link>

        <div className="hidden xl:flex xl:items-center xl:gap-5">
          <SiteNav />
          <ShopLink />
        </div>

        <div className="flex items-center gap-2.5 xl:hidden">
          <ShopLink />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
