// The website in every language, as search engines and link previews see it. Each page names
// its canonical address and its translations (hreflang, with x-default for the address without
// a language, which sends visitors to theirs), and previews in the page's language. The same
// list feeds app/sitemap.ts.
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { messagesFor, type Messages } from "./index";
import { defaultLocale, isLocale, localeTags, locales, type Locale } from "./config";

/** The website's public address: absolute links in the sitemap, previews and canonical tags. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://amortrav.com"
).replace(/\/+$/, "");

/** Every page of the website that search engines should know, by its path after the language. */
export const sitePages = [
  "",
  "/features",
  "/how-it-works",
  "/for-brands",
  "/about",
  "/app",
  "/shop",
  "/contact",
  "/shipping-returns",
  "/warranty",
  "/privacy",
  "/terms",
  "/cookies",
  "/photo-credits",
] as const;
export type SitePage = (typeof sitePages)[number];

/** Open Graph writes locales as language_TERRITORY. */
const ogLocales: Record<Locale, string> = {
  en: "en_GB",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  "zh-hans": "zh_CN",
  "zh-hant": "zh_TW",
};

/** A page's address in each language, keyed by BCP 47 tag, plus x-default. */
export function languageAlternates(path: SitePage, absolute = false) {
  const base = absolute ? siteUrl : "";
  return {
    ...Object.fromEntries(
      locales.map((locale) => [localeTags[locale], `${base}/${locale}${path}`]),
    ),
    "x-default": `${base}${path || "/"}`,
  };
}

/**
 * A page's generateMetadata: what `page` returns for its language (a translated title, say),
 * plus its canonical address, its translations and an Open Graph locale. It reads the URL's
 * language, and every language's pages are built ahead of time.
 */
export function localizedMetadata(
  path: SitePage,
  page: (m: Messages) => Metadata = () => ({}),
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ lang: string }>;
  }): Promise<Metadata> {
    const { lang } = await params;
    const locale = isLocale(lang) ? lang : defaultLocale;
    const own = page(messagesFor(locale));
    return {
      ...own,
      alternates: { canonical: `/${locale}${path}`, languages: languageAlternates(path) },
      openGraph: {
        type: "website",
        siteName: brand.company,
        url: `/${locale}${path}`,
        locale: ogLocales[locale],
        alternateLocale: locales
          .filter((other) => other !== locale)
          .map((other) => ogLocales[other]),
        ...own.openGraph,
      },
    };
  };
}
