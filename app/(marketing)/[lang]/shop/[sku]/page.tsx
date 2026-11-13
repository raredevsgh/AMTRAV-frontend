import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductPage } from "@/components/shop/product";
import { brand } from "@/lib/brand";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { messagesFor } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string; sku: string }> };

// Its title comes from the URL, as the layout's content does.
export const instant = false;

/** The SKU names the bag ("flagship" → Flagship); its page loads the rest. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, sku } = await params;
  const m = messagesFor(isLocale(lang) ? lang : defaultLocale);
  const name = sku.replace(/-+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    title: `${brand.company} ${name} · ${m.nav.shop}`,
    alternates: { canonical: `/${lang}/shop/${sku}` },
  };
}

/** The bag comes from the link, so it's read inside Suspense. */
async function Product({ params }: Props) {
  const { sku } = await params;
  return <ProductPage sku={sku} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<div className="trace shop" aria-busy="true" />}>
      <Product {...props} />
    </Suspense>
  );
}
