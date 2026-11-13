import { AppPage } from "@/components/marketing/app-page";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/app", (m) => ({
  title: m.nav.app,
  description:
    "How the Amortrav app works: pair your bag, follow its journeys, weigh it and get alerts.",
}));

export default function Page() {
  return <AppPage />;
}
