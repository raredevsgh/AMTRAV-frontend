"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  SlidersHorizontal,
  Rotate3D,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { CATALOG, ShopProduct, ColorSwatch, addToCart } from "@/lib/shop";
import { useRegion } from "@/lib/region";
import { useWishlist } from "@/lib/wishlist";
import BagViewer from "../_components/BagViewer";
import TechnicalBlueprint from "../_components/TechnicalBlueprint";
import CartDrawer from "../_components/CartDrawer";

export default function ShopClient() {
  const router = useRouter();
  const { formatPrice, isEcommerce } = useRegion();
  const { has: isWishlisted, toggle: toggleWishlist } = useWishlist();

  // Filter States
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All");
  const [selectedCollection, setSelectedCollection] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "volume">("featured");

  // Active PDP / Inspect Target
  const [activeProduct, setActiveProduct] = useState<ShopProduct>(CATALOG[0]);
  const [activeSwatches, setActiveSwatches] = useState<Record<string, ColorSwatch>>(() => {
    const initial: Record<string, ColorSwatch> = {};
    CATALOG.forEach((p) => {
      if (p.swatches.length > 0) {
        initial[p.sku] = p.swatches[0];
      }
    });
    return initial;
  });

  const [cartOpen, setCartOpen] = useState(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let result = [...CATALOG];

    if (selectedSize !== "All") {
      result = result.filter((p) => p.sizeCategory === selectedSize);
    }
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedMaterial !== "All") {
      result = result.filter((p) => p.material === selectedMaterial);
    }
    if (selectedCollection !== "All") {
      result = result.filter((p) => p.collection === selectedCollection);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price_minor - b.price_minor);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price_minor - a.price_minor);
    } else if (sortBy === "volume") {
      result.sort((a, b) => b.volumeL - a.volumeL);
    }

    return result;
  }, [selectedSize, selectedCategory, selectedMaterial, selectedCollection, sortBy]);

  const handleAddToCart = (product: ShopProduct) => {
    if (!isEcommerce) {
      router.push("/services/stores");
      return;
    }
    addToCart(product.sku, 1);
    setCartOpen(true);
  };

  const handleSwatchSelect = (productSku: string, swatch: ColorSwatch) => {
    setActiveSwatches((prev) => ({
      ...prev,
      [productSku]: swatch,
    }));
  };

  return (
    <div className="min-h-screen bg-surface/30 pt-24 pb-20">
      {/* 1. Category Hero Banner */}
      <section className="relative mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center text-white shadow-hero md:py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy to-[#071d42] opacity-90" />
          <div className="relative z-10 mx-auto max-w-3xl space-y-4">
            <span className="text-caption font-mono uppercase tracking-widest text-sky">
              The Luxury Luggage Collection
            </span>
            <h1 className="text-display-m font-bold tracking-tight text-white md:text-[54px] md:leading-tight">
              Suitcases & Smart Bags
            </h1>
            <p className="mx-auto max-w-2xl text-small text-blue-pale md:text-body">
              Engineered with aerospace-grade grooved alloys, precision ball-bearing Multiwheels, and our signature TRACE Smart Core. Protected by the AMTRAV Lifetime Guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* 2. RIMOWA-Inspired Multi-Faceted Refine Filter Bar */}
      <section className="sticky top-[74px] z-30 border-y border-divider bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-caption">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-mid mr-1">
              <SlidersHorizontal className="size-3.5" /> Refine:
            </span>

            {/* Size Filter */}
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="rounded-full border border-divider bg-white px-3.5 py-1.5 font-medium text-navy hover:border-navy focus:outline-none transition-colors"
            >
              <option value="All">Size: All</option>
              <option value="Cabin">Cabin (Carry-On)</option>
              <option value="Check-In">Check-In</option>
              <option value="Trunk">Trunk</option>
              <option value="Bag">Bags</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-full border border-divider bg-white px-3.5 py-1.5 font-medium text-navy hover:border-navy focus:outline-none transition-colors"
            >
              <option value="All">Category: All</option>
              <option value="Luggage">Luggage</option>
              <option value="Bags">Bags & Duffels</option>
              <option value="Bundles">Bundles</option>
            </select>

            {/* Material Filter */}
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="rounded-full border border-divider bg-white px-3.5 py-1.5 font-medium text-navy hover:border-navy focus:outline-none transition-colors"
            >
              <option value="All">Material: All</option>
              <option value="Aluminium">Aerospace Aluminium</option>
              <option value="Polycarbonate">Polycarbonate</option>
              <option value="Premium Suede">Premium Suede</option>
            </select>

            {/* Collection Filter */}
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="rounded-full border border-divider bg-white px-3.5 py-1.5 font-medium text-navy hover:border-navy focus:outline-none transition-colors"
            >
              <option value="All">Collection: All</option>
              <option value="Original">Original</option>
              <option value="Essential">Essential</option>
              <option value="Executive">Executive</option>
              <option value="Signature">Signature</option>
            </select>

            {(selectedSize !== "All" || selectedCategory !== "All" || selectedMaterial !== "All" || selectedCollection !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSize("All");
                  setSelectedCategory("All");
                  setSelectedMaterial("All");
                  setSelectedCollection("All");
                }}
                className="text-caption font-semibold text-brand underline underline-offset-2 ml-2 hover:text-navy"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Product Count & Sort By */}
          <div className="flex items-center gap-4 text-caption">
            <span className="font-semibold text-mid">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-mid uppercase font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-full border border-divider bg-white px-3.5 py-1.5 font-medium text-navy hover:border-navy focus:outline-none transition-colors"
              >
                <option value="featured">Top Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="volume">Volume (Capacity)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Catalog Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const currentSwatch = activeSwatches[product.sku] || product.swatches[0];
            const displayImage = currentSwatch?.image || product.image;
            const wish = isWishlisted(product.sku);

            return (
              <article
                key={product.sku}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-divider bg-white p-5 shadow-card transition-all hover:shadow-xl"
              >
                {/* Top Badge & Wishlist Heart */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.badge && (
                      <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy border border-navy/10">
                        {product.badge}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-mid">{product.volumeL}L</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.sku)}
                    className="flex size-9 items-center justify-center rounded-full border border-divider bg-white text-mid transition hover:border-navy hover:text-navy"
                    aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`size-4.5 ${wish ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>

                {/* Main Product Image */}
                <div
                  className="relative my-4 aspect-[1.1] w-full cursor-pointer overflow-hidden rounded-2xl bg-surface/50 p-4 transition-transform group-hover:scale-102"
                  onClick={() => {
                    setActiveProduct(product);
                    const inspectSec = document.getElementById("inspection-studio");
                    inspectSec?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-contain transition-all duration-300"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-navy shadow-xs backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <Rotate3D className="size-3.5 text-sky" />
                    <span>3D Inspect</span>
                  </div>
                </div>

                {/* Details & Color Swatches */}
                <div className="space-y-3">
                  {/* Swatches Switcher */}
                  {product.swatches.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {product.swatches.map((swatch) => {
                        const isSelected = currentSwatch?.name === swatch.name;
                        return (
                          <button
                            key={swatch.name}
                            type="button"
                            title={swatch.name}
                            onClick={() => handleSwatchSelect(product.sku, swatch)}
                            className={`relative size-5 rounded-full border transition-all ${
                              isSelected ? "scale-125 border-navy ring-1 ring-navy" : "border-divider hover:scale-110"
                            }`}
                            style={{ backgroundColor: swatch.color }}
                          />
                        );
                      })}
                      <span className="ml-1 text-[11px] text-mid">
                        {currentSwatch ? currentSwatch.name : `${product.swatches.length} colors`}
                      </span>
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-h3-m font-bold text-navy group-hover:text-brand transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-caption text-mid mt-0.5 line-clamp-1">{product.subtitle}</p>
                  </div>

                  {/* Pricing & Add to Cart CTA */}
                  <div className="flex items-center justify-between border-t border-divider pt-3">
                    <div>
                      <div className="text-small font-bold text-navy">
                        {formatPrice(product.price_minor)}
                      </div>
                      <span className="text-[10px] text-mid">incl. tax & duties</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveProduct(product);
                          const inspectSec = document.getElementById("inspection-studio");
                          inspectSec?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-full border border-divider px-3.5 py-1.5 text-caption font-semibold text-navy hover:bg-surface transition-colors"
                      >
                        Specs
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>{isEcommerce ? "Add to Bag" : "Store Locator"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Inline Editorial Heritage Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-b from-navy to-[#051126] p-7 text-white shadow-card">
            <div className="space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky">
                Atelier Seit 1898
              </span>
              <h3 className="text-h2-m font-bold text-white">
                The Anatomy of German Engineering
              </h3>
              <p className="text-caption text-blue-pale leading-relaxed">
                Every AMTRAV suitcase undergoes 120 precision assembly stages. Laser-welded aluminium corners, dual TSA combination latches, and our proprietary TRACE smart sensor core.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-caption font-medium text-sky">Lifetime Guarantee Included</span>
              <Link
                href="/services/registration"
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-caption font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive 3D Inspection & Technical Blueprint Studio */}
      <section id="inspection-studio" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-4">
            <div>
              <span className="text-caption font-mono uppercase tracking-wider text-brand">
                Interactive Engineering Lab
              </span>
              <h2 className="text-h2-m font-bold text-navy">
                Examine {activeProduct.name} in 360°
              </h2>
              <p className="text-small text-mid mt-1">
                Rotate the 3D model, switch material finishes, and inspect full CAD dimension blueprints.
              </p>
            </div>

            {/* Quick Sizing Pill Bar */}
            <div className="flex flex-wrap gap-2">
              {CATALOG.map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  onClick={() => setActiveProduct(p)}
                  className={`rounded-full px-4 py-1.5 text-caption font-semibold transition-all ${
                    activeProduct.sku === p.sku
                      ? "bg-navy text-white shadow-sm ring-1 ring-navy"
                      : "bg-white border border-divider text-navy hover:bg-surface"
                  }`}
                >
                  {p.name.replace("AMTRAV Premium Suede & Aluminium ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* 3D BagViewer or Duffel Blueprint */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {activeProduct.sku === "duffel-side-bag" ? (
              // Dedicated Duffel Side Bag Showcase from User Sheet
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-divider bg-navy p-6 text-white shadow-hero">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black/40 mb-4">
                  <Image
                    src="/images/trace/duffel-side-bag.jpg"
                    alt="AMTRAV Premium Suede & Aluminium Duffel Side Bag"
                    fill
                    sizes="600px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-mono text-sky uppercase">Signature Innovation</span>
                    <span className="rounded-full bg-sky/20 text-sky px-2.5 py-0.5 text-[11px] font-bold">
                      RFID Protected
                    </span>
                  </div>
                  <h3 className="text-h3-m font-bold text-white">AMTRAV Premium Suede Duffel</h3>
                  <p className="text-caption text-blue-pale leading-relaxed">
                    Designed for effortless travel: premium suede body with aerospace aluminium signature stripes, ergonomic metal hardware, and dedicated RFID-shielded passport pockets.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {activeProduct.swatches.map((swatch) => (
                      <span
                        key={swatch.name}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium"
                      >
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: swatch.color }} />
                        {swatch.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // 3D Canvas BagViewer
              <BagViewer defaultModel={activeProduct.sizeCategory === "Cabin" ? "carry-on" : "check-in"} />
            )}

            {/* Technical Blueprint CAD Diagram */}
            <TechnicalBlueprint product={activeProduct} />
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}