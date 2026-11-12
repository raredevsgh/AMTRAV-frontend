import { PolicyPage } from "@/components/marketing/pages";
import { POLICIES_UPDATED, cookiePolicy } from "@/lib/policies";
import { localizedMetadata } from "@/lib/i18n/seo";

// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("/cookies", () => ({
  title: "Cookies",
}));

export default function Page() {
  return (
    <PolicyPage document={cookiePolicy} updated={POLICIES_UPDATED} eyebrow="Legal" />
  );
}
