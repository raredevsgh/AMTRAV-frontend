import { TraceLanding } from "@/components/marketing/trace-landing";
import { brand } from "@/lib/brand";
import { localizedMetadata } from "@/lib/i18n/seo";

// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("", () => ({
  title: `${brand.product}: ${brand.tagline}`,
  description: `${brand.shortProduct} is the ${brand.core} inside every ${brand.company} bag: a journey log, impact detection, accurate weight, location and separation alerts, tamper security and a Travel-Ready check, in one app.`,
  openGraph: {
    title: brand.product,
    description: brand.tagline,
    images: [{ url: "/images/trace/hero-pair.jpg", width: 1920, height: 1080 }],
  },
}));

export default function Page() {
  return <TraceLanding />;
}
