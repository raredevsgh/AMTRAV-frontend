import { notFound } from "next/navigation";
import { SiteShell } from "@/components/marketing/site-shell";
import { I18nProvider } from "@/lib/i18n/client";
import { isLocale, localeTags, locales } from "@/lib/i18n/config";

/**
 * The language decides every word on the page, so there's no language-free shell to show
 * first; each language's pages are built ahead of time, so waiting for it costs nothing.
 */
export const instant = false;

/** Every page is built in each language ahead of time. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function MarketingLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    // The whole page is in this language; the root <html> is shared with the console.
    <div lang={localeTags[lang]}>
      <I18nProvider locale={lang}>
        <SiteShell>{children}</SiteShell>
      </I18nProvider>
    </div>
  );
}
