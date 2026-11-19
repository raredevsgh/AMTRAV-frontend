import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Suitcases & Smart Bags | AMTRAV Luxury Travel",
  description:
    "Explore the AMTRAV luxury luggage collection. Original aluminium cases, essential polycarbonate, and the handcrafted Suede & Aluminium Duffel Side Bag. With integrated TRACE smart core and lifetime guarantee.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return <ShopClient />;
}