"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Palette, Check, Layers, Rotate3d, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Button from "../_components/Button";
import ProductVideo from "../_components/ProductVideo";
import BagViewer, { LUXURY_PALETTE_PRESETS } from "../_components/BagViewer";
import TechnicalBlueprint from "../_components/TechnicalBlueprint";
import CartDrawer from "../_components/CartDrawer";
import {
  CATALOG,
  ShopProduct,
  ColorSwatch,
  ESSENTIAL_SWATCHES,
  PRO_FLAGSHIP_SWATCHES,
  addToCart,
} from "@/lib/shop";
import { useRegion } from "@/lib/region";
import { useI18n } from "@/lib/i18n/context";

type SizeOption = "cabin" | "checkin" | "both";
type FilterType = "all" | "cabin" | "checkin" | "both" | "bags";
type SortOption = "top-sellers" | "price-asc" | "price-desc" | "volume";

interface CollectionCardData {
  tier: "essential" | "pro" | "executive" | "flagship";
  name: string;
  tagline: string;
  material: "Polycarbonate" | "Aluminium";
  swatches: ColorSwatch[];
  badge?: "Bestseller" | "Customise" | "Signature";
  baseSkus: {
    cabin: string;
    checkin: string;
    both: string;
  };
  prices: {
    cabin: number;
    checkin: number;
    both: number;
  };
  volumes: {
    cabin: number;
    checkin: number;
    both: number;
  };
  weights: {
    cabin: number;
    checkin: number;
    both: number;
  };
  dimensions: {
    cabin: string;
    checkin: string;
    both: string;
  };
  features: string[];
}

const LUGGAGE_COLLECTIONS: CollectionCardData[] = [
  // 1. Essential (Photo 1: Midnight Black, Space Grey, Navy Blue)
  {
    tier: "essential",
    name: "AMTRAV Essential",
    tagline: "High-impact resilient polycarbonate with ultra-silent Multiwheels and built-in TRACE Smart Core.",
    material: "Polycarbonate",
    swatches: ESSENTIAL_SWATCHES,
    badge: "Bestseller",
    baseSkus: {
      cabin: "essential-cabin-55",
      checkin: "essential-checkin-68",
      both: "essential-the-pair",
    },
    prices: {
      cabin: 32900,
      checkin: 39900,
      both: 65900,
    },
    volumes: {
      cabin: 35,
      checkin: 65,
      both: 100,
    },
    weights: {
      cabin: 3.8,
      checkin: 4.8,
      both: 8.6,
    },
    dimensions: {
      cabin: "55 × 40 × 23 cm",
      checkin: "68 × 45 × 28 cm",
      both: "Matched 55 + 68 cm Duo",
    },
    features: [
      "Airline Overhead Bin Compliant",
      "Impact-Resistant Polycarbonate Shell",
      "TRACE Smart Core Self-Weighing",
      "Dual TSA Combination Locks",
      "Lifetime Functional Guarantee",
    ],
  },

  // 2. Pro (Photo 2: Graphite Black, Midnight Blue, Titanium Silver, Pearl White, Champagne Gold, Forest Green)
  {
    tier: "pro",
    name: "AMTRAV Pro",
    tagline: "Aerospace-grade grooved aluminium-magnesium alloy with reinforced corners and impact verification.",
    material: "Aluminium",
    swatches: PRO_FLAGSHIP_SWATCHES,
    badge: "Customise",
    baseSkus: {
      cabin: "pro-cabin-55",
      checkin: "pro-checkin-68",
      both: "pro-the-pair",
    },
    prices: {
      cabin: 38900,
      checkin: 48900,
      both: 77900,
    },
    volumes: {
      cabin: 35,
      checkin: 65,
      both: 100,
    },
    weights: {
      cabin: 4.3,
      checkin: 5.4,
      both: 9.7,
    },
    dimensions: {
      cabin: "55 × 40 × 23 cm",
      checkin: "68 × 45 × 28 cm",
      both: "Matched 55 + 68 cm Duo",
    },
    features: [
      "Aerospace Aluminium-Magnesium Alloy",
      "Reinforced Anodized Corner Caps",
      "Stage-Free Telescopic Handle",
      "Dual TSA-Approved Latches",
      "Lifetime Structural Guarantee",
    ],
  },

  // 3. Executive (Photo 2 swatches + Custom Palette)
  {
    tier: "executive",
    name: "AMTRAV Executive",
    tagline: "Obsidian anodized aluminium architecture designed for seamless high-frequency global executive transit.",
    material: "Aluminium",
    swatches: PRO_FLAGSHIP_SWATCHES,
    baseSkus: {
      cabin: "executive-cabin-55",
      checkin: "executive-checkin-68",
      both: "executive-the-pair",
    },
    prices: {
      cabin: 44900,
      checkin: 54900,
      both: 89900,
    },
    volumes: {
      cabin: 35,
      checkin: 65,
      both: 100,
    },
    weights: {
      cabin: 4.4,
      checkin: 5.6,
      both: 10.0,
    },
    dimensions: {
      cabin: "55 × 40 × 23 cm",
      checkin: "68 × 45 × 28 cm",
      both: "Matched 55 + 68 cm Duo",
    },
    features: [
      "Diamond-Cut Grooved Anodized Alloy",
      "Impact Timestamp Logging",
      "Reinforced Structural Rivets",
      "Dual TSA-Approved Latches",
      "VIP Concierge Client Care",
    ],
  },

  // 4. Flagship (Photo 2 swatches + Custom Palette)
  {
    tier: "flagship",
    name: "AMTRAV Flagship",
    tagline: "Our peak engineering achievement with luxury custom milled hardware, integrated load cells, and lifetime VIP service.",
    material: "Aluminium",
    swatches: PRO_FLAGSHIP_SWATCHES,
    badge: "Signature",
    baseSkus: {
      cabin: "flagship-cabin-55",
      checkin: "flagship-checkin-68",
      both: "flagship-the-pair",
    },
    prices: {
      cabin: 49900,
      checkin: 59900,
      both: 98900,
    },
    volumes: {
      cabin: 35,
      checkin: 65,
      both: 100,
    },
    weights: {
      cabin: 4.5,
      checkin: 5.8,
      both: 10.3,
    },
    dimensions: {
      cabin: "55 × 40 × 23 cm",
      checkin: "68 × 45 × 28 cm",
      both: "Matched 55 + 68 cm Duo",
    },
    features: [
      "Signature Grooved Architecture",
      "Integrated Handle Load Cell Weigher",
      "Multi-Frequency Global Tracking",
      "Complimentary Custom Monogramming",
      "Priority VIP Global Repair Hubs",
    ],
  },
];

function InteractiveLuggageCard({
  collection,
  onSelectForSpecs,
  onAddToCart,
  initialSize = "cabin",
}: {
  collection: CollectionCardData;
  onSelectForSpecs: (product: ShopProduct) => void;
  onAddToCart: (compoundSku: string) => void;
  initialSize?: SizeOption;
}) {
  const { formatPrice } = useRegion();
  const [selectedSize, setSelectedSize] = useState<SizeOption>(initialSize);
  const [selectedSwatch, setSelectedSwatch] = useState<ColorSwatch>(collection.swatches[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customHex, setCustomHex] = useState("#c2a87d");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const currentPrice = collection.prices[selectedSize];
  const currentVolume = collection.volumes[selectedSize];
  const currentDimensions = collection.dimensions[selectedSize];

  // Active color code
  const activeColorHex = isCustomColor ? customHex : selectedSwatch.color;
  const activeColorName = isCustomColor ? "Custom Color" : selectedSwatch.name;

  // Active product image
  const displayImage = selectedSize === "both" ? "/images/trace/hero-pair.jpg" : selectedSwatch.image;

  const handleReserve = () => {
    const baseSku = collection.baseSkus[selectedSize];
    const cleanHex = activeColorHex.replace("#", "");
    const compoundSku = `${baseSku}__${encodeURIComponent(activeColorName)}__${cleanHex}`;
    onAddToCart(compoundSku);
  };

  const handleSpecsClick = () => {
    const baseSku = collection.baseSkus[selectedSize];
    const resolved = CATALOG.find((p) => p.sku === baseSku) || CATALOG[1];
    onSelectForSpecs(resolved);
    document.getElementById("technical-specs")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <article className="group flex flex-col justify-between rounded-3xl bg-white p-4 shadow-card transition-all duration-300 hover:shadow-xl border border-divider">
      {/* Product Image Frame */}
      <div className="relative aspect-[1.3] overflow-hidden rounded-2xl bg-surface/50 p-4 transition-colors group-hover:bg-surface/80">
        <Image
          src={displayImage}
          alt={`${collection.name} in ${activeColorName}`}
          fill
          sizes="(min-width: 1024px) 380px, 90vw"
          className="object-contain transition-transform duration-300 group-hover:scale-104"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {collection.badge && (
            <span className="rounded-full bg-navy/5 border border-navy/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy backdrop-blur-sm">
              {collection.badge}
            </span>
          )}
          {isCustomColor && (
            <span className="rounded-full bg-sky/30 border border-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand backdrop-blur-sm">
              Custom Shade
            </span>
          )}
        </div>

        <span className="absolute top-3 right-3 font-mono text-[11px] text-mid bg-white/80 px-2 py-0.5 rounded-full border border-divider">
          {currentVolume}L
        </span>
      </div>

      {/* Body Information */}
      <div className="flex flex-1 flex-col justify-between pt-4">
        <div>
          {/* Header & Material */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-mid">
                {collection.material}
              </span>
              <h3 className="text-h3-m font-bold text-navy xl:text-[21px]">
                {collection.name}
              </h3>
            </div>
            <Link
              href="#3d-inspection"
              className="flex items-center gap-1 rounded-full border border-divider px-2.5 py-1 text-[11px] font-semibold text-mid hover:text-navy hover:bg-surface transition-colors"
              title="Examine in 3D"
            >
              <Rotate3d className="size-3 text-brand" />
              <span>3D</span>
            </Link>
          </div>

          <p className="mt-1 text-caption text-mid line-clamp-2">
            {collection.tagline}
          </p>

          {/* Luggage Type Selector Pills (Cabin 55, Check-In 68, Both) */}
          <div className="mt-3.5">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-mid mb-1.5">
              Select Luggage Type
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface p-1 border border-divider">
              <button
                type="button"
                onClick={() => setSelectedSize("cabin")}
                className={`rounded-lg py-1.5 text-center text-[11px] font-semibold transition-all ${
                  selectedSize === "cabin"
                    ? "bg-navy text-white shadow-xs"
                    : "text-mid hover:text-navy"
                }`}
              >
                Cabin 55
              </button>
              <button
                type="button"
                onClick={() => setSelectedSize("checkin")}
                className={`rounded-lg py-1.5 text-center text-[11px] font-semibold transition-all ${
                  selectedSize === "checkin"
                    ? "bg-navy text-white shadow-xs"
                    : "text-mid hover:text-navy"
                }`}
              >
                Check-In 68
              </button>
              <button
                type="button"
                onClick={() => setSelectedSize("both")}
                className={`rounded-lg py-1.5 text-center text-[11px] font-semibold transition-all ${
                  selectedSize === "both"
                    ? "bg-navy text-white shadow-xs"
                    : "text-mid hover:text-navy"
                }`}
              >
                Both (Duo)
              </button>
            </div>
          </div>

          {/* Color Swatch Options + Custom Color Palette Trigger */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-divider/60 pt-3">
            <div className="flex items-center gap-1.5">
              {collection.swatches.map((swatch) => {
                const isSelected = !isCustomColor && selectedSwatch.name === swatch.name;
                const isLightColor = swatch.color === "#f4f5f7" || swatch.color === "#c5cbd3";
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    title={swatch.name}
                    onClick={() => {
                      setIsCustomColor(false);
                      setSelectedSwatch(swatch);
                      setPaletteOpen(false);
                    }}
                    className={`relative flex size-6 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "scale-120 border-navy ring-2 ring-navy/20 shadow-xs"
                        : "border-black/20 hover:scale-110"
                    }`}
                    style={{ backgroundColor: swatch.color }}
                  >
                    {isSelected && (
                      <Check
                        className={`size-2.5 ${
                          isLightColor ? "text-navy" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}

              {/* Custom Color Dot Indicator */}
              {isCustomColor && (
                <span
                  className="size-6 rounded-full border-2 border-brand ring-2 ring-brand/30 shadow-xs flex items-center justify-center"
                  style={{ backgroundColor: customHex }}
                  title={`Custom Hex: ${customHex}`}
                >
                  <Check className="size-2.5 text-white drop-shadow" />
                </span>
              )}
            </div>

            {/* Custom Palette Toggle */}
            <button
              type="button"
              onClick={() => setPaletteOpen(!paletteOpen)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                isCustomColor || paletteOpen
                  ? "border-navy bg-navy text-white shadow-xs"
                  : "border-divider bg-surface text-navy hover:border-mid"
              }`}
            >
              <Palette className="size-3" />
              <span>Custom Palette</span>
            </button>
          </div>

          {/* Expandable Custom Color Palette Popover */}
          {paletteOpen && (
            <div className="mt-2.5 rounded-2xl border border-divider bg-surface p-3 shadow-md animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between gap-2 border-b border-divider pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navy">
                  Bespoke Color
                </span>
                <label className="relative flex cursor-pointer items-center gap-1.5 rounded-lg border border-divider bg-white px-2 py-0.5 text-[11px] font-mono text-navy hover:border-navy">
                  <span
                    className="size-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: customHex }}
                  />
                  <span>{customHex.toUpperCase()}</span>
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setIsCustomColor(true);
                    }}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
              </div>

              {/* Luxury Preset Pills */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LUXURY_PALETTE_PRESETS.slice(0, 6).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    title={p.name}
                    onClick={() => {
                      setCustomHex(p.hex);
                      setIsCustomColor(true);
                    }}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-all ${
                      isCustomColor && customHex === p.hex
                        ? "border-navy bg-navy/10 font-bold text-navy"
                        : "border-divider text-mid hover:text-navy hover:bg-white"
                    }`}
                  >
                    <span className="size-2 rounded-full" style={{ backgroundColor: p.hex }} />
                    <span className="truncate max-w-[80px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color & Size Label */}
          <div className="mt-2 text-[11px] text-mid">
            <span className="font-semibold text-navy">
              {selectedSize === "both" ? "Travel Duo Set" : selectedSize === "checkin" ? "Check-In 68" : "Cabin 55"}
            </span>{" "}
            in <span className="text-navy">{activeColorName}</span> · {currentDimensions}
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-5 flex items-center justify-between border-t border-divider/60 pt-3">
          <div>
            <span className="text-h3-m font-bold text-navy xl:text-[20px]">
              {formatPrice(currentPrice)}
            </span>
            <span className="block text-[10px] text-mid">incl. tax & global shipping</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpecsClick}
              className="rounded-full border border-divider px-3 py-1.5 text-caption font-semibold text-navy hover:bg-surface transition-colors"
            >
              Specs
            </button>

            <button
              type="button"
              onClick={handleReserve}
              className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
            >
              <ShoppingBag className="size-3.5" />
              <span>Reserve</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ShopView() {
  const router = useRouter();
  const { t } = useI18n();
  const { formatPrice, isEcommerce } = useRegion();
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<ShopProduct>(CATALOG[1]);
  const [cartOpen, setCartOpen] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("top-sellers");

  const handleAddToCart = (compoundSku: string) => {
    if (!isEcommerce) {
      router.push("/services/stores");
      return;
    }
    addToCart(compoundSku, 1);
    setCartOpen(true);
  };

  const handleBuyDuffel = () => {
    addToCart("duffel-side-bag", 1);
    setCartOpen(true);
  };

  // Filtered collections
  const filteredCollections = useMemo(() => {
    let list = [...LUGGAGE_COLLECTIONS];
    if (activeCollection !== "all") {
      list = list.filter((c) => c.tier === activeCollection);
    }
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.prices.cabin - b.prices.cabin);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.prices.cabin - a.prices.cabin);
    } else if (sortBy === "volume") {
      list.sort((a, b) => b.volumes.cabin - a.volumes.cabin);
    }
    return list;
  }, [activeCollection, sortBy]);

  const showDuffel = activeFilter === "all" || activeFilter === "bags";
  const showLuggage = activeFilter !== "bags";

  return (
    <>
      {/* 1. Clean AMTRAV Hero Section with Video */}
      <section
        id="shop-hero-dark"
        data-theme="dark"
        aria-labelledby="shop-heading"
        className="relative flex min-h-[580px] flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-navy px-5 pt-14 pb-6 md:px-10 md:pb-10 md:pt-24 xl:rounded-[32px] xl:px-14 xl:pt-32"
      >
        <ProductVideo />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/75 via-ink/65 to-navy/70" />
        <div className="relative mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <h1
            id="shop-heading"
            className="text-display-m font-bold text-white md:text-[60px] md:leading-[1.04] md:tracking-[-0.04em] xl:text-[70px]"
          >
            {t("shop.heroTitle", "Pick your bag.")}
            <br />
            <span className="text-sky">
              {t("shop.heroSubtitle", "TRACE comes in every one.")}
            </span>
          </h1>
          <p className="max-w-[660px] text-small text-light-white md:text-lead md:leading-normal">
            Precision aerospace suitcases and handcrafted suede side bags. Every case weighs itself, records each journey and protects your essentials for life.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="#range" label={t("nav.shop", "Shop the range")} style="sky" arrow />
            <Button href="#3d-inspection" label="3D Studio Inspection" style="outline" />
          </div>
        </div>

        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-5 rounded-3xl border border-line bg-white/10 p-5 text-white backdrop-blur-md md:grid-cols-4 md:gap-0 md:py-6">
          {[
            ["Journey Log", "Records each trip"],
            ["Impact detection", "Detects hard knocks"],
            ["Built-in weighing", "Weighs when you lift it"],
            ["Theft & tamper", "Alerts if moved or opened"],
          ].map(([name, detail], i) => (
            <li
              key={name}
              className="flex items-center gap-3 md:border-l md:border-line md:px-5 md:first:border-0"
            >
              <span className="font-mono text-caption-m text-sky">0{i + 1}</span>
              <span className="flex flex-col gap-1">
                <span className="text-caption-m md:text-small">{name}</span>
                <span className="text-[12px] leading-normal text-light-white md:text-caption">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. Interactive 3D Model Explorer */}
      <section
        id="3d-inspection"
        className="scroll-mt-28 my-8 flex flex-col gap-6 rounded-3xl border border-divider bg-surface px-5 py-8 md:px-10 xl:rounded-[32px] xl:px-14 xl:py-12"
      >
        <div className="flex flex-col gap-2">
          <span className="text-caption font-mono uppercase tracking-wider text-brand">
            Real-Time 3D Inspection & Custom Color Studio
          </span>
          <h2 className="text-h2-m font-bold text-navy xl:text-h2">
            Examine Every Angle Before You Fly
          </h2>
          <p className="max-w-xl text-body-m text-mid xl:text-body">
            Rotate the bag in real-time 3D, compare Cabin 55, Check-In 68, or Both (Duo Sets), preview finishes, and configure custom bespoke colors live.
          </p>
        </div>
        <BagViewer />
      </section>

      {/* 3. Clean RIMOWA-Inspired Product Range Grid & Refine Bar */}
      <section
        id="range"
        aria-labelledby="range-heading"
        className="scroll-mt-28 px-5 py-12 xl:px-14 xl:py-16"
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-4 mb-6">
          <div>
            <h2 id="range-heading" className="text-h1-m font-bold text-navy xl:text-h1">
              Pick your silhouette.
            </h2>
            <p className="mt-2 text-small text-mid">
              Engineered for global airlines. All smart features and lifetime guarantee included.
            </p>
          </div>
          <Link
            href="/customise"
            className="text-small font-semibold text-brand underline underline-offset-4 hover:text-navy"
          >
            Launch Full AMTRAV UNIQUE Studio Builder →
          </Link>
        </div>

        {/* RIMOWA-Inspired Horizontal Filter & Sort Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-divider bg-surface/60 p-3 backdrop-blur-sm">
          {/* Left: Size & Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-mid mr-1 hidden sm:inline">
              Filter:
            </span>
            {[
              { id: "all", label: "All Silhouettes" },
              { id: "cabin", label: "Cabin 55 (Carry-on)" },
              { id: "checkin", label: "Check-In 68" },
              { id: "both", label: "Complete Duo Sets (Both)" },
              { id: "bags", label: "Suede Bags" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as FilterType)}
                className={`rounded-full px-3 py-1.5 text-caption font-semibold transition-all ${
                  activeFilter === tab.id
                    ? "bg-navy text-white shadow-xs"
                    : "bg-white text-navy border border-divider hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Collection Filter & Sort Selectors */}
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
            {/* Collection Dropdown */}
            <div className="flex flex-1 sm:flex-initial items-center gap-1.5">
              <span className="text-[11px] font-mono text-mid hidden md:inline">Collection:</span>
              <select
                value={activeCollection}
                onChange={(e) => setActiveCollection(e.target.value)}
                className="w-full sm:w-auto rounded-full border border-divider bg-white px-3 py-1.5 text-caption font-semibold text-navy focus:outline-none focus:ring-1 focus:ring-navy"
              >
                <option value="all">All Collections</option>
                <option value="essential">Essential (Polycarbonate)</option>
                <option value="pro">Pro (Aluminium)</option>
                <option value="executive">Executive (Obsidian Alloy)</option>
                <option value="flagship">Flagship (Signature Alloy)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-1 sm:flex-initial items-center gap-1.5">
              <span className="text-[11px] font-mono text-mid hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto rounded-full border border-divider bg-white px-3 py-1.5 text-caption font-semibold text-navy focus:outline-none focus:ring-1 focus:ring-navy"
              >
                <option value="top-sellers">Top Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="volume">Volume (Liters)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Signature Suede Duffel Bag (When filter allows) */}
          {showDuffel && activeCollection === "all" && (
            <article className="group flex flex-col justify-between rounded-3xl bg-white p-4 shadow-card transition-all duration-300 hover:shadow-xl border border-divider h-full">
              <div className="relative aspect-[1.3] overflow-hidden rounded-2xl bg-surface/50 p-4 transition-colors group-hover:bg-surface/80">
                <Image
                  src="/images/trace/duffel-side-bag-studio.jpg"
                  alt="AMTRAV Premium Suede & Aluminium Duffel Side Bag"
                  fill
                  sizes="(min-width: 1024px) 380px, 90vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-104"
                />
                <span className="absolute top-3 left-3 rounded-full bg-navy/5 border border-navy/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy backdrop-blur-sm">
                  New Arrival
                </span>
                <span className="absolute top-3 right-3 font-mono text-[11px] text-mid bg-white/80 px-2 py-0.5 rounded-full border border-divider backdrop-blur-sm">
                  32L
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between pt-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-mid">
                    Italian Suede & Aluminium
                  </span>
                  <h3 className="text-h3-m font-bold text-navy xl:text-[21px]">
                    Suede Duffel Side Bag
                  </h3>
                  <p className="mt-1 text-caption text-mid line-clamp-2">
                    Handcrafted Italian suede with aerospace-grade ribbed aluminium stripes, RFID-shielded compartment, and travel strap.
                  </p>

                  {/* Suede Swatches */}
                  <div className="mt-3.5 flex items-center gap-1.5 border-t border-divider/60 pt-3">
                    {[
                      { name: "Cognac Brown", color: "#6e3b1b" },
                      { name: "Onyx Black", color: "#1a1a1a" },
                      { name: "Midnight Navy", color: "#10213b" },
                      { name: "Sand Beige", color: "#c2b29d" },
                      { name: "Charcoal Grey", color: "#424449" },
                    ].map((sw) => (
                      <span
                        key={sw.name}
                        className="size-5 rounded-full border border-black/20"
                        style={{ backgroundColor: sw.color }}
                        title={sw.name}
                      />
                    ))}
                    <span className="ml-1 text-[11px] text-mid">5 Suede Finishes</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-divider/60 pt-3">
                  <div>
                    <span className="text-h3-m font-bold text-navy xl:text-[20px]">
                      {formatPrice(48000)}
                    </span>
                    <span className="block text-[10px] text-mid">incl. tax & duties</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductForSpecs(CATALOG[0]);
                        document.getElementById("technical-specs")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-full border border-divider px-3 py-1.5 text-caption font-semibold text-navy hover:bg-surface transition-colors"
                    >
                      Specs
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyDuffel}
                      className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
                    >
                      <ShoppingBag className="size-3.5" />
                      <span>Reserve</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* 2. Interactive Luggage Collection Cards */}
          {showLuggage &&
            filteredCollections.map((col) => {
              const initialSize: SizeOption =
                activeFilter === "both" ? "both" : activeFilter === "checkin" ? "checkin" : "cabin";

              return (
                <InteractiveLuggageCard
                  key={col.tier}
                  collection={col}
                  initialSize={initialSize}
                  onSelectForSpecs={(prod) => setSelectedProductForSpecs(prod)}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
        </div>
      </section>

      {/* 4. Technical Blueprint CAD Dimensions Section */}
      <section id="technical-specs" className="scroll-mt-28 px-5 py-8 xl:px-14 xl:py-10">
        <div className="mx-auto max-w-4xl">
          <TechnicalBlueprint product={selectedProductForSpecs} />
        </div>
      </section>

      {/* 5. How Pre-Ordering & Reservations Work */}
      <section
        aria-labelledby="preorder-heading"
        className="mx-5 my-8 grid items-center gap-8 rounded-3xl border border-divider px-5 py-8 md:grid-cols-[1.2fr_1fr] md:gap-12 xl:mx-14 xl:rounded-[32px] xl:px-14 xl:py-14"
      >
        <div>
          <h2 id="preorder-heading" className="text-h1-m font-bold text-navy xl:text-h1">
            How reservations work
          </h2>
          <p className="mt-4 text-small text-mid">
            Reserve today and your bag is prioritized from the earliest serialized production run with complimentary initial monogramming.
          </p>
          <ol className="mt-6 flex flex-col gap-3">
            {[
              ["Choose your size & color", "Cabin 55, Check-In 68, or Both with primary or custom color palette."],
              ["Place your reservation", "Your bag is reserved from the first production run."],
              ["Follow along", "We will email you dispatch, manufacturing milestones and tracking updates."],
            ].map(([name, detail], i) => (
              <li
                key={name}
                className="flex items-center gap-4 rounded-3xl bg-white px-4 py-4 shadow-xs border border-divider"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-white font-mono font-bold">
                  0{i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-small font-semibold text-navy">{name}</span>
                  <span className="text-caption text-mid">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <article className="min-w-0 rounded-3xl bg-white p-2 shadow-card border border-divider">
          <div className="relative aspect-[1.5] overflow-hidden rounded-2xl bg-surface/50 p-2">
            <Image
              src="/images/trace/hero-pair.jpg"
              alt="AMTRAV Travel Duo Set"
              fill
              sizes="(min-width: 1280px) 520px, 90vw"
              className="object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-brand font-bold">Complete Travel System</span>
              <h3 className="text-h3 font-semibold text-navy">Matched Travel Duo Sets</h3>
              <p className="mt-0.5 text-caption text-mid">
                Cabin 55 + Check-In 68 · Synchronized TRACE Tracking
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddToCart("essential-the-pair__Navy%20Blue__1e2d42")}
              className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep transition-all"
            >
              <span>Reserve Set</span>
            </button>
          </div>
        </article>
      </section>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
