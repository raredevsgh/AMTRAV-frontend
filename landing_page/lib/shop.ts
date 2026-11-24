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
  category: "Luggage" | "Bags" | "Bundles" | "Accessories";
  sizeCategory: "Cabin" | "Check-In" | "Trunk" | "Bag" | "Accessory";
  material: "Aluminium" | "Polycarbonate" | "Leather" | "Ripstop Nylon" | "Ballistic Nylon" | "Jacquard Webbing";
  collection: "Essential" | "Pro" | "Executive" | "Flagship" | "Signature" | "Original" | "Classic" | "Accessories";
  volumeL: number;
  volumeGal: number;
  weightKg: number;
  weightLbs: number;
  dimensionsCm: { height: number; width: number; depth: number };
  dimensionsInches: { height: number; width: number; depth: number };
  features: string[];
  swatches: ColorSwatch[];
  hasCustomPalette?: boolean;
  badge?: "New" | "Customise" | "Bestseller" | "Signature" | "Duo Set" | "Bespoke";
}

export type CartItems = Record<string, number>;

const CART_KEY = "amortrav.cart";
export const MAX_QUANTITY = 3;
export const MAX_LINES = 6;

// Swatches from Photo 1: Essential (Midnight Black, Space Grey, Navy Blue)
export const ESSENTIAL_SWATCHES: ColorSwatch[] = [
  { name: "Midnight Black", color: "#1a1a1c", image: "/images/trace/range-essential.png" },
  { name: "Space Grey", color: "#7d828a", image: "/images/trace/range-pro.png" },
  { name: "Navy Blue", color: "#1e2d42", image: "/images/trace/range-flagship.png" },
];

// Swatches from Photo 2: Pro, Executive, Flagship (Graphite Black, Midnight Blue, Titanium Silver, Pearl White, Champagne Gold, Forest Green)
export const PRO_FLAGSHIP_SWATCHES: ColorSwatch[] = [
  { name: "Graphite Black", color: "#2b2d2f", image: "/images/trace/range-essential.png" },
  { name: "Midnight Blue", color: "#1d3356", image: "/images/trace/range-flagship.png" },
  { name: "Titanium Silver", color: "#c5cbd3", image: "/images/trace/range-pro.png" },
  { name: "Pearl White", color: "#f4f5f7", image: "/images/trace/range-essential.png" },
  { name: "Champagne Gold", color: "#d8b888", image: "/images/trace/range-executive.png" },
  { name: "Forest Green", color: "#3e533e", image: "/images/trace/range-flagship.png" },
];

export const CATALOG: ShopProduct[] = [
  // 1. Essential Collection (Photo 1 colors + Custom Palette)
  {
    sku: "essential-cabin-55",
    name: "Essential Cabin 55",
    subtitle: "Overhead Bin Compliant · 2–4 Days",
    description: "High-grade resilient polycarbonate with ultra-silent ball-bearing Multiwheels and built-in TRACE Smart Core.",
    image: "/images/trace/range-essential.png",
    price_minor: 32900,
    currency: "USD",
    available: 60,
    category: "Luggage",
    sizeCategory: "Cabin",
    material: "Polycarbonate",
    collection: "Essential",
    volumeL: 35,
    volumeGal: 9.2,
    weightKg: 3.8,
    weightLbs: 8.4,
    dimensionsCm: { height: 55, width: 40, depth: 23 },
    dimensionsInches: { height: 21.7, width: 15.7, depth: 9.1 },
    features: [
      "Airline Overhead Bin Compliant",
      "High-Impact Resilient Polycarbonate",
      "TRACE Smart Core Self-Weighing",
      "Dual TSA-Approved Combination Locks",
      "Multiwheel® 360° Ball Bearings",
      "Lifetime Functional Guarantee",
    ],
    swatches: ESSENTIAL_SWATCHES,
    hasCustomPalette: true,
    badge: "Bestseller",
  },
  {
    sku: "essential-checkin-68",
    name: "Essential Check-In 68",
    subtitle: "Mid-Sized Travel · Up to 8 Days",
    description: "Full-sized check-in suitcase with built-in drop, tumble and impact tracking sensors in light resilient polycarbonate.",
    image: "/images/trace/range-flagship.png",
    price_minor: 39900,
    currency: "USD",
    available: 45,
    category: "Luggage",
    sizeCategory: "Check-In",
    material: "Polycarbonate",
    collection: "Essential",
    volumeL: 65,
    volumeGal: 17.2,
    weightKg: 4.8,
    weightLbs: 10.6,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Drop & Handling Impact Detection",
      "TRACE Cellular & GPS Location",
      "High-Impact Polycarbonate Shell",
      "Stage-Free Telescopic Handle",
      "Dual TSA Locks & Interior Flex Dividers",
    ],
    swatches: ESSENTIAL_SWATCHES,
    hasCustomPalette: true,
  },
  {
    sku: "essential-the-pair",
    name: "Essential Travel Duo Set",
    subtitle: "Cabin 55 + Check-In 68 · Complete Travel System",
    description: "Matched Essential suitcases with synchronized TRACE tracking, bundled pricing advantage, and custom color coordination.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 65900,
    currency: "USD",
    available: 30,
    category: "Bundles",
    sizeCategory: "Check-In",
    material: "Polycarbonate",
    collection: "Essential",
    volumeL: 100,
    volumeGal: 26.4,
    weightKg: 8.6,
    weightLbs: 19.0,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Matched Cabin 55 + Check-In 68 Pair",
      "Synchronized Multi-Bag Journey Tracking",
      "Exclusive Bundle Savings Advantage",
      "Includes 2x Monogrammed Leather Tags",
    ],
    swatches: ESSENTIAL_SWATCHES,
    hasCustomPalette: true,
    badge: "Duo Set",
  },

  // 3. Pro Collection (Photo 2 colors + Custom Palette)
  {
    sku: "pro-cabin-55",
    name: "Pro Cabin 55",
    subtitle: "Aerospace Aluminium-Magnesium · 2–4 Days",
    description: "High-strength ribbed aluminium-magnesium alloy case with reinforced corner bumpers, self-weighing handle, and Multiwheels.",
    image: "/images/trace/range-pro.png",
    price_minor: 38900,
    currency: "USD",
    available: 40,
    category: "Luggage",
    sizeCategory: "Cabin",
    material: "Aluminium",
    collection: "Pro",
    volumeL: 35,
    volumeGal: 9.2,
    weightKg: 4.3,
    weightLbs: 9.5,
    dimensionsCm: { height: 55, width: 40, depth: 23 },
    dimensionsInches: { height: 21.7, width: 15.7, depth: 9.1 },
    features: [
      "Aerospace Aluminium-Magnesium Alloy",
      "Reinforced Anodized Corner Caps",
      "TRACE Smart Core Embedded",
      "Dual TSA Combination Locks",
      "Lifetime Structural Guarantee",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
    badge: "Customise",
  },
  {
    sku: "pro-checkin-68",
    name: "Pro Check-In 68",
    subtitle: "Aerospace Aluminium · Up to 8 Days",
    description: "Mid-sized aluminium alloy suitcase engineered for tough airline transit with real-time impact sensors.",
    image: "/images/trace/range-pro.png",
    price_minor: 48900,
    currency: "USD",
    available: 35,
    category: "Luggage",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Pro",
    volumeL: 65,
    volumeGal: 17.2,
    weightKg: 5.4,
    weightLbs: 11.9,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Rigid Grooved Aluminium Shell",
      "Impact Timestamp Verification",
      "Silent 360° Multiwheel Dampers",
      "Adjustable Flex Compression Divider",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
  },
  {
    sku: "pro-the-pair",
    name: "Pro Travel Duo Set",
    subtitle: "Cabin 55 + Check-In 68 · Complete Aluminium Pair",
    description: "Matched Pro Aluminium suitcases for executives and frequent flyers with unified tracking.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 78900,
    currency: "USD",
    available: 25,
    category: "Bundles",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Pro",
    volumeL: 100,
    volumeGal: 26.4,
    weightKg: 9.7,
    weightLbs: 21.4,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Matched Cabin 55 + Check-In 68 Aluminium",
      "Synchronized Bluetooth & GPS Log",
      "Double Lifetime Guarantee Protection",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
    badge: "Duo Set",
  },

  // 4. Executive Collection (Photo 2 colors + Custom Palette)
  {
    sku: "executive-cabin-55",
    name: "Executive Cabin 55",
    subtitle: "Obsidian Armor Alloy · 2–4 Days",
    description: "Hardened black anodized alloy with self-weighing ergonomic grip and covert GPS tracking.",
    image: "/images/trace/range-executive.png",
    price_minor: 44900,
    currency: "USD",
    available: 30,
    category: "Luggage",
    sizeCategory: "Cabin",
    material: "Aluminium",
    collection: "Executive",
    volumeL: 35,
    volumeGal: 9.2,
    weightKg: 4.4,
    weightLbs: 9.7,
    dimensionsCm: { height: 55, width: 40, depth: 23 },
    dimensionsInches: { height: 21.7, width: 15.7, depth: 9.1 },
    features: [
      "Hardened Anodized Obsidian Alloy",
      "High-Precision Load Cell Weigher",
      "Theft Mode Active Tamper Alerts",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
    badge: "Customise",
  },
  {
    sku: "executive-checkin-68",
    name: "Executive Check-In 68",
    subtitle: "Obsidian Armor Alloy · Up to 8 Days",
    description: "High-security executive suitcase with built-in electronic scales and shock-absorbing wheel axles.",
    image: "/images/trace/range-executive.png",
    price_minor: 54900,
    currency: "USD",
    available: 25,
    category: "Luggage",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Executive",
    volumeL: 65,
    volumeGal: 17.2,
    weightKg: 5.6,
    weightLbs: 12.3,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Obsidian Scratch-Resistant Finish",
      "Impact Timestamp Logging",
      "Reinforced Structural Rivets",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
  },
  {
    sku: "executive-the-pair",
    name: "Executive Travel Duo Set",
    subtitle: "Cabin 55 + Check-In 68 · Executive Duo",
    description: "Matched Executive Obsidian suitcases with synchronized multi-bag monitoring.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 89900,
    currency: "USD",
    available: 18,
    category: "Bundles",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Executive",
    volumeL: 100,
    volumeGal: 26.4,
    weightKg: 10.0,
    weightLbs: 22.0,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Executive Duo Cabin + Check-In",
      "Synchronized TRACE Flight Protection",
      "VIP Concierge Assistance Included",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
    badge: "Duo Set",
  },

  // 5. Flagship Collection (Photo 2 colors + Custom Palette)
  {
    sku: "flagship-cabin-55",
    name: "Flagship Cabin 55",
    subtitle: "Signature Connected Alloy · 2–4 Days",
    description: "Our peak engineering achievement with luxury custom milled hardware and connected TRACE Core.",
    image: "/images/trace/range-flagship.png",
    price_minor: 49900,
    currency: "USD",
    available: 25,
    category: "Luggage",
    sizeCategory: "Cabin",
    material: "Aluminium",
    collection: "Flagship",
    volumeL: 35,
    volumeGal: 9.2,
    weightKg: 4.5,
    weightLbs: 9.9,
    dimensionsCm: { height: 55, width: 40, depth: 23 },
    dimensionsInches: { height: 21.7, width: 15.7, depth: 9.1 },
    features: [
      "Full Custom Milled Aerospace Alloy",
      "Integrated Load Cell Weigher",
      "Dual TSA-Approved Latches",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
    badge: "Signature",
  },
  {
    sku: "flagship-checkin-68",
    name: "Flagship Check-In 68",
    subtitle: "Signature Connected Alloy · Up to 8 Days",
    description: "Flagship luxury check-in case with cushioned wheel bearings, impact sensors, and lifetime service.",
    image: "/images/trace/range-flagship.png",
    price_minor: 59900,
    currency: "USD",
    available: 20,
    category: "Luggage",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Flagship",
    volumeL: 65,
    volumeGal: 17.2,
    weightKg: 5.8,
    weightLbs: 12.8,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Signature Grooved Architecture",
      "Multi-Frequency Global Tracking",
      "Custom Laser Monogramming",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
  },
  {
    sku: "flagship-the-pair",
    name: "Flagship Travel Duo Set",
    subtitle: "Cabin 55 + Check-In 68 · Signature Duo",
    description: "The pinnacle of luxury travel. Matched Flagship Cabin and Check-In cases with complimentary bespoke personalization.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 98900,
    currency: "USD",
    available: 15,
    category: "Bundles",
    sizeCategory: "Check-In",
    material: "Aluminium",
    collection: "Flagship",
    volumeL: 100,
    volumeGal: 26.4,
    weightKg: 10.3,
    weightLbs: 22.7,
    dimensionsCm: { height: 68, width: 45, depth: 28 },
    dimensionsInches: { height: 26.8, width: 17.7, depth: 11.0 },
    features: [
      "Matched Flagship Cabin + Check-In Pair",
      "Bespoke Monogramming & Wheel Accents",
      "Priority VIP Global Repair Service",
    ],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
    badge: "Duo Set",
  },

  // Backward compatibility alias items
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
    features: ["Airline Overhead Bin Compliant", "TRACE Smart Core Self-Weighing"],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
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
    features: ["Drop & Handling Impact Detection", "TRACE Cellular & GPS Location"],
    swatches: ESSENTIAL_SWATCHES,
    hasCustomPalette: true,
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
    features: ["Matched Cabin 55 & Check-In 68", "Synchronized Multi-Bag Journey Log"],
    swatches: PRO_FLAGSHIP_SWATCHES,
    hasCustomPalette: true,
  },

  // 6. AMTRAV Real Accessories
  {
    sku: "accessory-pet-carrier",
    name: "Pet Carrier with AMTRAV TRACE™",
    subtitle: "Intelligent Lost, Theft & Asset Protection",
    description: "Aerospace-grade aluminium pet carrier with built-in AMTRAV TRACE Smart Core for real-time GPS tracking, geofencing, theft alerts, and tamper detection. Airline approved, ventilated comfort, and Trolley Sleeve for effortless travel.",
    image: "/images/trace/accessories/pet-carrier-clean.jpg",
    price_minor: 35000,
    currency: "USD",
    available: 50,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 0,
    volumeGal: 0,
    weightKg: 2.4,
    weightLbs: 5.3,
    dimensionsCm: { height: 48, width: 30, depth: 32 },
    dimensionsInches: { height: 18.9, width: 11.8, depth: 12.6 },
    features: [
      "AMTRAV TRACE Smart Core",
      "4G LTE Cat-M1 & GNSS/GPS",
      "Tamper Detection & Theft Mode",
      "Breathable Ventilation Mesh",
      "Soft Removable Cushion",
      "Trolley Sleeve for Suitcase Handle",
      "Airline Approved",
      "Up to 14-Day Battery Life",
    ],
    swatches: [
      { name: "Space Grey · Small (5kg)", color: "#6b7280", image: "/images/trace/accessories/pet-carrier-front.jpg" },
      { name: "Space Grey · Medium (10kg)", color: "#4b5563", image: "/images/trace/accessories/pet-carrier-side.jpg" },
      { name: "Space Grey · Large (15kg)", color: "#374151", image: "/images/trace/accessories/pet-carrier-clean.jpg" },
    ],
    badge: "New",
  },
  {
    sku: "accessory-duffel-side-bag",
    name: "Premium Duffel Side Bag",
    subtitle: "Suede · Aluminium Accents · RFID Protected",
    description: "Luxury suede duffel with signature aluminium stripe detailing, premium metal hardware, and RFID protection. Spacious main compartment, internal zipped pockets, and detachable shoulder strap for versatile carry.",
    image: "/images/trace/duffel-side-bag-studio.jpg",
    price_minor: 28000,
    currency: "USD",
    available: 80,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Leather",
    collection: "Accessories",
    volumeL: 18,
    volumeGal: 4.8,
    weightKg: 1.49,
    weightLbs: 3.3,
    dimensionsCm: { height: 26, width: 50, depth: 23 },
    dimensionsInches: { height: 10.2, width: 19.7, depth: 9.1 },
    features: [
      "Luxury Suede Finish",
      "Aluminium Signature Stripes",
      "Premium Metal Hardware",
      "RFID Protection",
      "Spacious Main Compartment",
      "Internal Zipped Pockets",
      "Detachable Shoulder Strap",
    ],
    swatches: [
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/duffel-onyx-black.jpg" },
      { name: "Cognac Brown", color: "#7a411f", image: "/images/trace/duffel-cognac-brown.jpg" },
      { name: "Midnight Navy", color: "#1e2d42", image: "/images/trace/duffel-midnight-navy.jpg" },
      { name: "Sand Beige", color: "#c2b69d", image: "/images/trace/duffel-sand-beige.jpg" },
      { name: "Charcoal Grey", color: "#4b5563", image: "/images/trace/duffel-charcoal-grey.jpg" },
    ],
    badge: "New",
  },
];

export const ACCESSORIES_CATALOG: ShopProduct[] = CATALOG.filter((p) => p.category === "Accessories");

export interface ResolvedCartProduct {
  sku: string;
  name: string;
  price_minor: number;
  image: string;
  selectedColorName: string;
  selectedColorHex: string;
  selectedSize: "Cabin 55" | "Check-In 68" | "Both (Duo Set)" | "Standard" | "One Size";
  isCustomColor: boolean;
  category?: "Luggage" | "Bags" | "Bundles" | "Accessories";
}

export function resolveProduct(compoundSku: string): ResolvedCartProduct {
  // Format: ${baseSku}__${colorName}__${cleanHex}
  const parts = compoundSku.split("__");
  const baseSku = parts[0];
  const customColorName = parts[1] ? decodeURIComponent(parts[1]) : undefined;
  const customColorHex = parts[2] ? `#${parts[2]}` : undefined;

  const product = CATALOG.find((p) => p.sku === baseSku) || CATALOG[1];

  let selectedSize: ResolvedCartProduct["selectedSize"] = "Standard";
  if (product.category === "Accessories") {
    selectedSize = "One Size";
  } else if (baseSku.includes("the-pair") || baseSku.includes("pair")) {
    selectedSize = "Both (Duo Set)";
  } else if (baseSku.includes("cabin")) {
    selectedSize = "Cabin 55";
  } else if (baseSku.includes("checkin")) {
    selectedSize = "Check-In 68";
  }

  const selectedColorName = customColorName || product.swatches[0]?.name || "Original";
  const selectedColorHex = customColorHex || product.swatches[0]?.color || "#2b2d2f";
  const isCustomColor = customColorName?.toLowerCase().includes("custom") || !!customColorHex;

  return {
    sku: compoundSku,
    name: product.name,
    price_minor: product.price_minor,
    image: product.image,
    selectedColorName,
    selectedColorHex,
    selectedSize,
    isCustomColor,
    category: product.category,
  };
}

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
    const resolved = resolveProduct(sku);
    return total + (resolved ? resolved.price_minor * qty : 0);
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
