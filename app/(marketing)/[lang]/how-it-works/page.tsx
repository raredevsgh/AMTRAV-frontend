import { HowItWorksPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";
export const generateMetadata = localizedMetadata("/how-it-works", (m) => ({
  title: m.nav.how,
}));
export default function Page() {
  return <HowItWorksPage />;
}
