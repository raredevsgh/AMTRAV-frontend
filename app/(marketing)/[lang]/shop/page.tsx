import { Shop } from "@/components/shop/shop";
import { brand } from "@/lib/brand";
import { localizedMetadata } from "@/lib/i18n/seo";

// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("/shop", (m) => ({
  title: m.nav.shop,
  description: `Buy a ${brand.company} bag with the ${brand.core} inside. Secure checkout, tracked shipping.`,
}));

export default function Page() {
  return <Shop />;
}
