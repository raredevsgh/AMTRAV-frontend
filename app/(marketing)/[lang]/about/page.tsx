import { AboutPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/about", (m) => ({
  title: m.nav.about,
}));

export default function Page() {
  return <AboutPage />;
}
