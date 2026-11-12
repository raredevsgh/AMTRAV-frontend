import { notFound } from "next/navigation";
import { SiteShell } from "@/components/marketing/site-shell";
import { I18nProvider } from "@/lib/i18n/client";
import { brand } from "@/lib/brand";
import { isLocale, localeTags, locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/i18n/seo";

/**
 * The language decides every word on the page, so there's no language-free shell to show
 * first; each language's pages are built ahead of time, so waiting for it costs nothing.
 */
export const instant = false;

/** Every page is built in each language ahead of time. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** Who publishes the site, for search engines (schema.org), in every language it's written in. */
const structuredData = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.company,
    url: siteUrl,
    logo: `${siteUrl}${brand.logos.mark}`,
    email: brand.email,
    sameAs: Object.values(brand.social).filter(Boolean),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.company,
    url: siteUrl,
    inLanguage: locales.map((locale) => localeTags[locale]),
  },
]).replace(/</g, "\\u003c");

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    // The whole page is in this language. The root <html> is shared with the console, so the
    // script sets its lang before anything is read aloud or offered for translation (WCAG
    // 3.1.1); I18nProvider keeps it right as visitors move between languages.
    <div lang={localeTags[lang]}>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(localeTags[lang])}`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <I18nProvider locale={lang}>
        <SiteShell>{children}</SiteShell>
      </I18nProvider>
    </div>
  );
}
