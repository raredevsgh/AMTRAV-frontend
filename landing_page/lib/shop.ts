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
  badge?:
    | "New"
    | "Customise"
    | "Bestseller"
    | "Signature"
    | "Duo Set"
    | "Bespoke"
    | "Smart Carrier"
    | "Essential"
    | "Executive"
    | "Biometric"
    | "Bundle & Save"
    | "Complete Kit";
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

  // 6. AMTRAV Official Accessories Collection (Document Specification & Product Concepts)
  // --- Signature Smart Hardware ---
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
      { name: "Space Grey · Small (5kg)", color: "#6b7280", image: "/images/trace/accessories/pet-carrier-clean.jpg" },
      { name: "Space Grey · Medium (10kg)", color: "#4b5563", image: "/images/trace/accessories/pet-carrier-clean.jpg" },
      { name: "Space Grey · Large (15kg)", color: "#374151", image: "/images/trace/accessories/pet-carrier-clean.jpg" },
      { name: "Stealth Obsidian · Small (5kg)", color: "#1a1a1a", image: "/images/trace/accessories/pet-carrier-black.jpg" },
      { name: "Stealth Obsidian · Medium (10kg)", color: "#111827", image: "/images/trace/accessories/pet-carrier-black.jpg" },
    ],
    badge: "Smart Carrier",
  },
  {
    sku: "accessory-duffel-side-bag",
    name: "Premium Duffel Side Bag",
    subtitle: "Suede · Aluminium Accents · RFID Protected",
    description: "Luxury suede duffel with signature aluminium stripe detailing, premium metal hardware, and RFID protection. Spacious main compartment, internal zipped pockets, and detachable shoulder strap for versatile carry.",
    image: "/images/trace/accessories/duffel-cognac-brown.jpg",
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
      { name: "Cognac Brown", color: "#7a411f", image: "/images/trace/accessories/duffel-cognac-brown.jpg" },
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/accessories/duffel-onyx-black.jpg" },
      { name: "Midnight Navy", color: "#1e2d42", image: "/images/trace/accessories/duffel-midnight-navy.jpg" },
      { name: "Sand Beige", color: "#c2b69d", image: "/images/trace/accessories/duffel-sand-beige.jpg" },
      { name: "Charcoal Grey", color: "#4b5563", image: "/images/trace/accessories/duffel-charcoal-grey.jpg" },
    ],
    badge: "Signature",
  },

  // --- Everyday Travel Essentials (Document Page 1) ---
  {
    sku: "accessory-compression-cubes",
    name: "Modular Compression Packing Cubes",
    subtitle: "Model-Specific Fit · YKK Compression Zips",
    description: "Engineered to organize outfits and compress soft clothing. Breathable aero-mesh panels with self-repairing dual perimeter compression zippers reduce packing volume by up to 40%.",
    image: "/images/trace/accessories/collection/packing-cubes.jpg",
    price_minor: 4900,
    currency: "USD",
    available: 150,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 18,
    volumeGal: 4.8,
    weightKg: 0.28,
    weightLbs: 0.62,
    dimensionsCm: { height: 35, width: 25, depth: 10 },
    dimensionsInches: { height: 13.8, width: 9.8, depth: 3.9 },
    features: [
      "Set of 3 Tailored Compression Cubes (Large, Medium, Small)",
      "Model-Specific Fit for Cabin 55 and Check-In 68",
      "Dual Perimeter YKK Compression Zips (40% Volume Reduction)",
      "Ultra-Lightweight Diamond Ripstop Fabric",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/packing-cubes.jpg" },
      { name: "Slate Graphite", color: "#2b2d2f", image: "/images/trace/accessories/collection/packing-cubes-graphite.jpg" },
      { name: "Sandstone Khaki", color: "#c2b69d", image: "/images/trace/accessories/collection/packing-cubes-khaki.jpg" },
    ],
    badge: "Bestseller",
  },
  {
    sku: "accessory-luggage-cover",
    name: "Fitted Protective Luggage Cover",
    subtitle: "Scuff Reduction · Preserves Monogram Visibility",
    description: "Tailored neoprene and elastane barrier engineered to reduce surface scuffs and scratches during transit while preserving full access to handles, TSA locks, and visibility of the AMORTRAV monogram.",
    image: "/images/trace/accessories/collection/luggage-cover.jpg",
    price_minor: 3900,
    currency: "USD",
    available: 120,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Jacquard Webbing",
    collection: "Accessories",
    volumeL: 0,
    volumeGal: 0,
    weightKg: 0.32,
    weightLbs: 0.7,
    dimensionsCm: { height: 55, width: 40, depth: 23 },
    dimensionsInches: { height: 21.6, width: 15.7, depth: 9.0 },
    features: [
      "Impact & Scuff Resistant High-Elasticity Neoprene",
      "Precision Cutouts for Handles & Multiwheel Casters",
      "Preserves AMORTRAV Monogram & Anodized Finish",
      "Reinforced Base Zippers with Elastic Under-Lock",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/luggage-cover.jpg" },
      { name: "Stealth Obsidian", color: "#111827", image: "/images/trace/accessories/collection/luggage-cover-obsidian.jpg" },
    ],
    badge: "Essential",
  },
  {
    sku: "accessory-toiletry-organiser",
    name: "Hanging Toiletry Organiser",
    subtitle: "Hanging Stowage · Removable Spill Compartment",
    description: "Water-repellent hanging wash kit with structured internal compartments, elastic bottle retainers, and a removable, easy-clean waterproof compartment for accidental spills.",
    image: "/images/trace/accessories/collection/toiletry-organiser.jpg",
    price_minor: 4500,
    currency: "USD",
    available: 130,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 5,
    volumeGal: 1.3,
    weightKg: 0.22,
    weightLbs: 0.48,
    dimensionsCm: { height: 24, width: 26, depth: 10 },
    dimensionsInches: { height: 9.4, width: 10.2, depth: 3.9 },
    features: [
      "Stow-Away Aircraft Aluminium Swivel Hanging Hook",
      "Removable Easy-Clean Leakproof Compartment",
      "Mesh Organization Pockets & Elastic Bottle Retainers",
      "Water-Repellent Antimicrobial Micro-Ripstop",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/toiletry-organiser.jpg" },
      { name: "Charcoal Grey", color: "#4b5563", image: "/images/trace/accessories/collection/toiletry-organiser-charcoal.jpg" },
    ],
  },
  {
    sku: "accessory-tech-organiser",
    name: "Precision Tech & Cable Organiser",
    subtitle: "Cables, Adapters, Earphones & Small Electronics",
    description: "Dedicated organized clamshell storage for power bricks, charging cables, portable batteries, and accessories. Features elastic retention loops and zippered mesh pockets.",
    image: "/images/trace/accessories/collection/tech-organiser.jpg",
    price_minor: 4200,
    currency: "USD",
    available: 140,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 3,
    volumeGal: 0.8,
    weightKg: 0.19,
    weightLbs: 0.42,
    dimensionsCm: { height: 22, width: 16, depth: 6 },
    dimensionsInches: { height: 8.7, width: 6.3, depth: 2.4 },
    features: [
      "Clamshell 180° Lay-Flat Opening Architecture",
      "Dual-Zone Elastic Retention Bands for Cables & Dongles",
      "Padded Sleeve for External Hard Drives & Power Banks",
      "Water-Resistant Reverse YKK Zippers",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/tech-organiser.jpg" },
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/accessories/collection/tech-organiser-black.jpg" },
    ],
  },
  {
    sku: "accessory-shoe-laundry-set",
    name: "Shoe & Laundry Bag Set (Twin)",
    subtitle: "Footwear & Garment Separation · Drawcord Cinch",
    description: "Pair of water-resistant, odor-resistant drawstring travel bags to keep footwear and worn clothes hygienically separated from pristine clothing in your suitcase.",
    image: "/images/trace/accessories/collection/shoe-laundry-bags.jpg",
    price_minor: 2900,
    currency: "USD",
    available: 160,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 8,
    volumeGal: 2.1,
    weightKg: 0.12,
    weightLbs: 0.26,
    dimensionsCm: { height: 38, width: 28, depth: 2 },
    dimensionsInches: { height: 15.0, width: 11.0, depth: 0.8 },
    features: [
      "Breathable Odor-Resistant Silver-Ion Infused Weave",
      "Twin Set: Dedicated Footwear Bag & Laundry Cinch Pouch",
      "Heavy-Duty Braided Nautical Drawcord with Metal Cord-Locks",
      "Machine Washable & Ultra-Packable",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/shoe-laundry-bags.jpg" },
      { name: "Heather Grey", color: "#6b7280", image: "/images/trace/accessories/collection/shoe-laundry-bags-grey.jpg" },
    ],
  },
  {
    sku: "accessory-passport-wallet",
    name: "Passport & Document Travel Wallet",
    subtitle: "Passports, Boarding Passes & Cards · RFID Shielded",
    description: "Handcrafted full-grain leather travel organizer for passports, boarding passes, currency, and travel documents. Features RFID electromagnetic shielding and pen holder.",
    image: "/images/trace/accessories/collection/passport-wallet.jpg",
    price_minor: 4900,
    currency: "USD",
    available: 110,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Leather",
    collection: "Accessories",
    volumeL: 0,
    volumeGal: 0,
    weightKg: 0.14,
    weightLbs: 0.31,
    dimensionsCm: { height: 21, width: 12, depth: 1.5 },
    dimensionsInches: { height: 8.3, width: 4.7, depth: 0.6 },
    features: [
      "Accommodates up to 2 Passports & Folded Boarding Documents",
      "Full-Spectrum RFID-Blocking Inner Lining",
      "5 Precision Card Slots & Full-Length Currency Sleeve",
      "Integrated Brushed Aluminium Pen Holder",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/passport-wallet.jpg" },
      { name: "Cognac Brown", color: "#7a411f", image: "/images/trace/accessories/collection/passport-wallet-cognac.jpg" },
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/accessories/collection/passport-wallet-black.jpg" },
    ],
  },
  {
    sku: "accessory-leather-tag",
    name: "Personalised Leather Luggage Tag & Charms",
    subtitle: "Italian Calfskin · Covered Privacy Contact Card",
    description: "Full-grain Italian calfskin luggage tag with concealed address privacy flap, solid titanium screw gudgeon, and optional hot-stamped monogram embossing in metallic foil.",
    image: "/images/trace/accessories/collection/tags-personalisation.jpg",
    price_minor: 2500,
    currency: "USD",
    available: 200,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Leather",
    collection: "Accessories",
    volumeL: 0,
    volumeGal: 0,
    weightKg: 0.06,
    weightLbs: 0.13,
    dimensionsCm: { height: 11, width: 6.5, depth: 0.5 },
    dimensionsInches: { height: 4.3, width: 2.5, depth: 0.2 },
    features: [
      "Full-Grain Vegetable-Tanned Italian Calfskin",
      "Covered Magnetic Flap for Passenger Privacy & Data Protection",
      "Solid Aircraft Titanium Screw Clasp",
      "Complimentary Atelier Monogram Debossing",
    ],
    swatches: [
      { name: "Cognac Brown", color: "#7a411f", image: "/images/trace/accessories/collection/tags-personalisation.jpg" },
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/tags-personalisation-navy.jpg" },
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/accessories/collection/tags-personalisation-black.jpg" },
    ],
    badge: "Bespoke",
  },
  {
    sku: "accessory-foldable-day-bag",
    name: "Foldable Destination Day Bag",
    subtitle: "Ultra-Lightweight · Packs Inside Carry-On",
    description: "Packs into its own palm-sized compact pouch inside your suitcase, expanding instantly at your destination into a durable, water-resistant tote for sightseeing and shopping.",
    image: "/images/trace/accessories/collection/foldable-day-bag.jpg",
    price_minor: 4900,
    currency: "USD",
    available: 95,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 22,
    volumeGal: 5.8,
    weightKg: 0.18,
    weightLbs: 0.4,
    dimensionsCm: { height: 38, width: 44, depth: 16 },
    dimensionsInches: { height: 15.0, width: 17.3, depth: 6.3 },
    features: [
      "Packs into Integrated 12cm Compact Storage Pouch",
      "22L Destination Capacity with Luggage Trolley Pass-Through",
      "Reinforced Tubular Handles & Shoulder Strap",
      "Ultra-Durable Water-Repellent Ripstop",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/foldable-day-bag.jpg" },
      { name: "Olive Green", color: "#3e533e", image: "/images/trace/accessories/collection/foldable-day-bag-olive.jpg" },
    ],
  },

  // --- Premium & Executive Range (Document Page 2) ---
  {
    sku: "accessory-jewellery-case",
    name: "Jewellery Travel Vault Case",
    subtitle: "Soft Velvet Lining · Necklace Fastenings & Ring Slots",
    description: "Protective structured case with anti-tarnish micro-suede lining, specialized necklace hanging snaps, ring channels, and removable pouch for fine jewellery.",
    image: "/images/trace/accessories/collection/jewellery-case.jpg",
    price_minor: 11000,
    currency: "USD",
    available: 70,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 2,
    volumeGal: 0.5,
    weightKg: 0.45,
    weightLbs: 1.0,
    dimensionsCm: { height: 14, width: 18, depth: 6 },
    dimensionsInches: { height: 5.5, width: 7.1, depth: 2.4 },
    features: [
      "Rigid Protective Aerospace Aluminium Framework",
      "Anti-Tarnish Midnight Navy Micro-Suede Interior",
      "Dedicated Tangling-Prevention Necklace Snaps",
      "Includes Removable Compact Evening Pouch",
    ],
    swatches: [
      { name: "Brushed Silver", color: "#c5cbd3", image: "/images/trace/accessories/collection/jewellery-case.jpg" },
      { name: "Champagne Gold", color: "#d8b888", image: "/images/trace/accessories/collection/jewellery-case-gold.jpg" },
    ],
    badge: "Executive",
  },
  {
    sku: "accessory-watch-case",
    name: "Aluminium Watch Travel Vault",
    subtitle: "Fingerprint Biometric Sensor · Padded Cushions",
    description: "Brushed anodized aluminium shell with biometric fingerprint sensor and mechanical backup lock. Individually padded compartments with removable ergonomic cushions.",
    image: "/images/trace/accessories/collection/watch-case.jpg",
    price_minor: 18500,
    currency: "USD",
    available: 60,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 3,
    volumeGal: 0.8,
    weightKg: 0.85,
    weightLbs: 1.87,
    dimensionsCm: { height: 10, width: 22, depth: 10 },
    dimensionsInches: { height: 3.9, width: 8.7, depth: 3.9 },
    features: [
      "Biometric Fast-Fingerprint Sensor with Key Backup",
      "Available in 3-, 4-, and 6-Watch Modular Layouts",
      "Individually Padded Micro-Velvet Timepiece Cushions",
      "Aircraft-Grade Anodized Solid Aluminium Shell",
    ],
    swatches: [
      { name: "Brushed Titanium", color: "#c5cbd3", image: "/images/trace/accessories/collection/watch-case.jpg" },
      { name: "Stealth Obsidian", color: "#1a1a1a", image: "/images/trace/accessories/collection/watch-case-obsidian.jpg" },
    ],
    badge: "Biometric",
  },
  {
    sku: "accessory-valuables-case",
    name: "Aluminium Executive Valuables Case",
    subtitle: "Reinforced Corners · Fingerprint Access & Backup Lock",
    description: "Brushed aluminium shell with reinforced corner castings, modular padded watch and jewellery storage, removable midnight-blue leather pouch, and dual-layer security access.",
    image: "/images/trace/accessories/collection/valuables-case.jpg",
    price_minor: 24500,
    currency: "USD",
    available: 45,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 6,
    volumeGal: 1.6,
    weightKg: 1.35,
    weightLbs: 2.97,
    dimensionsCm: { height: 16, width: 28, depth: 14 },
    dimensionsInches: { height: 6.3, width: 11.0, depth: 5.5 },
    features: [
      "Heavy-Duty Reinforced Cast Aluminium Corner Protectors",
      "Biometric Fingerprint Module & Precision Tumbler Key Lock",
      "Modular Compartments for Timepieces, Passports & Valuables",
      "Removable Midnight-Blue Italian Leather Vault Pouch",
    ],
    swatches: [
      { name: "Brushed Silver", color: "#c5cbd3", image: "/images/trace/accessories/collection/valuables-case.jpg" },
      { name: "Stealth Obsidian", color: "#1a1a1a", image: "/images/trace/accessories/collection/valuables-case-obsidian.jpg" },
    ],
    badge: "Biometric",
  },
  {
    sku: "accessory-cross-body",
    name: "Personal Cross-Body Valuables Bag",
    subtitle: "Adjustable Webbing Strap · Quick-Access Zipped Compartments",
    description: "Compact, ergonomic cross-body bag tailored for airport transit and city exploration. Holds passport, phone, wallet, keys, and transit essentials in organized security.",
    image: "/images/trace/accessories/collection/cross-body-bag.jpg",
    price_minor: 12000,
    currency: "USD",
    available: 85,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Leather",
    collection: "Accessories",
    volumeL: 3,
    volumeGal: 0.8,
    weightKg: 0.42,
    weightLbs: 0.93,
    dimensionsCm: { height: 18, width: 24, depth: 7 },
    dimensionsInches: { height: 7.1, width: 9.4, depth: 2.8 },
    features: [
      "Supple Midnight-Blue Italian Leather with Aluminium Accents",
      "Integrated RFID-Shielded Internal Compartment",
      "Adjustable Heavy-Duty Seatbelt Jacquard Strap",
      "Padded Sleeve Sized for iPhone Pro Max & Passports",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/cross-body-bag.jpg" },
      { name: "Onyx Black", color: "#1a1a1a", image: "/images/trace/accessories/collection/cross-body-bag-black.jpg" },
    ],
  },
  {
    sku: "accessory-luxury-pouch",
    name: "Luxury Zipped Atelier Pouch",
    subtitle: "Slim Profile · Internal Dividers & Wrist Strap",
    description: "Slim lined leather pouch with precision internal dividers for payment cards, room keys, and small personal valuables. Features detachable leather wristlet.",
    image: "/images/trace/accessories/collection/luxury-pouch.jpg",
    price_minor: 8500,
    currency: "USD",
    available: 90,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Leather",
    collection: "Accessories",
    volumeL: 1.5,
    volumeGal: 0.4,
    weightKg: 0.24,
    weightLbs: 0.53,
    dimensionsCm: { height: 16, width: 26, depth: 2 },
    dimensionsInches: { height: 6.3, width: 10.2, depth: 0.8 },
    features: [
      "Handcrafted Saffiano & Smooth Italian Leather",
      "Internal Accordion Organizers with 6 Card Pockets",
      "Detachable Full-Grain Leather Wristlet",
      "Smooth Polished Aluminium Zipper Action",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/luxury-pouch.jpg" },
      { name: "Cognac Brown", color: "#7a411f", image: "/images/trace/accessories/collection/luxury-pouch-cognac.jpg" },
    ],
  },
  {
    sku: "accessory-vanity-case",
    name: "Vanity & Cosmetics Hardcase",
    subtitle: "Structured Shell · Washable Lining & LED Vanity Mirror",
    description: "Structured protective aluminium shell with adjustable modular dividers, spill-proof washable midnight-blue lining, bottle elastic retainers, and removable mirror.",
    image: "/images/trace/accessories/collection/vanity-case.jpg",
    price_minor: 17000,
    currency: "USD",
    available: 55,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 10,
    volumeGal: 2.6,
    weightKg: 1.45,
    weightLbs: 3.2,
    dimensionsCm: { height: 22, width: 32, depth: 16 },
    dimensionsInches: { height: 8.7, width: 12.6, depth: 6.3 },
    features: [
      "Impact-Resistant Anodized Aluminium Exterior",
      "Washable Spill-Proof Anti-Stain Lining",
      "Detachable Illuminated Vanity LED Mirror",
      "Trolley Pass-Through Sleeve for Suitcase Stacking",
    ],
    swatches: [
      { name: "Brushed Silver", color: "#c5cbd3", image: "/images/trace/accessories/collection/vanity-case.jpg" },
      { name: "Rose Titanium", color: "#d8b888", image: "/images/trace/accessories/collection/vanity-case-rose.jpg" },
    ],
  },
  {
    sku: "accessory-sunglasses-case",
    name: "Structured Sunglasses Travel Case",
    subtitle: "Hard Shell Protection · Microfibre Suede Lining",
    description: "Crush-proof protective structure lined with ultra-soft scratch-resistant microfibre velvet. Magnetically secured clamshell closure for luxury eyewear.",
    image: "/images/trace/accessories/collection/sunglasses-case.jpg",
    price_minor: 5500,
    currency: "USD",
    available: 130,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 0.5,
    volumeGal: 0.13,
    weightKg: 0.16,
    weightLbs: 0.35,
    dimensionsCm: { height: 6.5, width: 17, depth: 7.5 },
    dimensionsInches: { height: 2.6, width: 6.7, depth: 3.0 },
    features: [
      "Crush-Proof Aluminium Hybrid Shell",
      "Ultra-Plush Microfibre Lining with Anti-Scratch Cushion",
      "Magnetic Precision Clamshell Closure",
      "Compact Ergonomic Form Fits Any Bag Pocket",
    ],
    swatches: [
      { name: "Midnight Navy & Silver", color: "#1d3356", image: "/images/trace/accessories/collection/sunglasses-case.jpg" },
      { name: "Obsidian Black", color: "#1a1a1a", image: "/images/trace/accessories/collection/sunglasses-case-black.jpg" },
    ],
  },
  {
    sku: "accessory-executive-briefcase",
    name: "Executive Aluminium Attache Briefcase",
    subtitle: "Fingerprint Biometric · Padded Laptop & Tech Organiser",
    description: "Aerospace aluminium briefcase featuring integrated fingerprint biometric security, padded laptop sleeve, document organizers, card pockets, pen loops, and cable harness.",
    image: "/images/trace/accessories/collection/executive-briefcase.jpg",
    price_minor: 37500,
    currency: "USD",
    available: 40,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Aluminium",
    collection: "Accessories",
    volumeL: 14,
    volumeGal: 3.7,
    weightKg: 2.1,
    weightLbs: 4.63,
    dimensionsCm: { height: 32, width: 44, depth: 11 },
    dimensionsInches: { height: 12.6, width: 17.3, depth: 4.3 },
    features: [
      "Dual Biometric Fingerprint Locks with Mechanical Key Override",
      "Padded Laptop Compartment (Fits up to 16\" MacBook Pro)",
      "Dedicated Document Sleeves, Pen Loops & Tech Harness",
      "Aerospace Aluminium Shell with Diagonal Sculpted Ribs",
    ],
    swatches: [
      { name: "Brushed Silver Aluminium", color: "#c5cbd3", image: "/images/trace/accessories/collection/executive-briefcase.jpg" },
      { name: "Stealth Obsidian", color: "#1a1a1a", image: "/images/trace/accessories/collection/executive-briefcase-black.jpg" },
    ],
    badge: "Executive",
  },

  // --- Official Launch Bundles (Document Page 3) ---
  {
    sku: "bundle-packing-essentials",
    name: "Packing Essentials Bundle",
    subtitle: "Compression Packing Cubes + Shoe & Laundry Bag Set",
    description: "Complete modular packing solution: Set of 3 tailored compression packing cubes plus the shoe and laundry twin-bag set. Curated for streamlined cabin packing with £19 bundle savings.",
    image: "/images/trace/accessories/collection/bundle-packing-essentials.jpg",
    price_minor: 7500,
    currency: "USD",
    available: 80,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 26,
    volumeGal: 6.9,
    weightKg: 0.4,
    weightLbs: 0.88,
    dimensionsCm: { height: 38, width: 28, depth: 12 },
    dimensionsInches: { height: 15.0, width: 11.0, depth: 4.7 },
    features: [
      "Includes 3-Piece Compression Packing Cube Set",
      "Includes Twin Shoe & Laundry Separation Bag Set",
      "Curated for Cabin 55 and Check-In 68 Compartments",
      "Over 20% Bundle Savings vs Individual Purchase",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/bundle-packing-essentials.jpg" },
      { name: "Slate Graphite", color: "#2b2d2f", image: "/images/trace/accessories/collection/bundle-packing-essentials-graphite.jpg" },
    ],
    badge: "Bundle & Save",
  },
  {
    sku: "bundle-complete-travel-kit",
    name: "Complete Travel Kit Bundle (5-Piece)",
    subtitle: "Cubes + Luggage Cover + Toiletry + Tech + Laundry Set",
    description: "The definitive travel companion package: Compression cubes, fitted protective luggage cover, hanging toiletry organiser, tech organiser, and shoe/laundry set with £45 bundle savings.",
    image: "/images/trace/accessories/collection/bundle-complete-travel-kit.jpg",
    price_minor: 16500,
    currency: "USD",
    available: 50,
    category: "Accessories",
    sizeCategory: "Accessory",
    material: "Ripstop Nylon",
    collection: "Accessories",
    volumeL: 35,
    volumeGal: 9.2,
    weightKg: 1.15,
    weightLbs: 2.54,
    dimensionsCm: { height: 40, width: 30, depth: 20 },
    dimensionsInches: { height: 15.7, width: 11.8, depth: 7.9 },
    features: [
      "5-Piece Comprehensive Travel Organizer System",
      "Compression Cubes + Fitted Cover + Toiletry + Tech + Shoe Bag",
      "Engineered for Seamless Integration with AMORTRAV Cases",
      "Signature Midnight Navy Coordinated Colorway",
    ],
    swatches: [
      { name: "Midnight Navy", color: "#1d3356", image: "/images/trace/accessories/collection/bundle-complete-travel-kit.jpg" },
    ],
    badge: "Complete Kit",
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
