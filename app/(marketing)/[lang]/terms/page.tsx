import { PolicyPage } from "@/components/marketing/pages";
import { LEGAL_UPDATED, termsOfUse } from "@/lib/legal";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/terms", () => ({
  title: "Terms of Use",
}));

export default function Page() {
  return <PolicyPage document={termsOfUse} updated={LEGAL_UPDATED} eyebrow="Legal" />;
}
