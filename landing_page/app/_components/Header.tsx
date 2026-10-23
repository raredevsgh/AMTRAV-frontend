import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import MobileMenu from "./MobileMenu";
import { GET_THE_APP_HREF } from "./nav";
import SiteNav from "./SiteNav";

// Figma "Header / Desktop" (2020:498) and "Header / Mobile" (2020:515).
export default function Header() {
  return (
    <header className="absolute inset-x-3 top-3 z-10 flex items-center gap-2 overflow-clip rounded-full bg-white py-2 pr-2 pl-5 shadow-hairline xl:inset-x-5 xl:top-5 xl:justify-between xl:gap-0 xl:bg-white/60 xl:py-2.5 xl:pr-2.5 xl:pl-7 xl:backdrop-blur-[50px]">
      <Link href="/" className="relative h-6 w-[116px] shrink-0 xl:h-[30.76px] xl:w-[150px]">
        <Image src="/img/logo.png" alt="AMORTRAV" fill sizes="150px" className="object-cover" preload />
      </Link>

      <div className="hidden xl:block">
        <SiteNav />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 xl:hidden">
        <Button href={GET_THE_APP_HREF} label="Get the app" size="xs" />
        <MobileMenu />
      </div>
      <div className="hidden xl:block">
        <Button href={GET_THE_APP_HREF} label="Get the app" />
      </div>
    </header>
  );
}
