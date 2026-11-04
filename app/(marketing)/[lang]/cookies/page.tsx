import { PolicyPage } from "@/components/marketing/pages";
import { POLICIES_UPDATED, cookiePolicy } from "@/lib/policies";

export const metadata = { title: "Cookies" };

export default function Page() {
  return <PolicyPage document={cookiePolicy} updated={POLICIES_UPDATED} eyebrow="Legal" />;
}
