import type { Metadata } from "next";
import { cookiePolicy } from "@/lib/policies";
import LegalView from "../_components/LegalView";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "AMORTRAV zero-tracking cookie transparency policy.",
};

export default function CookiesPage() {
  return <LegalView doc={cookiePolicy} />;
}
