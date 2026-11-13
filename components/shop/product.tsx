"use client";
// A bag's own page in the shop: the bag large on its stage, then its name, price and stock,
// what it is, how many (1 to 3, within what's in stock), and either into the cart or straight
// to checkout. Below, the details and the other bags.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Globe, ShieldCheck, Truck } from "lucide-react";
import { brand } from "@/lib/brand";
import { format } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { MAX_QUANTITY, money, useBag, useProducts, type ShopProduct } from "@/lib/shop";
import { openCart } from "./cart";
import { ProductTile, SHIPPING_COUNTRIES, StockLine } from "./shop";
import "@/app/trace.css";
import "@/app/shop.css";

export function ProductPage({ sku }: { sku: string }) {
  const { m, href } = useI18n();
  const { products, error } = useProducts();
  const product = products?.find((item) => item.sku === sku);

  if (error || (products && !product)) {
    return (
      <div className="trace shop">
        <section className="trace-panel product-missing">
          <p>{error ? m.shop.loadError : m.shop.notFound}</p>
          <Link className="trace-button ghost-ink small" href={href("/shop")}>
            <ArrowLeft size={16} /> {m.shop.allBags}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="trace shop">
      <section className="trace-panel product">
        <Link className="product-back" href={href("/shop")}>
          <ArrowLeft size={16} /> {m.shop.allBags}
        </Link>
        {product ? <Product key={product.sku} product={product} /> : <div className="product-skeleton" aria-busy="true" />}
      </section>
      {products && product && products.length > 1 ? (
        <section className="trace-panel soft product-more">
          <h2>{m.shop.allBags}</h2>
          <div className="shop-grid">
            {products
              .filter((other) => other.sku !== product.sku)
              .slice(0, 4)
              .map((other) => (
                <ProductTile key={other.sku} product={other} />
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Product({ product }: { product: ShopProduct }) {
  const { m, tag, href } = useI18n();
  const router = useRouter();
  const { bag, set } = useBag();
  const inCart = bag[product.sku] ?? 0;
  const soldOut = product.available === 0;
  const most = Math.min(MAX_QUANTITY, product.available);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const range = brand.range.find((item) => item.name.toLowerCase() === product.name.toLowerCase());

  function add(then: "cart" | "checkout") {
    setNote("");
    // Buying now means this many; adding puts them with any already in the cart.
    const chosen = Math.min(quantity, most);
    const next = then === "checkout" ? chosen : Math.min(most, inCart + chosen);
    if (!set(product.sku, next)) {
      setNote(m.shop.full);
      return;
    }
    if (then === "checkout") router.push(href("/shop/checkout"));
    else openCart();
  }

  return (
    <div className="product-layout">
      <div className={`trace-range-image product-stage${soldOut ? " out" : ""}`}>
        {product.image ? (
          <Image
            src={product.image}
            alt={`${brand.company} ${product.name}`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
            unoptimized={product.image.startsWith("/api/")}
          />
        ) : null}
      </div>

      <div className="product-info">
        <span className="trace-eyebrow">{brand.company}</span>
        <h1>{product.name}</h1>
        <p className="product-price">{money(product.price_minor, product.currency, tag)}</p>
        <StockLine product={product} />
        <p className="product-description">{product.description}</p>

        <fieldset className="product-quantity" disabled={soldOut}>
          <legend>{m.shop.quantityLabel}</legend>
          <div role="radiogroup" aria-label={m.shop.quantityLabel}>
            {Array.from({ length: MAX_QUANTITY }, (_, index) => index + 1).map((count) => (
              <button
                key={count}
                type="button"
                role="radio"
                aria-checked={quantity === count}
                disabled={count > most}
                onClick={() => setQuantity(count)}
              >
                {count}
              </button>
            ))}
          </div>
          <small>{format(m.shop.perOrder, { count: MAX_QUANTITY })}</small>
        </fieldset>

        <div className="product-actions">
          <button type="button" className="trace-button ink" disabled={soldOut} onClick={() => add("cart")}>
            {soldOut ? m.shop.soldOut : m.shop.add}
          </button>
          <button type="button" className="trace-button ghost-ink" disabled={soldOut} onClick={() => add("checkout")}>
            {m.shop.buyNow}
          </button>
        </div>
        {note ? (
          <p className="product-note" role="alert">
            {note}
          </p>
        ) : null}

        <ul className="shop-promises product-promises">
          <li>
            <ShieldCheck size={18} /> {m.shop.payments}
          </li>
          <li>
            <Truck size={18} /> {format(m.shop.tracked, { count: SHIPPING_COUNTRIES })}
          </li>
          <li>
            <Globe size={18} /> {format(m.shop.prices, { currency: product.currency.toUpperCase() })}
          </li>
        </ul>

        <h2 className="product-details-title">{m.shop.details}</h2>
        <dl className="product-details">
          {range ? (
            <>
              <div>
                <dt>{m.shop.shell}</dt>
                <dd>{range.shell}</dd>
              </div>
              <div>
                <dt>{m.shop.size}</dt>
                <dd>{range.size}</dd>
              </div>
            </>
          ) : null}
          <div>
            <dt>{m.shop.inside}</dt>
            <dd>{format(m.shop.insideValue, { core: brand.core })}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
