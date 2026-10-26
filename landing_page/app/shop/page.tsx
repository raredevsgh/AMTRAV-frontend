import type { Metadata } from "next";
import Link from "next/link";
import Button from "../_components/Button";
import { GET_THE_APP_HREF, NAV_LINKS } from "../_components/nav";
import ProductVideo from "./ProductVideo";

export const metadata: Metadata = {
  title: "Shop",
  description: "Preview AMORTRAV luggage. Purchasing is not available yet.",
  alternates: { canonical: "/shop" },
};

// Owner-approved preview scope while the complete Shop Figma frame remains inaccessible.
// No prices, specifications, inventory or checkout are inferred from the product footage.
export default function ShopPage() {
  return (
    <>
      <section aria-label="AMORTRAV luggage preview" className="overflow-hidden rounded-3xl bg-navy xl:rounded-[32px]">
        <ProductVideo />
      </section>
      <section className="flex flex-col gap-6 px-5 py-8 xl:flex-row xl:items-start xl:justify-between xl:gap-16 xl:px-14 xl:py-12">
        <div className="flex max-w-[640px] flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-caption text-mid">
            <Link href="/" className="rounded-sm hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-navy">Shop</span>
          </nav>
          <h1 className="text-h1-m font-bold text-navy xl:text-h1">AMORTRAV luggage</h1>
          <p className="text-small text-mid xl:text-body">A closer look at AMORTRAV. Purchasing is not available yet.</p>
          <div><Button href={GET_THE_APP_HREF} label="Join the list" arrow /></div>
        </div>
        <nav aria-label="Explore AMORTRAV" className="flex flex-wrap gap-3 xl:max-w-[420px] xl:justify-end">
          {NAV_LINKS.map(({ href, label }) => <Button key={href} href={href} label={label} style="white" size="s" />)}
        </nav>
      </section>
    </>
  );
}
