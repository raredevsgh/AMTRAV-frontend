import { FeaturesPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/features", (m) => ({
  title: m.nav.features,
}));

export default function Page() {
  return <FeaturesPage />;
}
