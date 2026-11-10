"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brand } from "@/lib/brand";
import { format, type Messages } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { LanguageSwitcher } from "./language-switcher";
import { LocaleMenu, menus, NavMenu } from "./header-menus";
import { useSiteStore, type SiteDialog } from "@/stores/site-store";
import { MotionProvider } from "./motion";
import { FlightPath } from "./visuals";
import { Suspense, type ReactNode } from "react";
/** The staff and manufacturer console (the admin dashboard); it asks for sign-in itself. */
const consoleUrl = process.env.NEXT_PUBLIC_CONSOLE_URL || "/console";

const links = [
  { href: "/", label: "home" },
  { href: "/#features", label: "features" },
  { href: "/#how", label: "how" },
  { href: "/#range", label: "range" },
  { href: "/app", label: "app" },
  { href: "/shop", label: "shop" },
  { href: "/for-brands", label: "brands" },
  { href: "/contact", label: "contact" },
] as const;
export function ActionButton({
  action,
  children,
  className = "",
  ...props
}: {
  action: Exclude<SiteDialog, null>;
  children: ReactNode;
  className?: string;
}) {
  const open = useSiteStore((s) => s.openDialog);
  const url =
    action === "ios"
      ? process.env.NEXT_PUBLIC_IOS_APP_URL
      : action === "android"
        ? process.env.NEXT_PUBLIC_ANDROID_APP_URL
        : action === "console"
          ? process.env.NEXT_PUBLIC_CONSOLE_URL || "/sign-in"
          : action === "contact"
            ? process.env.NEXT_PUBLIC_CONTACT_URL
            : undefined;
  return url ? (
    <Button asChild className={`pill ${className}`} {...props}>
      <a href={url}>{children}</a>
    </Button>
  ) : (
    <Button onClick={() => open(action)} className={`pill ${className}`} {...props}>
      {children}
    </Button>
  );
}
/** The header, with the current page marked; until the URL is known it shows unmarked. */
export function Header() {
  return (
    <Suspense fallback={<HeaderBar path={null} />}>
      <CurrentHeader />
    </Suspense>
  );
}

function CurrentHeader() {
  return <HeaderBar path={usePathname()} />;
}

function HeaderBar({ path }: { path: string | null }) {
  const { m, href } = useI18n();
  return (
    <>
      <header className="site-header">
        <Link
          href={href("/")}
          aria-label={format(m.nav.homeLabel, { company: brand.company })}
        >
          <Image
            src="/images/wordmark.png"
            alt="Amortrav"
            width={1185}
            height={243}
            className="wordmark"
            priority
          />
        </Link>
        <nav aria-label={m.nav.main} className="desktop-nav">
          <NavMenu {...menus[0]} path={path} />
          <Link
            href={href("/shop")}
            aria-current={path?.startsWith(href("/shop")) ? "page" : undefined}
          >
            {m.nav.shop}
          </Link>
          <NavMenu {...menus[1]} path={path} />
        </nav>
        <div className="header-actions">
          <LocaleMenu />
          <Link
            href={consoleUrl}
            className="header-console"
            aria-label={m.nav.consoleLabel}
          >
            {m.nav.console}
          </Link>
          <Button asChild className="pill header-cta">
            <Link href={href("/#founding")}>
              <span className="desktop-label">{m.nav.join}</span>
              <span className="mobile-label">{m.nav.joinShort}</span>
            </Link>
          </Button>
        </div>
      </header>
      <nav aria-label={m.nav.mobile} className="mobile-nav">
        {links.map((l) => (
          <Link
            href={href(l.href)}
            key={l.href}
            aria-current={path === href(l.href) ? "page" : undefined}
          >
            {m.nav[l.label]}
          </Link>
        ))}
        <Link href={consoleUrl} aria-label={m.nav.consoleLabel}>
          {m.nav.console}
        </Link>
      </nav>
    </>
  );
}
export function DownloadSection() {
  const { m } = useI18n();
  return (
    <section
      className="download-section panel navy"
      id="get"
      aria-labelledby="download-heading"
    >
      <FlightPath variant="wide" />
      <Image
        src="/images/brand-mark.png"
        alt=""
        width={252}
        height={204}
        className="cta-mark"
      />
      <h2 id="download-heading">{m.download.title}</h2>
      <p>{m.download.body}</p>
      <div className="button-row">
        <ActionButton action="ios" className="white">
          {m.download.ios}
        </ActionButton>
        <ActionButton action="android" className="light">
          {m.download.android}
        </ActionButton>
      </div>
    </section>
  );
}
type FooterKey = keyof Messages["footer"];

const footerColumns: {
  title: FooterKey;
  /** `direct`: the address is used as it is, not moved under the page's language. */
  links: { label: FooterKey | "email"; href: string; direct?: boolean }[];
}[] = [
  {
    title: "company",
    links: [
      { label: "about", href: "/about" },
      { label: "features", href: "/features" },
      { label: "app", href: "/app" },
      { label: "brands", href: "/for-brands" },
      { label: "shop", href: "/shop" },
      { label: "console", href: consoleUrl, direct: true },
    ],
  },
  {
    title: "support",
    links: [
      { label: "faq", href: "/#faq" },
      { label: "pairing", href: "/how-it-works" },
      { label: "shipping", href: "/shipping-returns" },
      { label: "warranty", href: "/warranty" },
    ],
  },
  {
    title: "legal",
    links: [
      { label: "terms", href: "/terms" },
      { label: "privacy", href: "/privacy" },
      { label: "cookies", href: "/cookies" },
    ],
  },
  {
    title: "contact",
    links: [
      { label: "email", href: `mailto:${brand.email}` },
      { label: "partnerships", href: "/contact#enquiry" },
      { label: "contactUs", href: "/contact" },
    ],
  },
];

// Brand marks, drawn inline: the icon set has no logos of other companies.
const socialIcons = {
  facebook: (
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
  ),
  instagram: (
    <path d="M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Zm0 6.9a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm4.4-7a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM12 4.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.6-1.3-3.7-3.7-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c.1-2.4 1.3-3.6 3.7-3.7.9-.1 1.2-.1 3.6-.1Zm0-1.6c-2.4 0-2.7 0-3.7.1-3.3.1-5.1 2-5.2 5.2-.1 1-.1 1.3-.1 3.7s0 2.7.1 3.7c.1 3.3 2 5.1 5.2 5.2 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.3-.1 5.1-2 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c-.1-3.3-2-5.1-5.2-5.2-1-.1-1.3-.1-3.7-.1Z" />
  ),
  x: (
    <path d="M17.8 3.5h3l-6.6 7.5 7.8 10.5h-6.1l-4.8-6.3-5.5 6.3h-3l7.1-8.1L2.3 3.5h6.2l4.3 5.8 5-5.8Zm-1 16.2h1.7L7.4 5.2H5.6l11.2 14.5Z" />
  ),
};

function Footer() {
  const { m, href } = useI18n();
  const socials = (Object.keys(socialIcons) as (keyof typeof socialIcons)[]).filter(
    (key) => brand.social[key],
  );
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link
            href={href("/")}
            aria-label={format(m.nav.homeLabel, { company: brand.company })}
          >
            <Image
              src={brand.logos.wordmark}
              width={1185}
              height={243}
              alt={brand.company}
            />
          </Link>
          <p>{m.footer.line}</p>
          <LanguageSwitcher className="footer-language" />
        </div>
        <nav className="footer-columns" aria-label={m.footer.label}>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2>{m.footer[column.title]}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.direct ? link.href : href(link.href)}>
                      {link.label === "email" ? brand.email : m.footer[link.label]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>
          {format(m.footer.rights, { year: brand.year, company: brand.company })}
        </span>
        {socials.length ? (
          <ul className="footer-social">
            {socials.map((key) => (
              <li key={key}>
                <a
                  className={key}
                  href={brand.social[key]!}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={format(m.footer.social, {
                    company: brand.company,
                    network: key === "x" ? "X" : key[0].toUpperCase() + key.slice(1),
                  })}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {socialIcons[key]}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="footer-watermark" aria-hidden="true">
        {brand.company.toUpperCase()}
      </p>
    </footer>
  );
}
function SiteDialogs() {
  const dialog = useSiteStore((s) => s.dialog);
  const open = useSiteStore((s) => s.openDialog);
  const { m } = useI18n();
  const app = dialog === "ios" || dialog === "android";
  const title = app
    ? m.dialog.appTitle
    : dialog === "console"
      ? m.dialog.consoleTitle
      : m.dialog.contactTitle;
  const body = app
    ? format(m.dialog.appBody, { platform: dialog === "ios" ? "iPhone" : "Android" })
    : dialog === "console"
      ? m.dialog.consoleBody
      : m.dialog.contactBody;
  return (
    <Dialog open={dialog !== null} onOpenChange={(value) => !value && open(null)}>
      <DialogContent className="site-dialog">
        <DialogHeader>
          <span className="dialog-icon">{app ? <Smartphone /> : <Building2 />}</span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <Button className="pill" onClick={() => open(null)}>
          {m.dialog.ok}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
export function SiteShell({ children }: { children: ReactNode }) {
  const paused = useSiteStore((s) => s.motionPaused);
  const { m } = useI18n();
  return (
    <MotionProvider>
      <div className={`site-shell ${paused ? "motion-paused" : ""}`}>
        <a className="skip-link" href="#main-content">
          {m.nav.skip}
        </a>
        <div className="site-container">
          <Header />
          <main id="main-content" className="page-stack">
            {children}
            <DownloadSection />
          </main>
          <Footer />
        </div>
        <SiteDialogs />
      </div>
    </MotionProvider>
  );
}
