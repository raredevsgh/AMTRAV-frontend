"use client";

// The header's grouped navigation (Product, Company) and the language-and-appearance panel
// behind the globe: one control for where you are and how the site looks.
import Image from "next/image";
import Link from "next/link";
import { DropdownMenu, Popover } from "radix-ui";
import { ArrowRight, Check, ChevronDown, Globe } from "lucide-react";
import { localeNames, locales, localeTags, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n";
import { useChooseLocale } from "./language-switcher";
import { themeIcons, themes, useTheme } from "./theme-switcher";

type NavKey = keyof Messages["nav"];
type Entry = { href: string; label: NavKey; body: NavKey };

export const menus: { label: NavKey; entries: Entry[]; photo?: boolean }[] = [
  {
    label: "product",
    photo: true,
    entries: [
      { href: "/#features", label: "features", body: "featuresBody" },
      { href: "/#how", label: "how", body: "howBody" },
      { href: "/#range", label: "range", body: "rangeBody" },
      { href: "/app", label: "app", body: "appBody" },
    ],
  },
  {
    label: "company",
    entries: [
      { href: "/for-brands", label: "brands", body: "brandsBody" },
      { href: "/about", label: "about", body: "aboutBody" },
      { href: "/contact", label: "contact", body: "contactBody" },
    ],
  },
];

export function NavMenu({
  label,
  entries,
  photo,
  path,
}: {
  label: NavKey;
  entries: Entry[];
  photo?: boolean;
  path: string | null;
}) {
  const { m, href } = useI18n();
  const current = entries.some((entry) => path === href(entry.href));
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="nav-trigger" data-current={current || undefined}>
        {m.nav[label]}
        <ChevronDown size={15} aria-hidden="true" className="nav-chevron" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`nav-menu${photo ? " with-photo" : ""}`}
          align="start"
          sideOffset={14}
        >
          <div className="nav-menu-list">
            {entries.map(({ href: to, label: title, body }) => (
              <DropdownMenu.Item key={to} asChild>
                <Link
                  href={href(to)}
                  className="nav-menu-item"
                  aria-current={path === href(to) ? "page" : undefined}
                >
                  <span>
                    <strong>{m.nav[title]}</strong>
                    <small>{m.nav[body]}</small>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" className="nav-menu-arrow" />
                </Link>
              </DropdownMenu.Item>
            ))}
          </div>
          {photo ? (
            <figure className="nav-menu-photo">
              <Image src="/images/airliner.jpg" alt="" fill sizes="220px" />
              <figcaption>{m.nav.photoCaption}</figcaption>
            </figure>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Short names for the trigger: the language's own code or character. */
const short: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  "zh-hans": "简",
  "zh-hant": "繁",
};

/** Each language's name in the reader's language ("French", "法语"), under its own name. */
function inReadersLanguage(code: Locale, reader: string) {
  try {
    return (
      new Intl.DisplayNames([reader], { type: "language" }).of(localeTags[code]) ?? ""
    );
  } catch {
    return "";
  }
}

export function LocaleMenu() {
  const { m, locale, tag } = useI18n();
  const chooseLocale = useChooseLocale();
  const [theme, chooseTheme] = useTheme();
  const themeLabels = {
    system: m.theme.auto,
    light: m.theme.light,
    dark: m.theme.dark,
  };
  return (
    <Popover.Root>
      <Popover.Trigger
        className="locale-trigger"
        aria-label={`${m.nav.preferences}: ${localeNames[locale]}`}
      >
        <Globe size={17} aria-hidden="true" />
        <span lang={locale}>{short[locale]}</span>
        <ChevronDown size={14} aria-hidden="true" className="nav-chevron" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="locale-menu"
          align="end"
          sideOffset={14}
          aria-label={m.nav.preferences}
        >
          <p className="locale-heading">{m.nav.language}</p>
          <div className="locale-list" role="group" aria-label={m.nav.language}>
            {locales.map((code) => {
              const translated = inReadersLanguage(code, tag);
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={code === locale}
                  onClick={() => code !== locale && chooseLocale(code)}
                >
                  <span className="locale-name">
                    <strong lang={code}>{localeNames[code]}</strong>
                    {translated &&
                    translated.toLowerCase() !== localeNames[code].toLowerCase() ? (
                      <small>{translated}</small>
                    ) : null}
                  </span>
                  {code === locale ? (
                    <Check size={16} aria-hidden="true" className="locale-check" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="locale-heading">{m.nav.appearance}</p>
          <div className="theme-segments" role="group" aria-label={m.nav.appearance}>
            {themes.map((value) => {
              const Icon = themeIcons[value];
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={theme === value}
                  onClick={() => chooseTheme(value)}
                >
                  <Icon size={15} aria-hidden="true" />
                  {themeLabels[value]}
                </button>
              );
            })}
          </div>
          <p className="locale-note">{m.nav.saved}</p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
