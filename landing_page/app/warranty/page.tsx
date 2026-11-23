import type { Metadata } from "next";
import { warrantyPolicy } from "@/lib/policies";
import LegalView from "../_components/LegalView";

export const metadata: Metadata = {
  title: "Lifetime Functional Guarantee | Covered for All Years",
  description: "AMORTRAV Unconditional Lifetime Functional Guarantee — Covered for all years, free repairs and parts anytime across our global atelier network.",
};

export default function WarrantyPage() {
  return <LegalView doc={warrantyPolicy} />;
}
