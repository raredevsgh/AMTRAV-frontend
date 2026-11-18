import type { Metadata } from "next";
import { warrantyPolicy } from "@/lib/policies";
import LegalView from "../_components/LegalView";

export const metadata: Metadata = {
  title: "Warranty Policy",
  description: "AMORTRAV 5-year hardware and shell warranty coverage.",
};

export default function WarrantyPage() {
  return <LegalView doc={warrantyPolicy} />;
}
