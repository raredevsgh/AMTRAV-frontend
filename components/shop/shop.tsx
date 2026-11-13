"use client";
// The shop: the range with live stock. Each bag opens its own page (product.tsx), where it's
// added to the cart (cart.tsx); checkout has its own page too (checkout.tsx).
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { format } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { money, useBag, useProducts, type ShopProduct } from "@/lib/shop";
import "@/app/trace.css";
import "@/app/shop.css";

/** How many countries checkout ships to (SHOP_SHIPPING_COUNTRIES on the API). */
export const SHIPPING_COUNTRIES = Number(process.env.NEXT_PUBLIC_SHOP_COUNTRIES) || 13;

/** In stock, only a few left, or sold out, with a dot in the matching colour. */
export function StockLine({ product }: { product: ShopProduct }) {
  const { m } = useI18n();
  const soldOut = product.available === 0;
  const few = !soldOut && product.available <= 5;
  return (
    <p className={`shop-stock${soldOut ? " out" : few ? " few" : ""}`}>
      {soldOut ? m.shop.soldOut : few ? format(m.shop.onlyLeft, { count: product.available }) : m.shop.inStock}
    </p>
  );
}

/** A bag on the shelf: its photo, name and price, linking to its page. */
export function ProductTile({ product }: { product: ShopProduct }) {
  const { tag, href } = useI18n();
  const { bag } = useBag();
  const soldOut = product.available === 0;
  return (
    <Link href={href(`/shop/${product.sku}`)} className={`shop-item${soldOut ? " out" : ""}`}>
      <div className="trace-range-image shop-item-image">
        {product.image ? (
          <Image
            src={product.image}
            alt={`${brand.company} ${product.name}`}
            fill
            sizes="(max-width: 700px) 50vw, 25vw"
            unoptimized={product.image.startsWith("/api/")}
          />
        ) : null}
        {bag[product.sku] ? <span className="shop-item-flag">× {bag[product.sku]}</span> : null}
      </div>
      <div className="shop-item-head">
        <h3>{product.name}</h3>
        <p className="shop-price">{money(product.price_minor, product.currency, tag)}</p>
      </div>
      <p className="shop-item-body">{product.description}</p>
      <StockLine product={product} />
    </Link>
  );
}

export function Shop() {
  const { m } = useI18n();
  const { products, error } = useProducts();
  return (
    <div className="trace shop">
      <section className="trace-panel">
        <header className="trace-head">
          <span className="trace-eyebrow">{m.shop.eyebrow}</span>
          <h1 className="shop-title">{format(m.shop.title, { core: brand.core })}</h1>
          <p>{format(m.shop.body, { core: brand.core })}</p>
        </header>

        {error ? (
          <p className="shop-note" role="alert">
            {m.shop.loadError}
          </p>
        ) : !products ? (
          <div className="shop-grid" aria-busy="true">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="shop-skeleton" />
            ))}
          </div>
        ) : (
          <div className="shop-grid">
            {products.map((product) => (
              <ProductTile key={product.sku} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
