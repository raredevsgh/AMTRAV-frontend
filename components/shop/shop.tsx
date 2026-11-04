"use client";

// The shop: the range with live stock, a cart, and checkout on the payment provider's page.
// Each checkout attempt has an Idempotency-Key kept for that cart, so a double click, a
// refresh or a retry after a network error reuses the same order instead of making another.
import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Globe, LoaderCircle, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { brand } from "@/lib/brand";
import { format } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import "@/app/trace.css";
import "@/app/shop.css";

export type ShopProduct = {
  sku: string;
  name: string;
  description: string;
  image: string | null;
  price_minor: number;
  currency: string;
  available: number;
};

type CheckoutResponse = {
  order_id: string;
  status: string;
  checkout_url: string | null;
  order_url: string;
};

const MAX_QUANTITY = 3;
const KEY_STORE = "amortrav.shop.attempt";

export function money(minor: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);
}

/** The key for this exact cart: the same until the cart changes or the attempt is finished. */
function attemptKey(signature: string, fresh = false) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY_STORE) ?? "null") as { signature: string; key: string } | null;
    if (!fresh && saved?.signature === signature) return saved.key;
    const key = `web-${crypto.randomUUID()}`;
    sessionStorage.setItem(KEY_STORE, JSON.stringify({ signature, key }));
    return key;
  } catch {
    return `web-${crypto.randomUUID()}`;
  }
}

async function post(items: { sku: string; quantity: number }[], email: string, key: string) {
  const response = await fetch("/api/shop/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": key },
    body: JSON.stringify({ email, items }),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

/** How many countries checkout ships to (SHOP_SHIPPING_COUNTRIES on the API). */
const SHIPPING_COUNTRIES = Number(process.env.NEXT_PUBLIC_SHOP_COUNTRIES) || 13;

export function Shop() {
  const { m, tag } = useI18n();
  const [products, setProducts] = useState<ShopProduct[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/shop/products")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((list: ShopProduct[]) => active && setProducts(list))
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, quantity]) => quantity > 0)
        .map(([sku, quantity]) => ({ sku, quantity }))
        .sort((a, b) => a.sku.localeCompare(b.sku)),
    [cart],
  );
  const lines = items.map((item) => ({ ...item, product: products?.find((product) => product.sku === item.sku) }));
  const currency = lines[0]?.product?.currency ?? "usd";
  const total = lines.reduce((sum, line) => sum + (line.product?.price_minor ?? 0) * line.quantity, 0);

  function change(product: ShopProduct, by: number) {
    setError("");
    setCart((current) => {
      const next = Math.max(0, Math.min(MAX_QUANTITY, product.available, (current[product.sku] ?? 0) + by));
      return { ...current, [product.sku]: next };
    });
  }

  async function checkout(event: FormEvent) {
    event.preventDefault();
    if (busy || items.length === 0) return;
    setBusy(true);
    setError("");
    const signature = JSON.stringify({ email: email.trim().toLowerCase(), items });
    try {
      let { response, body } = await post(items, email, attemptKey(signature));
      // This cart's last attempt is over (cancelled or expired): start a new one.
      if (response.ok && !(body as CheckoutResponse).checkout_url && (body as CheckoutResponse).status !== "pending") {
        ({ response, body } = await post(items, email, attemptKey(signature, true)));
      }
      if (response.ok && (body as CheckoutResponse).checkout_url) {
        window.location.assign((body as CheckoutResponse).checkout_url!);
        return;
      }
      setError(response.status === 409 ? m.shop.soldOutError : m.shop.startError);
    } catch {
      setError(m.shop.unreachable);
    }
    setBusy(false);
  }

  return (
    <div className="trace shop">
      <section className="trace-panel">
        <header className="trace-head">
          <span className="trace-eyebrow">{m.shop.eyebrow}</span>
          <h1 className="shop-title">{format(m.shop.title, { core: brand.core })}</h1>
          <p>{format(m.shop.body, { core: brand.core })}</p>
        </header>

        {loadError ? (
          <p className="shop-note" role="alert">
            {m.shop.loadError}
          </p>
        ) : !products ? (
          <div className="trace-range" aria-busy="true">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="trace-range-card shop-skeleton" />
            ))}
          </div>
        ) : (
          <div className="trace-range">
            {products.map((product) => {
              const quantity = cart[product.sku] ?? 0;
              const soldOut = product.available === 0;
              return (
                <article key={product.sku} className="trace-range-card shop-card">
                  <div className="trace-range-image">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={`${brand.company} ${product.name}`}
                        fill
                        sizes="(max-width: 700px) 50vw, 25vw"
                        unoptimized={product.image.startsWith("/api/")}
                      />
                    ) : null}
                  </div>
                  <h3>{product.name}</h3>
                  <p className="shop-price">{money(product.price_minor, product.currency, tag)}</p>
                  <p>{product.description}</p>
                  <p className={`shop-stock${soldOut ? " out" : ""}`}>
                    {soldOut ? m.shop.soldOut : product.available <= 5 ? format(m.shop.onlyLeft, { count: product.available }) : m.shop.inStock}
                  </p>
                  <div className="shop-quantity" aria-label={format(m.shop.quantity, { name: product.name })}>
                    <button
                      type="button"
                      aria-label={format(m.shop.fewer, { name: product.name })}
                      disabled={quantity === 0}
                      onClick={() => change(product, -1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      aria-label={format(m.shop.more, { name: product.name })}
                      disabled={soldOut || quantity >= Math.min(MAX_QUANTITY, product.available)}
                      onClick={() => change(product, 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="trace-panel soft shop-checkout">
        <div>
          <header className="trace-head">
            <span className="trace-eyebrow">{m.shop.orderEyebrow}</span>
            <h2>{items.length ? money(total, currency, tag) : m.shop.choose}</h2>
          </header>
          {lines.length ? (
            <ul className="shop-lines">
              {lines.map((line) => (
                <li key={line.sku}>
                  <span>
                    {brand.company} {line.product?.name ?? line.sku} × {line.quantity}
                  </span>
                  <span>{line.product ? money(line.product.price_minor * line.quantity, line.product.currency, tag) : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="shop-note">{m.shop.addUpTo}</p>
          )}
          <ul className="shop-promises">
            <li>
              <ShieldCheck size={18} /> {m.shop.payments}
            </li>
            <li>
              <Truck size={18} /> {format(m.shop.tracked, { count: SHIPPING_COUNTRIES })}
            </li>
            <li>
              <Globe size={18} /> {format(m.shop.prices, { currency: currency.toUpperCase() })}
            </li>
          </ul>
        </div>
        <form className="trace-form shop-form" onSubmit={checkout}>
          <label className="wide">
            {m.shop.email}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={m.shop.emailPlaceholder}
            />
          </label>
          {error ? (
            <p className="trace-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="trace-button ink" type="submit" disabled={busy || items.length === 0}>
            {busy ? (
              <>
                <LoaderCircle className="animate-spin" size={18} /> {m.shop.opening}
              </>
            ) : (
              m.shop.pay
            )}
          </button>
          <small>{m.shop.hold}</small>
        </form>
      </section>
    </div>
  );
}
