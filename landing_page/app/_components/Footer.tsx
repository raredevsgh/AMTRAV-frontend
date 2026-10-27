"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
const LINK_STYLE =
  "inline-block min-h-8 rounded-sm py-1 text-left text-small xl:text-caption text-mid hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function FooterLinks({
  links,
  onUnavailable,
}: {
  links: readonly FooterLink[];
  onUnavailable: (name: string) => void;
}) {
  return (
    <ul>
      {links.map(({ label, href }) => (
        <li key={label}>
          {href ? (
            <Link href={href} className={LINK_STYLE}>
              {label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onUnavailable(label)}
              className={LINK_STYLE}
            >
              {label}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

// Social destinations are not supplied. Preserve the exported artwork and show the
// owner-approved availability notice rather than send visitors to invented profiles.
function Social({ onUnavailable }: { onUnavailable: (name: string) => void }) {
  return (
    <div className="flex items-center gap-2.5 xl:gap-5">
      <button
        type="button"
        onClick={() => onUnavailable("Facebook")}
        aria-label="Facebook"
        className="relative size-11 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Image
          src="/icons/social-facebook.svg"
          alt=""
          fill
          className="object-contain"
        />
      </button>
      <button
        type="button"
        onClick={() => onUnavailable("Instagram")}
        aria-label="Instagram"
        className="relative size-11 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Image
          src="/icons/social-instagram-bg.png"
          alt=""
          fill
          className="object-contain"
        />
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
      <button
        type="button"
        onClick={() => onUnavailable("X")}
        aria-label="X"
        className="relative size-11 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Image
          src="/icons/social-x.svg"
          alt=""
          fill
          className="object-contain"
        />
      </button>
    </div>
  );
}

export default function Footer() {
  const [notice, setNotice] = useState("");
  const unavailable = (name: string) =>
    setNotice(
      `${name} details are coming soon. Contact hello@amortrav.com for help.`,
    );
  return (
    <footer className="border-t border-divider px-5 pt-5 pb-4 xl:pt-10 xl:px-14">
      <div className="hidden grid-cols-[minmax(180px,1fr)_repeat(4,max-content)] gap-18 xl:grid">
        <div>
          <Link
            href="/"
            className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Image
              src="/img/logo.png"
              alt="AMORTRAV home"
              width={120}
              height={25}
              className="h-auto w-[120px]"
            />
          </Link>
          <p className="mt-3 text-caption-m text-mid">
            Smart luggage, paired to your phone.
          </p>
        </div>
        {GROUPS.map(({ title, links }) => (
          <nav key={title} aria-label={`Footer ${title}`}>
            <h2 className="mb-3 text-caption font-medium text-navy">{title}</h2>
            <FooterLinks links={links} onUnavailable={unavailable} />
          </nav>
        ))}
      </div>
      <div className="xl:hidden">
        {GROUPS.map(({ title, links }) => (
          <details key={title} className="group border-b border-divider">
            <summary className="flex min-h-[74px] cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 text-h3-m text-navy focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
              {title}
              <svg
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                aria-hidden="true"
                className="text-mid transition-transform group-open:rotate-180 motion-reduce:transition-none"
              >
                <path
                  d="m2 2 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <nav aria-label={`Footer ${title}`} className="pb-4">
              <FooterLinks links={links} onUnavailable={unavailable} />
            </nav>
          </details>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 xl:mt-8 xl:border-t xl:border-divider xl:pt-5">
        <p className="text-caption-m text-mid">
          <span className="xl:hidden">©2026 Amortrav</span>
          <span className="hidden xl:inline">
            ©2026 Amortrav. All rights reserved.
          </span>
        </p>
        <Social onUnavailable={unavailable} />
      </div>
      <p role="status" className="mt-4 text-caption-m text-mid empty:hidden">
        {notice}
      </p>
    </footer>
  );
}
