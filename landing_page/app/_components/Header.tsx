import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import MobileMenu from "./MobileMenu";
import { GET_THE_APP_HREF } from "./nav";
import SiteNav from "./SiteNav";

// The glass stays in its own pseudo-element; modal navigation is portaled to the body.
export default function Header() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-[1440px] px-3 pt-[max(12px,env(safe-area-inset-top))] xl:px-5 xl:pt-5">
        <header className="glass pointer-events-auto relative flex items-center justify-between gap-2 rounded-full py-2 pr-2 pl-5 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-7 xl:py-2.5 xl:pr-2.5 xl:pl-7">
          <Link
            href="/"
            className="relative h-6 w-[116px] shrink-0 rounded-sm transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand xl:h-[30.76px] xl:w-[150px]"
          >
            <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="150px" className="object-cover" preload />
          </Link>

          <div className="hidden xl:block">
            <SiteNav />
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Button href={GET_THE_APP_HREF} label="Join the list" size="xs" />
            <MobileMenu />
          </div>
          <div className="hidden justify-self-end xl:block">
            <Button href={GET_THE_APP_HREF} label="Join the list" />
          </div>
        </header>
      </div>
    </div>
  );
}
