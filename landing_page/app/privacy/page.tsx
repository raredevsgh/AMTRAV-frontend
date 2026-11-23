import type { Metadata } from "next";
import { privacyPolicy } from "@/lib/legal";
import LegalView from "../_components/LegalView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AMORTRAV privacy policy and data governance practices.",
};

export default function PrivacyPage() {
  return <LegalView doc={privacyPolicy} />;
}
