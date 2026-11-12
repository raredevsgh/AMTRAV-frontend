import { HowItWorksPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";
// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("/how-it-works", (m) => ({
  title: m.nav.how,
}));
export default function Page() {
  return <HowItWorksPage />;
}
