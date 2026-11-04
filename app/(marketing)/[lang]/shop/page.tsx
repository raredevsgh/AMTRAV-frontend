import { Shop } from "@/components/shop/shop";
import { brand } from "@/lib/brand";

export const metadata = {
  title: "Shop",
  description: `Buy a ${brand.company} bag with the ${brand.core} inside. Secure checkout, tracked shipping.`,
};

export default function Page() {
  return <Shop />;
}
