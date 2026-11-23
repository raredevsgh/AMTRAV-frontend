import type { Metadata } from "next";
import { shippingPolicy } from "@/lib/policies";
import LegalView from "../_components/LegalView";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Worldwide priority shipping, delivery times and 30-day return policy.",
};

export default function ShippingReturnsPage() {
  return <LegalView doc={shippingPolicy} />;
}
