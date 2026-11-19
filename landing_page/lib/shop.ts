"use client";

import { useSyncExternalStore } from "react";

export interface ColorSwatch {
  name: string;
  color: string;
  image: string;
}

export interface ShopProduct {
  sku: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  price_minor: number;
  currency: string;
  available: number;
  category: "Luggage" | "Bags" | "Bundles";
  sizeCategory: "Cabin" | "Check-In" | "Trunk" | "Bag";
  material: "Aluminium" | "Polycarbonate" | "Premium Suede";
  collection: "Original" | "Essential" | "Executive" | "Signature" | "Classic";
  volumeL: number;
  volumeGal: number;
  weightKg: number;
  weightLbs: number;
  dimensionsCm: { height: number; width: number; depth: number };
  dimensionsInches: { height: number; width: number; depth: number };
  features: string[];
  swatches: ColorSwatch[];
  badge?: "New" | "Customise" | "Bestseller" | "Signature";
}

export type CartItems = Record<string, number>;

const CART_KEY = "amortrav.cart";
export const MAX_QUANTITY = 3;
export const MAX_LINES = 6;

export const CATALOG: ShopProduct[] = [
  {
    sku: "duffel-side-bag",
    name: "AMTRAV Premium Suede & Aluminium Duffel Side Bag",
    subtitle: "Suede | Aluminium Accents",
    description: "Handcrafted Italian suede with aerospace-grade ribbed aluminium stripes, RFID-shielded compartment, and ergonomic metal hardware.",
    image: "/images/trace/duffel-side-bag.jpg",
    price_minor: 48000,
    currency: "USD",
    available: 35,
    category: "Bags",
    sizeCategory: "Bag",
    material: "Premium Suede",
    collection: "Signature",
    volumeL: 32,
    volumeGal: 8.5,
    weightKg: 1.45,
    weightLbs: 3.2,
    dimensionsCm: { height: 28, width: 50, depth: 23 },
    dimensionsInches: { height: 11.0, width: 19.7, depth: 9.1 },
    features: [
      "Luxury Suede Finish",
      "Aluminium Signature Stripes",
      "Aluminium Handle & Detailing",
      "RFID Shielded Compartment",
      "Spacious Main Cavity with Zippers",
      "Detachable Padded Shoulder Strap",
      "Durable & Water Resistant",
    ],
    swatches: [
      { name: "Cognac Brown", color: "#6e3b1b", image: "/images/trace/duffel-side-bag.jpg" },
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/duffel-side-bag.jpg" },
      { name: "Midnight Navy", color: "#10213b", image: "/images/trace/duffel-side-bag.jpg" },
      { name: "Sand Beige", color: "#c2b29d", image: "/images/trace/duffel-side-bag.jpg" },
      { name: "Charcoal Grey", color: "#424449", image: "/images/trace/duffel-side-bag.jpg" },
    ],
    badge: "New",
  },
  {
    sku: "cabin-55",
    name: "Original Cabin 55",
    subtitle: "Overhead Bin Compliant · 2–4 Days",
    description: "Crafted from anodized grooved aluminium with ultra-silent ball-bearing Multiwheels and dual TSA combination locks.",
    image: "/images/trace/range-essential.png",
    price_minor: 34900,
    currency: "USD",
    available: 50,
    category: "Luggage",
    sizeCategory: "Cabin",
    material: "Aluminium",
    collection: "Original",
    volumeL: 35,
    volumeGal: 9.2,
    weightKg: 4.3,
    weightLbs: 9.5,
    dimensionsCm: { height: 55, width: 40, depth: 23 },
    dimensionsInches: { height: 21.7, width: 15.7, depth: 9.1 },
    features: [
      "Airline Overhead Bin Compliant",
      "TRACE Smart Core Self-Weighing",
      "Dual TSA-Approved Locks",
      "Multiwheel® 360° Ball Bearings",
      "Height-Adjustable Flex Divider",
      "Lifetime Functional Guarantee",
    ],
    swatches: [
      { name: "Silver Aluminium", color: "#b8c0cc", image: "/images/trace/range-pro.png" },
      { name: "Graphite Matte", color: "#22252a", image: "/images/trace/range-essential.png" },
      { name: "Navy Flagship", color: "#001f4d", image: "/images/trace/range-flagship.png" },
      { name: "Executive Obsidian", color: "#0d0f12", image: "/images/trace/range-executive.png" },
    ],
    badge: "Customise",
  },
  {
    sku: "checkin-68",
    name: "Essential Check-In 68",
    subtitle: "Mid-Sized Travel · Up to 8 Days",
    description: "High-performance polycarbonate suitcase with built-in drop, tumble and impact tracking sensors.",
    image: "/images/trace/range-flagship.png",
    price_minor: 42900,
    currency: "USD",
    available: 40,
    category: "Luggage",
    sizeCategory: "Check-In",
    material: "Polycarbonate",
    collection: "Essential",
    volumeL: 65,
    volumeGal: 17.2,
    weightKg: 5.4,
    weightLbs: 11.9,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Drop & Handling Impact Detection",
      "TRACE Cellular & GPS Location",
      "High-Impact Resilient Polycarbonate",
      "Stage-Free Telescopic Handle",
      "Dual TSA Combination Locks",
      "Interior Flex Compression Pads",
    ],
    swatches: [
      { name: "Navy Flagship", color: "#001f4d", image: "/images/trace/range-flagship.png" },
      { name: "Silver Aluminium", color: "#b8c0cc", image: "/images/trace/range-pro.png" },
      { name: "Graphite Matte", color: "#22252a", image: "/images/trace/range-essential.png" },
      { name: "Executive Obsidian", color: "#0d0f12", image: "/images/trace/range-executive.png" },
    ],
    badge: "Bestseller",
  },
  {
    sku: "checkin-76",
    name: "Classic Check-In 76",
    subtitle: "Extended Expeditions · Up to 2 Weeks",
    description: "Maximum packing capacity with ergonomic self-weighing handle to prevent airport excess baggage fees.",
    image: "/images/trace/range-executive.png",
    price_minor: 46900,
    currency: "USD",
    available: 25,
    category: "Luggage",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Classic",
    volumeL: 86,
    volumeGal: 22.7,
    weightKg: 6.2,
    weightLbs: 13.6,
    dimensionsCm: { height: 78, width: 52, depth: 28 },
    dimensionsInches: { height: 30.7, width: 20.5, depth: 11.0 },
    features: [
      "Built-in Self-Weighing Load Cell",
      "Impact Timestamp Verification",
      "Reinforced Aluminium Corner Rivets",
      "Dual TSA-Approved Latches",
      "High-Volume Deep Packing Space",
      "Lifetime Warranty Protection",
    ],
    swatches: [
      { name: "Executive Obsidian", color: "#0d0f12", image: "/images/trace/range-executive.png" },
      { name: "Silver Aluminium", color: "#b8c0cc", image: "/images/trace/range-pro.png" },
      { name: "Navy Flagship", color: "#001f4d", image: "/images/trace/range-flagship.png" },
    ],
  },
  {
    sku: "trunk-90",
    name: "Original Trunk 90",
    subtitle: "Iconic Deep Silhouette · 90L",
    description: "Inspired by our historic travel trunks, engineered with optimal depth for oversized equipment and lengthy stays.",
    image: "/images/trace/range-flagship.png",
    price_minor: 59000,
    currency: "USD",
    available: 15,
    category: "Luggage",
    sizeCategory: "Trunk",
    material: "Aluminium",
    collection: "Original",
    volumeL: 90,
    volumeGal: 23.8,
    weightKg: 6.5,
    weightLbs: 14.3,
    dimensionsCm: { height: 73, width: 37, depth: 41 },
    dimensionsInches: { height: 28.7, width: 14.6, depth: 16.1 },
    features: [
      "Iconic Deep-Box Trunk Architecture",
      "Ideal for Bulky Apparel & Sports Gear",
      "Full Aluminium-Magnesium Alloy Shell",
      "TRACE Core Real-Time Flight Mode",
      "Multiwheel® Axle Dampers",
      "Dual TSA Integrated Locks",
    ],
    swatches: [
      { name: "Silver Aluminium", color: "#b8c0cc", image: "/images/trace/range-pro.png" },
      { name: "Executive Obsidian", color: "#0d0f12", image: "/images/trace/range-executive.png" },
    ],
    badge: "Signature",
  },
  {
    sku: "the-pair",
    name: "The Executive Pair Bundle",
    subtitle: "Cabin 55 + Check-In 68 · Bundle Value",
    description: "The complete luxury travel system. Matched smart suitcases with synchronized TRACE tracking and personalized leather tags.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 71900,
    currency: "USD",
    available: 20,
    category: "Bundles",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Executive",
    volumeL: 100,
    volumeGal: 26.4,
    weightKg: 9.7,
    weightLbs: 21.4,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Matched Cabin 55 & Check-In 68",
      "Synchronized Multi-Bag Journey Log",
      "Significant Bundle Pricing Advantage",
      "Includes 2x Monogrammed Leather Tags",
      "Double Lifetime Guarantee Coverage",
    ],
    swatches: [
      { name: "Classic Duo", color: "#b8c0cc", image: "/images/trace/hero-pair.jpg" },
    ],
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

export function readCart(): CartItems {
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

export function addToCart(sku: string, qty = 1): boolean {
  const current = { ...readCart() };
  const currentQty = current[sku] || 0;
  if (currentQty + qty > MAX_QUANTITY) return false;
  if (Object.keys(current).length >= MAX_LINES && !current[sku]) return false;

  current[sku] = currentQty + qty;
  writeCart(current);
  return true;
}

export function removeFromCart(sku: string) {
  const current = { ...readCart() };
  delete current[sku];
  writeCart(current);
}

export function updateQuantity(sku: string, qty: number) {
  const current = { ...readCart() };
  if (qty <= 0) {
    delete current[sku];
  } else {
    current[sku] = Math.min(qty, MAX_QUANTITY);
  }
  writeCart(current);
}

export function clearCart() {
  writeCart({});
}

export function useCart() {
  const cart: CartItems = useSyncExternalStore<CartItems>(subscribe, readCart, getCartServerSnapshot);
  const totalItems: number = Object.values(cart).reduce((a: number, b: number) => a + b, 0);

  const subtotalMinor: number = Object.entries(cart).reduce((total: number, [sku, qty]: [string, number]) => {
    const p = CATALOG.find((item: ShopProduct) => item.sku === sku);
    return total + (p ? p.price_minor * qty : 0);
  }, 0);

  return {
    cart,
    totalItems,
    subtotalMinor,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
