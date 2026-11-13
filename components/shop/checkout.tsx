"use client";
// Checkout: where the cart is in the journey (cart, details, payment, done), the receipt email,
// what happens about delivery and payment, and the order summary beside it. Paying opens the
// payment provider's page; the address is collected there.
//
// Each checkout attempt has an Idempotency-Key kept for that cart, so a double click, a
// refresh or a retry after a network error reuses the same order instead of making another.
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check, CreditCard, LoaderCircle, Lock, Mail, Truck } from "lucide-react";
import { brand } from "@/lib/brand";
import { format } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { bagLines, money, rememberOrder, useBag, useProducts } from "@/lib/shop";
import { openCart, Stepper, Thumb } from "./cart";
import { SHIPPING_COUNTRIES } from "./shop";
import "@/app/trace.css";
import "@/app/shop.css";

type CheckoutResponse = {
  order_id: string;
  status: string;
  checkout_url: string | null;
  order_url: string;
};

const KEY_STORE = "amortrav.shop.attempt";

/** The key for this exact cart: the same until the cart changes or the attempt is finished. */
function attemptKey(signature: string, fresh = false) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY_STORE) ?? "null") as {
      signature: string;
      key: string;
    } | null;
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
  const body = (await response.json().catch(() => ({}))) as Partial<CheckoutResponse>;
  return { response, body };
}

export function Checkout() {
  const { m, tag, href } = useI18n();
  const { bag, set } = useBag();
  const { products, error: loadError } = useProducts();
  const { lines, currencies, total, currency } = bagLines(bag, products);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const mixed = currencies.length > 1;
  const items = lines
    .map(({ product, quantity }) => ({ sku: product.sku, quantity }))
    .sort((a, b) => a.sku.localeCompare(b.sku));

  async function pay(event: FormEvent) {
    event.preventDefault();
    if (busy || items.length === 0 || mixed) return;
    setBusy(true);
    setError("");
    const signature = JSON.stringify({ email: email.trim().toLowerCase(), items });
    try {
      let { response, body } = await post(items, email, attemptKey(signature));
      // This cart's last attempt is over (cancelled or expired): start a new one.
      if (response.ok && !body.checkout_url && body.status !== "pending") {
        ({ response, body } = await post(items, email, attemptKey(signature, true)));
      }
      if (response.ok && body.checkout_url) {
        if (body.order_id) rememberOrder(body.order_id);
        setLeaving(true);
        window.location.assign(body.checkout_url);
        return;
      }
      setError(response.status === 409 ? m.shop.soldOutError : m.shop.startError);
    } catch {
      setError(m.shop.unreachable);
    }
    setBusy(false);
  }

  const steps = [m.shop.stepCart, m.shop.stepDetails, m.shop.stepPayment, m.shop.stepDone];

  return (
    <div className="trace shop">
      <section className="trace-panel checkout">
        <header className="checkout-head">
          <h1 className="shop-title">{m.shop.checkoutTitle}</h1>
          <ol className="checkout-steps" aria-label={m.shop.checkoutTitle}>
            {steps.map((step, index) => (
              <li
                key={step}
                data-state={index === 0 ? "done" : index === 1 ? "current" : undefined}
                aria-current={index === 1 ? "step" : undefined}
              >
                <span aria-hidden="true">{index === 0 ? <Check size={12} strokeWidth={3} /> : index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </header>

        {loadError ? (
          <p className="shop-note" role="alert">
            {m.shop.loadError}
          </p>
        ) : !products ? (
          <div className="checkout-skeleton" aria-busy="true" />
        ) : lines.length === 0 ? (
          <div className="checkout-empty">
            <p>{m.shop.cartEmpty}</p>
            <Link className="trace-button ink small" href={href("/shop")}>
              {m.shop.browse}
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={pay}>
              <fieldset className="checkout-section">
                <legend>
                  <Mail size={18} aria-hidden="true" /> {m.shop.contactTitle}
                </legend>
                <label>
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
                <small>{m.shop.contactBody}</small>
              </fieldset>

              <section className="checkout-section" aria-labelledby="checkout-delivery">
                <h2 id="checkout-delivery">
                  <Truck size={18} aria-hidden="true" /> {m.shop.deliveryTitle}
                </h2>
                <p>{format(m.shop.deliveryBody, { count: SHIPPING_COUNTRIES })}</p>
              </section>

              <section className="checkout-section" aria-labelledby="checkout-payment">
                <h2 id="checkout-payment">
                  <CreditCard size={18} aria-hidden="true" /> {m.shop.paymentTitle}
                </h2>
                <p>{m.shop.paymentBody}</p>
                <ul className="checkout-methods" aria-label={m.shop.payments}>
                  <li>{m.shop.card}</li>
                  <li>Apple Pay</li>
                  <li>Google Pay</li>
                </ul>
              </section>

              {error ? (
                <p className="trace-form-error" role="alert">
                  {error}
                </p>
              ) : null}
              {mixed ? (
                <p className="cart-warning" role="alert">
                  {m.shop.mixed}
                </p>
              ) : null}
              <button className="trace-button ink checkout-pay" type="submit" disabled={busy || mixed}>
                {busy ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} /> {m.shop.opening}
                  </>
                ) : (
                  <>
                    <Lock size={16} /> {format(m.shop.payAmount, { amount: money(total, currency, tag) })}
                  </>
                )}
              </button>
              <p className="checkout-fineprint">
                <Lock size={13} aria-hidden="true" /> {m.shop.secured}. {m.shop.held}
              </p>
            </form>

            <aside className="checkout-summary" aria-labelledby="checkout-summary">
              <div className="checkout-summary-head">
                <h2 id="checkout-summary">{m.shop.summary}</h2>
                <button type="button" className="checkout-edit" onClick={openCart}>
                  {m.shop.edit}
                </button>
              </div>
              <ul className="cart-lines">
                {lines.map(({ product, quantity }) => (
                  <li key={product.sku}>
                    <Thumb product={product} />
                    <div className="cart-line-main">
                      <span>
                        {brand.company} {product.name}
                      </span>
                      <small>{money(product.price_minor, product.currency, tag)}</small>
                      <Stepper product={product} quantity={quantity} onChange={(next) => set(product.sku, next)} />
                    </div>
                    <strong>{money(product.price_minor * quantity, product.currency, tag)}</strong>
                  </li>
                ))}
              </ul>
              {mixed ? null : (
                <dl className="checkout-totals">
                  <div>
                    <dt>{m.shop.subtotal}</dt>
                    <dd>{money(total, currency, tag)}</dd>
                  </div>
                  <div className="total">
                    <dt>{m.order.total}</dt>
                    <dd>
                      <small>{currency.toUpperCase()}</small> {money(total, currency, tag)}
                    </dd>
                  </div>
                </dl>
              )}
              <p className="checkout-fineprint">{format(m.shop.prices, { currency: currency.toUpperCase() })}</p>
            </aside>
          </div>
        )}
      </section>

      {leaving ? (
        <div className="checkout-leaving" role="status">
          <span>
            <Lock size={22} />
          </span>
          <p>{m.shop.redirecting}</p>
          <LoaderCircle className="animate-spin" size={20} aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
