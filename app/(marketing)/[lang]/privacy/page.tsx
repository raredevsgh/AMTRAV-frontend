import { PolicyPage } from "@/components/marketing/pages";
import { LEGAL_UPDATED, privacyPolicy } from "@/lib/legal";

export const metadata = { title: "Privacy Policy" };

export default function Page() {
  return <PolicyPage document={privacyPolicy} updated={LEGAL_UPDATED} eyebrow="Legal" />;
}
