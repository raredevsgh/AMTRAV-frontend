// Every page in every language, each listing its translations (hreflang), so search engines
// show people the page in their own language.
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { languageAlternates, sitePages, siteUrl } from "@/lib/i18n/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitePages.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: { languages: languageAlternates(path, true) },
    })),
  );
}
