"use client";
// The shop's shared state in the browser: the products on sale, fetched once and shared by the
// shop, product and checkout pages, and the bag (the cart), kept in localStorage so it survives
// moving between pages, reloading and coming back from the payment page. Other tabs follow it.
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export type ShopProduct = {
  sku: string;
  name: string;
  description: string;
  image: string | null;
  price_minor: number;
  currency: string;
  available: number;
};

/** The API's limits on one order: up to three of each bag, and four different bags. */
export const MAX_QUANTITY = 3;
export const MAX_LINES = 4;

export function money(minor: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase() }).format(
    minor / 100,
  );
}

// ---- Products ----

let latest: ShopProduct[] | null = null;
let request: Promise<ShopProduct[]> | null = null;

function fetchProducts() {
  request ??= fetch("/api/shop/products")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("products"))))
    .then((list: ShopProduct[]) => (latest = list))
    .finally(() => {
      request = null;
    });
  return request;
}

/**
 * The products on sale. What was loaded before shows straight away while stock is checked
 * again, so moving between shop pages doesn't flash a loading state.
 */
export function useProducts() {
  const [products, setProducts] = useState<ShopProduct[] | null>(latest);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((list) => active && setProducts(list))
      .catch(() => active && !latest && setError(true));
    return () => {
      active = false;
    };
  }, []);
  return { products, error };
}

// ---- The bag ----

export type Bag = Record<string, number>;

const BAG_KEY = "amortrav.bag";
/** The order the bag was last sent to payment as, so paying for it empties the bag. */
const ORDER_KEY = "amortrav.bag.order";
const EMPTY: Bag = {};
const listeners = new Set<() => void>();
let cached: Bag | null = null;

function readBag(): Bag {
  if (cached) return cached;
  try {
    const saved = JSON.parse(localStorage.getItem(BAG_KEY) ?? "{}") as unknown;
    cached =
      saved && typeof saved === "object"
        ? (Object.fromEntries(
            Object.entries(saved as Record<string, unknown>).filter(
              ([, quantity]) => Number.isInteger(quantity) && (quantity as number) > 0,
            ),
          ) as Bag)
        : {};
  } catch {
    cached = {};
  }
  return cached!;
}

function writeBag(next: Bag) {
  cached = next;
  try {
    localStorage.setItem(BAG_KEY, JSON.stringify(next));
  } catch {
    // Private browsing without storage: the bag lasts for this page.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== BAG_KEY) return;
    cached = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The bag, and how to change it within the API's limits. */
export function useBag() {
  const bag = useSyncExternalStore(subscribe, readBag, () => EMPTY);
  const count = Object.values(bag).reduce((sum, quantity) => sum + quantity, 0);
  /** Sets a bag's quantity (0 removes it); false if the bag already holds four other bags. */
  const set = useCallback((sku: string, quantity: number) => {
    const current = readBag();
    const next = { ...current };
    const clamped = Math.max(0, Math.min(MAX_QUANTITY, Math.round(quantity)));
    if (clamped === 0) delete next[sku];
    else {
      if (!(sku in current) && Object.keys(current).length >= MAX_LINES) return false;
      next[sku] = clamped;
    }
    writeBag(next);
    return true;
  }, []);
  const clear = useCallback(() => writeBag({}), []);
  return { bag, count, set, clear };
}

/** The bag's lines with their products, in the shop's order, and what they come to. */
export function bagLines(bag: Bag, products: ShopProduct[] | null) {
  const lines = (products ?? [])
    .filter((product) => bag[product.sku])
    .map((product) => ({ product, quantity: bag[product.sku] }));
  const currencies = [...new Set(lines.map((line) => line.product.currency.toLowerCase()))];
  const total = lines.reduce((sum, line) => sum + line.product.price_minor * line.quantity, 0);
  return { lines, currencies, total, currency: currencies[0] ?? "usd" };
}

export function rememberOrder(id: string) {
  try {
    localStorage.setItem(ORDER_KEY, id);
  } catch {}
}

/** Once the order the bag became is paid for, the bag starts empty again. */
export function settleOrder(id: string) {
  try {
    if (localStorage.getItem(ORDER_KEY) !== id) return;
    localStorage.removeItem(ORDER_KEY);
  } catch {
    return;
  }
  writeBag({});
}
