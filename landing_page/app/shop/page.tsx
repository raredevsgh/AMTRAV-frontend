import type { Metadata } from "next";
import ShopView from "./ShopView";

export const metadata: Metadata = {
  title: "Shop Luxury Luggage & Suede Bags | AMTRAV",
  description:
    "Pick your AMTRAV luggage. Explore cabin and check-in sizes, the Trunk 90, and the handcrafted Suede & Aluminium Duffel Side Bag. Real-time 3D preview and pre-orders.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return <ShopView />;
}