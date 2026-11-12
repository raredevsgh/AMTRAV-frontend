import { AboutPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";

// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("/about", (m) => ({
  title: m.nav.about,
}));

export default function Page() {
  return <AboutPage />;
}
