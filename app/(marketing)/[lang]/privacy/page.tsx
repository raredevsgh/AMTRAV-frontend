import { PolicyPage } from "@/components/marketing/pages";
import { LEGAL_UPDATED, privacyPolicy } from "@/lib/legal";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/privacy", () => ({
  title: "Privacy Policy",
}));

export default function Page() {
  return <PolicyPage document={privacyPolicy} updated={LEGAL_UPDATED} eyebrow="Legal" />;
}
