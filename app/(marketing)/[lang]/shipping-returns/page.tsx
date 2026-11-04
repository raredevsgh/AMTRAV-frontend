import { PolicyPage } from "@/components/marketing/pages";
import { POLICIES_UPDATED, shippingPolicy } from "@/lib/policies";

export const metadata = { title: "Shipping & returns" };

export default function Page() {
  return <PolicyPage document={shippingPolicy} updated={POLICIES_UPDATED} eyebrow="Support" />;
}
