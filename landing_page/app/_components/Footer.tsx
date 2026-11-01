"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

type FooterLink = { label: string; href?: string };
const GROUPS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "For brands", href: "/for-brands" },
      { label: "Careers" },
      { label: "Blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Pairing help", href: "/how-it-works" },
      { label: "Shipping & returns" },
      { label: "Warranty" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of use" },
      { label: "Privacy" },
      { label: "Cookies" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@amortrav.com", href: "mailto:hello@amortrav.com" },
      { label: "Partnerships", href: "/for-brands#signup" },
    ],
  },
];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const EASE = "duration-300 ease-out-soft motion-reduce:transition-none";

function Arrow({ className }: { className: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3.33 8h9.34M8.67 12l4-4-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Hover: the label turns brand blue, an underline draws in from the left and, on links with a
// destination, an arrow slides in. The others show the availability notice.
function FooterLinks({
  links,
  shown = true,
  onUnavailable,
}: {
  links: readonly FooterLink[];
  shown?: boolean;
  onUnavailable: (name: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {links.map(({ label, href }, i) => {
        const content = (
          <>
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-soft group-hover/link:bg-[length:100%_1px] motion-reduce:transition-none">
              {label}
            </span>
            {href && (
              <Arrow className={`-translate-x-1.5 opacity-0 transition-[translate,opacity] ${EASE} group-hover/link:translate-x-0 group-hover/link:opacity-100`} />
            )}
          </>
        );
        const className = `group/link inline-flex min-h-9 items-center gap-2 rounded-sm text-left text-small text-navy transition-colors xl:text-caption ${EASE} hover:text-brand ${FOCUS}`;
        return (
          // When a mobile group opens, its links fade down in sequence.
          <li
            key={label}
            style={{ transitionDelay: shown ? `${80 + i * 45}ms` : "0ms" }}
            className={`transition-[opacity,translate] duration-500 ease-out-soft motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"}`}
          >
            {href ? (
              <Link href={href} className={className}>
                {content}
              </Link>
            ) : (
              <button type="button" onClick={() => onUnavailable(label)} className={className}>
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Mobile: one group open at a time. Panels stay in the DOM so their height can animate
// (grid rows 0fr → 1fr, as in FaqList); a closed panel is inert.
function FooterAccordion({ onUnavailable }: { onUnavailable: (name: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const id = useId();
  return (
    <div data-reveal className="border-t border-divider xl:hidden">
      {GROUPS.map(({ title, links }, i) => {
        const isOpen = open === title;
        return (
          <div key={title} className="border-b border-divider">
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : title)}
                className={`flex min-h-[74px] w-full items-center justify-between gap-4 rounded-sm text-left text-h3-m text-navy ${FOCUS}`}
              >
                {title}
                <span
                  aria-hidden="true"
                  className={`flex size-8 items-center justify-center rounded-full transition-[background-color,color,rotate] ${EASE} ${isOpen ? "rotate-180 bg-navy text-white" : "bg-surface text-mid"}`}
                >
                  <svg width="12" height="8" viewBox="0 0 16 10" fill="none">
                    <path d="m2 2 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id={`${id}-${i}`}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ease-out-soft motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <nav aria-label={`Footer ${title}`} className="overflow-hidden">
                <div className="pb-5">
                  <FooterLinks links={links} shown={isOpen} onUnavailable={onUnavailable} />
                </div>
              </nav>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Social destinations are not supplied. Preserve the exported artwork and show the
// owner-approved availability notice rather than send visitors to invented profiles.
const SOCIAL_STYLE = `relative size-11 shrink-0 rounded-full transition-[translate] ${EASE} motion-safe:hover:-translate-y-1 ${FOCUS}`;

function Social({ onUnavailable }: { onUnavailable: (name: string) => void }) {
  return (
    <div className="flex items-center gap-2.5 xl:gap-3">
      <button type="button" onClick={() => onUnavailable("Facebook")} aria-label="Facebook" className={SOCIAL_STYLE}>
        <Image src="/icons/social-facebook.svg" alt="" fill className="object-contain" />
      </button>
      <button type="button" onClick={() => onUnavailable("Instagram")} aria-label="Instagram" className={SOCIAL_STYLE}>
        <Image src="/icons/social-instagram-bg.png" alt="" fill className="object-contain" />
        <span className="absolute inset-[30%]">
          <Image src="/icons/instagram-1.svg" alt="" fill />
          <span className="absolute inset-[11.91%_11.91%_76.37%_76.37%]">
            <Image src="/icons/instagram-2.svg" alt="" fill />
          </span>
          <span className="absolute inset-[23.63%]">
            <Image src="/icons/instagram-3.svg" alt="" fill />
          </span>
        </span>
      </button>
      <button type="button" onClick={() => onUnavailable("X")} aria-label="X" className={SOCIAL_STYLE}>
        <Image src="/icons/social-x.svg" alt="" fill className="object-contain" />
      </button>
    </div>
  );
}

export default function Footer() {
  const [notice, setNotice] = useState("");
  const unavailable = (name: string) => setNotice(`${name} details are coming soon. Contact hello@amortrav.com for help.`);

  return (
    <footer className="relative overflow-clip rounded-3xl bg-white px-5 pt-8 shadow-card xl:rounded-[32px] xl:px-14 xl:pt-14">
      <div data-stagger className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(240px,1fr)_repeat(4,max-content)] xl:gap-x-16">
        <div data-reveal className="flex flex-col items-start gap-3">
          <Link href="/" className={`inline-block rounded-sm ${FOCUS}`}>
            <Image src="/img/logo.png" alt="AMORTRAV home" width={140} height={29} className="h-auto w-[140px]" />
          </Link>
          <p className="text-caption-m text-mid">Smart luggage, paired to your phone.</p>
        </div>
        {GROUPS.map(({ title, links }) => (
          <nav key={title} data-reveal aria-label={`Footer ${title}`} className="hidden xl:block">
            <h2 className="mb-3 text-caption font-medium text-navy">{title}</h2>
            <FooterLinks links={links} onUnavailable={unavailable} />
          </nav>
        ))}
        <FooterAccordion onUnavailable={unavailable} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 xl:mt-14 xl:border-t xl:border-divider xl:pt-6">
        <p className="text-caption-m text-mid">
          <span className="xl:hidden">©2026 Amortrav</span>
          <span className="hidden xl:inline">©2026 Amortrav. All rights reserved.</span>
        </p>
        <Social onUnavailable={unavailable} />
      </div>
      <p role="status" className="mt-4 text-caption-m text-mid empty:hidden">
        {notice}
      </p>

      {/* Oversized wordmark, cropped by the card's bottom edge. */}
      <p
        aria-hidden="true"
        className="pointer-events-none mt-6 -mb-[0.2em] bg-linear-to-b from-blue-pale to-white bg-clip-text text-center text-[clamp(48px,17vw,232px)] leading-none font-bold tracking-[-0.05em] whitespace-nowrap text-transparent select-none xl:mt-10"
      >
        AMORTRAV
      </p>
    </footer>
  );
}
