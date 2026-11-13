import { ForBrandsPage } from "@/components/marketing/pages";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/for-brands", (m) => ({
  title: m.nav.brands,
}));

export default function Page() {
  return <ForBrandsPage />;
}
