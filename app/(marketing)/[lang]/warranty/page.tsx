import { PolicyPage } from "@/components/marketing/pages";
import { POLICIES_UPDATED, warrantyPolicy } from "@/lib/policies";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/warranty", () => ({
  title: "Warranty",
}));

export default function Page() {
  return (
    <PolicyPage document={warrantyPolicy} updated={POLICIES_UPDATED} eyebrow="Support" />
  );
}
