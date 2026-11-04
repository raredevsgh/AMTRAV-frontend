"use client";

// The buyer's order page, where the payment page sends them back. Paying and the provider's
// confirmation can be a few seconds apart, so a pending order is checked again until it's in.
// Coming back with "cancelled" closes the checkout so its bags go straight back on sale.
import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleCheck, Clock, LoaderCircle, PackageCheck, Truck, XCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import { format } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { money } from "./shop";
import "@/app/trace.css";
import "@/app/shop.css";

type Order = {
  id: string;
  reference: string;
  status: "pending" | "paid" | "shipped" | "expired" | "failed" | "review";
  email: string;
  items: { name: string; unit_minor: number; quantity: number }[];
  total_minor: number;
  currency: string;
  shipping: { name?: string; address?: Record<string, string | null> } | null;
  tracking: string | null;
  created_at: string;
};

const POLL_MS = 3000;
const POLL_FOR_MS = 2 * 60 * 1000;

const icons = { pending: Clock, paid: CircleCheck, review: CircleCheck, shipped: Truck, expired: XCircle, failed: XCircle } as const;

export function OrderStatus({ id, token, cancelled }: { id: string; token: string; cancelled: boolean }) {
  const { m, tag, href } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    const query = `?token=${encodeURIComponent(token)}`;
    async function load(first: boolean) {
      try {
        const response = await fetch(
          first && cancelled ? `/api/shop/orders/${id}/cancel${query}` : `/api/shop/orders/${id}${query}`,
          { method: first && cancelled ? "POST" : "GET" },
        );
        if (!response.ok) throw new Error(response.status === 404 ? "missing" : "failed");
        const next: Order = await response.json();
        if (!active) return;
        setOrder(next);
        if (next.status === "pending" && Date.now() - started < POLL_FOR_MS) timer = setTimeout(() => load(false), POLL_MS);
      } catch (cause) {
        if (active)
          setError(cause instanceof Error && cause.message === "missing" ? m.order.missing : m.order.failed);
      }
    }
    load(true);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [id, token, cancelled, m]);

  const look = order
    ? { title: m.order[`${order.status}Title`], body: m.order[`${order.status}Body`] }
    : null;
  const Icon = order ? icons[order.status] : PackageCheck;
  const address = order?.shipping?.address;

  return (
    <div className="trace shop">
      <section className="trace-panel shop-order">
        {error ? (
          <p className="shop-note" role="alert">
            {error}
          </p>
        ) : !order || !look ? (
          <p className="shop-note" aria-busy="true">
            <LoaderCircle className="animate-spin" size={18} /> {m.order.loading}
          </p>
        ) : (
          <>
            <header className="trace-head">
              <span className={`shop-status ${order.status}`}>
                <Icon size={22} />
              </span>
              <span className="trace-eyebrow">{format(m.order.reference, { reference: order.reference })}</span>
              <h1 className="shop-title">{look.title}</h1>
              <p>{look.body}</p>
            </header>
            <ul className="shop-lines">
              {order.items.map((item) => (
                <li key={item.name}>
                  <span>
                    {brand.company} {item.name} × {item.quantity}
                  </span>
                  <span>{money(item.unit_minor * item.quantity, order.currency, tag)}</span>
                </li>
              ))}
              <li className="total">
                <span>{m.order.total}</span>
                <span>{money(order.total_minor, order.currency, tag)}</span>
              </li>
            </ul>
            <dl className="shop-facts">
              <div>
                <dt>{m.order.receipt}</dt>
                <dd>{order.email}</dd>
              </div>
              {order.shipping?.name ? (
                <div>
                  <dt>{m.order.shipTo}</dt>
                  <dd>
                    {order.shipping.name}
                    {address ? `, ${[address.city, address.country].filter(Boolean).join(", ")}` : ""}
                  </dd>
                </div>
              ) : null}
              {order.tracking ? (
                <div>
                  <dt>{m.order.tracking}</dt>
                  <dd>{order.tracking}</dd>
                </div>
              ) : null}
            </dl>
            <div className="trace-buttons">
              <Link className="trace-button ink small" href={href("/shop")}>
                {order.status === "expired" || order.status === "failed" ? m.order.back : m.order.again}
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
