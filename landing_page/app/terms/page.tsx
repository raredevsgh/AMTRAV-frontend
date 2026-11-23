import type { Metadata } from "next";
import { termsOfUse } from "@/lib/legal";
import LegalView from "../_components/LegalView";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using AMORTRAV hardware and services.",
};

export default function TermsPage() {
  return <LegalView doc={termsOfUse} />;
}
