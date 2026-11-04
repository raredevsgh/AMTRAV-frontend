import type { Metadata } from "next";
import { TraceLanding } from "@/components/marketing/trace-landing";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.product}: ${brand.tagline}`,
  description: `${brand.shortProduct} is the ${brand.core} inside every ${brand.company} bag: a journey log, impact detection, accurate weight, location and separation alerts, tamper security and a Travel-Ready check, in one app.`,
  openGraph: {
    title: brand.product,
    description: brand.tagline,
    images: [{ url: "/images/trace/hero-pair.jpg", width: 1920, height: 1080 }],
  },
};

export default function Page() {
  return <TraceLanding />;
}
