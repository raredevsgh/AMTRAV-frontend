"use client";

import { useSyncExternalStore } from "react";

export interface ShopProduct {
  sku: string;
  name: string;
  description: string;
  image: string;
  price_minor: number;
  currency: string;
  available: number;
}

export type CartItems = Record<string, number>;

const CART_KEY = "amortrav.cart";
export const MAX_QUANTITY = 3;
export const MAX_LINES = 4;

export const CATALOG: ShopProduct[] = [
  {
    sku: "cabin-55",
    name: "Cabin 55",
    description: "Fits the overhead bin. Graphite polycarbonate with integrated TRACE Smart Core.",
    image: "/images/trace/range-essential.png",
    price_minor: 34900,
    currency: "USD",
    available: 50,
  },
  {
    sku: "checkin-68",
    name: "Check-in 68",
    description: "Navy check-in suitcase engineered for long trips with impact and drop sensors.",
    image: "/images/trace/range-flagship.png",
    price_minor: 42900,
    currency: "USD",
    available: 40,
  },
  {
    sku: "checkin-76",
    name: "Check-in 76",
    description: "Extended check-in suitcase with self-weighing handle and maximum capacity.",
    image: "/images/trace/range-executive.png",
    price_minor: 46900,
    currency: "USD",
    available: 25,
  },
  {
    sku: "the-pair",
    name: "The Pair",
    description: "Cabin 55 + Check-in 68 bundled with matching Smart Cores and luggage tags.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 71900,
    currency: "USD",
    available: 20,
  },
];

export function formatPrice(minor: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

const EMPTY_CART: CartItems = {};
const listeners = new Set<() => void>();
let cachedCart: CartItems | null = null;

function readCart(): CartItems {
  if (cachedCart) return cachedCart;
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = localStorage.getItem(CART_KEY);
    cachedCart = raw ? JSON.parse(raw) : EMPTY_CART;
  } catch {
    cachedCart = EMPTY_CART;
  }
  return cachedCart ?? EMPTY_CART;
}

function getCartServerSnapshot(): CartItems {
  return EMPTY_CART;
}

function writeCart(cart: CartItems) {
  cachedCart = cart;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Ignore in restricted environments
  }
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function addToCart(sku: string, delta = 1) {
  const current = readCart();
  const currentQty = current[sku] || 0;
  const newQty = Math.min(MAX_QUANTITY, currentQty + delta);
  if (Object.keys(current).length >= MAX_LINES && !current[sku]) {
    alert(`You can order up to ${MAX_LINES} distinct bag types per order.`);
    return;
  }
  writeCart({ ...current, [sku]: newQty });
}

export function removeFromCart(sku: string) {
  const current = { ...readCart() };
  delete current[sku];
  writeCart(current);
}

export function clearCart() {
  writeCart({});
}

export function useCart() {
  const cart: CartItems = useSyncExternalStore<CartItems>(subscribe, readCart, getCartServerSnapshot);
  const totalItems: number = Object.values(cart).reduce((a: number, b: number) => a + b, 0);

  const subtotalMinor: number = Object.entries(cart).reduce((total: number, [sku, qty]: [string, number]) => {
    const product = CATALOG.find((p) => p.sku === sku);
    return total + (product ? product.price_minor * qty : 0);
  }, 0);

  return {
    cart,
    totalItems,
    subtotalMinor,
    addToCart,
    removeFromCart,
    clearCart,
  };
}
