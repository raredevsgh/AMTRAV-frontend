// The website's languages, the same six as the app. The language is the first part of every
// marketing URL (/fr/shop); visitors arriving without one are sent to the language they
// chose before (a cookie), else the first their browser asks for, else English.

export const locales = ["en", "es", "fr", "de", "zh-hans", "zh-hant"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Remembers a language picked in the switcher, for a year. */
export const LOCALE_COOKIE = "amortrav_lang";

/** Each language in its own name, for the switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  "zh-hans": "简体中文",
  "zh-hant": "繁體中文",
};

/** The BCP 47 tag for `lang` attributes and Intl formatting. */
export const localeTags: Record<Locale, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
};

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

/** The site's language for a browser tag such as "fr-CA", "zh-TW" or "zh-Hans-CN". */
function fromTag(tag: string): Locale | null {
  const parts = tag.trim().toLowerCase().split(/[-_]/);
  if (parts[0] === "zh")
    return parts.includes("hant") ||
      parts.some((part) => ["tw", "hk", "mo"].includes(part))
      ? "zh-hant"
      : "zh-hans";
  return isLocale(parts[0]) ? parts[0] : null;
}

/** The best language for an Accept-Language header, honouring its q-values. */
export function negotiate(header: string | null): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.split(";");
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      return { tag, weight: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  for (const entry of ranked) {
    const locale = fromTag(entry.tag);
    if (locale) return locale;
  }
  return defaultLocale;
}

/** A marketing path in a language: ("fr", "/shop") → "/fr/shop". Hash-only and external links pass through. */
export function localize(locale: Locale, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const rest = href.replace(/^\/(en|es|fr|de|zh-hans|zh-hant)(?=\/|$|#|\?)/, "");
  if (rest === "" || rest === "/") return `/${locale}`;
  if (rest.startsWith("/#")) return `/${locale}${rest.slice(1)}`;
  return `/${locale}${rest}`;
}
