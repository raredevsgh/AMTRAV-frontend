import { PolicyPage } from "@/components/marketing/pages";
import { LEGAL_UPDATED, termsOfUse } from "@/lib/legal";

export const metadata = { title: "Terms of Use" };

export default function Page() {
  return <PolicyPage document={termsOfUse} updated={LEGAL_UPDATED} eyebrow="Legal" />;
}
