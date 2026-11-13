import { PolicyPage } from "@/components/marketing/pages";
import { POLICIES_UPDATED, shippingPolicy } from "@/lib/policies";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/shipping-returns", () => ({
  title: "Shipping & returns",
}));

export default function Page() {
  return (
    <PolicyPage document={shippingPolicy} updated={POLICIES_UPDATED} eyebrow="Support" />
  );
}
