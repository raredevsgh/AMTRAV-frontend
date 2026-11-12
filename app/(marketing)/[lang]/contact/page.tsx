import { ContactPage } from "@/components/marketing/contact-page";
import { localizedMetadata } from "@/lib/i18n/seo";

// Its title and language links come from the URL's language, as the layout's content does.
export const instant = false;
export const generateMetadata = localizedMetadata("/contact", (m) => ({
  title: m.nav.contact,
}));

export default function Page() {
  return <ContactPage />;
}
