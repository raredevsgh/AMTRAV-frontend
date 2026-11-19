"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Button from "../_components/Button";
import ProductVideo from "../_components/ProductVideo";
import BagViewer from "../_components/BagViewer";
import TechnicalBlueprint from "../_components/TechnicalBlueprint";
import CartDrawer from "../_components/CartDrawer";
import { CATALOG, ShopProduct, addToCart } from "@/lib/shop";
import { useRegion } from "@/lib/region";

const FEATURES = [
  ["Journey Log", "Records each trip"],
  ["Impact detection", "Detects hard knocks"],
  ["Built-in weighing", "Weighs when you lift it"],
  ["Theft & tamper", "Alerts if moved or opened"],
];

const STEPS = [
  ["Choose your size", "Cabin, check-in, trunk, or suede duffel."],
  ["Place your reservation", "Your bag is reserved from the first production run."],
  ["Follow along", "We will email you dispatch and tracking updates."],
];

export default function ShopView() {
  const router = useRouter();
  const { formatPrice, isEcommerce } = useRegion();
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<ShopProduct>(CATALOG[1]); // Cabin 55
  const [cartOpen, setCartOpen] = useState(false);

  const handleBuy = (product: ShopProduct) => {
    if (!isEcommerce) {
      router.push("/services/stores");
      return;
    }
    addToCart(product.sku, 1);
    setCartOpen(true);
  };

  return (
    <>
      {/* 1. Clean AMTRAV Hero Section with Video */}
      <section
        aria-labelledby="shop-heading"
        className="relative flex min-h-[640px] flex-col justify-between gap-12 overflow-hidden rounded-3xl bg-navy px-5 pt-28 pb-6 md:min-h-[580px] md:px-10 md:pb-10 xl:rounded-[32px] xl:px-14 xl:pt-32"
      >
        <ProductVideo />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/75 via-ink/65 to-navy/70" />
        <div className="relative mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <h1
            id="shop-heading"
            className="text-display-m font-bold text-white md:text-[60px] md:leading-[1.04] md:tracking-[-0.04em] xl:text-[70px]"
          >
            Pick your bag.
            <br />
            <span className="text-sky">TRACE comes in every one.</span>
          </h1>
          <p className="max-w-[660px] text-small text-light-white md:text-lead md:leading-normal">
            Precision aerospace suitcases and handcrafted suede side bags. Every case weighs itself, records each journey and protects your essentials for life.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="#range" label="Shop the range" style="sky" arrow />
            <Button href="/customise" label="3D Studio Builder" style="outline" />
          </div>
        </div>

        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-5 rounded-3xl border border-line bg-white/10 p-5 text-white backdrop-blur-md md:grid-cols-4 md:gap-0 md:py-6">
          {FEATURES.map(([name, detail], i) => (
            <li
              key={name}
              className="flex items-center gap-3 md:border-l md:border-line md:px-5 md:first:border-0"
            >
              <span className="font-mono text-caption-m text-sky">
                0{i + 1}
              </span>
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

      {/* 2. Clean Product Range Grid */}
      <section
        id="range"
        aria-labelledby="range-heading"
        className="scroll-mt-28 px-5 py-12 xl:px-14 xl:py-16"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-4 mb-8">
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
            Looking for bespoke colors? Launch AMTRAV UNIQUE Studio →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((product) => {
            const isSelectedForSpecs = selectedProductForSpecs.sku === product.sku;

            return (
              <article
                key={product.sku}
                className="group flex flex-col justify-between rounded-3xl bg-white p-3 shadow-card transition-all hover:shadow-xl border border-divider"
              >
                {/* Image Box */}
                <div className="relative aspect-[1.3] overflow-hidden rounded-2xl bg-surface/40 p-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 360px, 90vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-103"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 rounded-full bg-navy/5 border border-navy/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 font-mono text-[11px] text-mid">
                    {product.volumeL}L
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between px-2 pt-4 pb-2">
                  <div>
                    <h3 className="text-h3-m font-bold text-navy xl:text-[20px]">
                      {product.name}
                    </h3>
                    <p className="text-caption text-mid mt-0.5 line-clamp-2">
                      {product.subtitle}
                    </p>

                    {/* Color Swatch dots */}
                    {product.swatches.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        {product.swatches.map((swatch) => (
                          <span
                            key={swatch.name}
                            className="size-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: swatch.color }}
                            title={swatch.name}
                          />
                        ))}
                        <span className="ml-1 text-[11px] text-mid">
                          {product.swatches.length} finishes
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-5 flex items-center justify-between border-t border-divider/60 pt-3">
                    <div>
                      <span className="text-h3-m font-bold text-navy">
                        {formatPrice(product.price_minor)}
                      </span>
                      <span className="block text-[10px] text-mid">incl. tax & duties</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForSpecs(product);
                          const el = document.getElementById("technical-specs");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`rounded-full px-3 py-1.5 text-caption font-semibold transition-colors ${
                          isSelectedForSpecs
                            ? "bg-navy text-white"
                            : "border border-divider text-navy hover:bg-surface"
                        }`}
                      >
                        Specs
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBuy(product)}
                        className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>{isEcommerce ? "Reserve" : "Inquire"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive 3D Model Explorer */}
      <section className="mx-5 my-8 flex flex-col gap-6 rounded-3xl border border-divider bg-surface px-5 py-8 md:px-10 xl:mx-14 xl:rounded-[32px] xl:px-14 xl:py-12">
        <div className="flex flex-col gap-2">
          <span className="text-caption font-mono uppercase tracking-wider text-brand">
            Real-Time 3D Inspection
          </span>
          <h2 className="text-h2-m font-bold text-navy xl:text-h2">
            Examine Every Angle Before You Fly
          </h2>
          <p className="max-w-xl text-body-m text-mid xl:text-body">
            Rotate the bag in real-time 3D, compare cabin and check-in sizes, and preview material finishes.
          </p>
        </div>
        <BagViewer />
      </section>

      {/* 4. Technical Blueprint CAD Dimensions Section */}
      <section id="technical-specs" className="scroll-mt-28 px-5 py-8 xl:px-14 xl:py-10">
        <div className="mx-auto max-w-4xl">
          <TechnicalBlueprint product={selectedProductForSpecs} />
        </div>
      </section>

      {/* 5. How Pre-Ordering Works */}
      <section
        aria-labelledby="preorder-heading"
        className="mx-5 my-8 grid items-center gap-8 rounded-3xl border border-divider px-5 py-8 md:grid-cols-[1.2fr_1fr] md:gap-12 xl:mx-14 xl:rounded-[32px] xl:px-14 xl:py-14"
      >
        <div>
          <h2
            id="preorder-heading"
            className="text-h1-m font-bold text-navy xl:text-h1"
          >
            How reservations work
          </h2>
          <p className="mt-4 text-small text-mid">
            Reserve today and your bag is prioritized from the earliest serialized production run with complimentary initial monogramming.
          </p>
          <ol className="mt-6 flex flex-col gap-3">
            {STEPS.map(([name, detail], i) => (
              <li
                key={name}
                className="flex items-center gap-4 rounded-3xl bg-white px-4 py-4 shadow-xs"
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
              src="/images/trace/duffel-side-bag.jpg"
              alt="AMTRAV Suede Duffel Side Bag"
              fill
              sizes="(min-width: 1280px) 520px, 90vw"
              className="object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-sky font-bold">New Innovation</span>
              <h3 className="text-h3 font-semibold text-navy">Premium Suede Duffel</h3>
              <p className="mt-0.5 text-caption text-mid">
                5 Suede Colorways · RFID Protected · {formatPrice(48000)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleBuy(CATALOG[0])}
              className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep transition-all"
            >
              <span>Reserve</span>
            </button>
          </div>
        </article>
      </section>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}