import { FeaturesPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";

// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("/features", (m) => ({
  title: m.nav.features,
}));

export default function Page() {
  return <FeaturesPage />;
}
