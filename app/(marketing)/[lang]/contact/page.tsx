import { ContactPage } from "@/components/marketing/contact-page";
import { localizedMetadata } from "@/lib/i18n/seo";

export const generateMetadata = localizedMetadata("/contact", (m) => ({
  title: m.nav.contact,
}));

export default function Page() {
  return <ContactPage />;
}
