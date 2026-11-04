import { PolicyPage } from "@/components/marketing/pages";
import { POLICIES_UPDATED, warrantyPolicy } from "@/lib/policies";

export const metadata = { title: "Warranty" };

export default function Page() {
  return <PolicyPage document={warrantyPolicy} updated={POLICIES_UPDATED} eyebrow="Support" />;
}
