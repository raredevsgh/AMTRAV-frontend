// The website is for search engines; the console, sign-in, the API and buyers' order pages
// are not.
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/i18n/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/console",
        "/preview",
        "/sign-in",
        "/forgot-password",
        "/account-help",
        "/api/",
        "/*/shop/orders/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
