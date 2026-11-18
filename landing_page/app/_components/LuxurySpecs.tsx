"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, RotateCcw, SlidersHorizontal, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type SizeKey = "cabin" | "checkinM" | "checkinL" | "trunk";

export default function LuxurySpecs() {
  const { t } = useI18n();
  const [activeSize, setActiveSize] = useState<SizeKey>("cabin");
  const [initials, setInitials] = useState("AM");
  const [tagColor, setTagColor] = useState<"cognac" | "black" | "navy">("cognac");

  const SIZES: Record<SizeKey, {
    name: string;
    spec: string;
    desc: string;
    image: string;
    capacity: string;
    tripDuration: string;
    overheadCompliant: boolean;
    sku: string;
  }> = {
    cabin: {
      name: t("landing.sizeCabinName", "Cabin 55"),
      spec: t("landing.sizeCabinSpec", "55 × 40 × 23 cm · 35L · 4.3 kg"),
      desc: t("landing.sizeCabinDesc", "Airline overhead bin compliant. Perfect for 2–4 days of travel."),
      image: "/images/trace/range-essential.png",
      capacity: "35 Liters",
      tripDuration: "2 – 4 Days",
      overheadCompliant: true,
      sku: "cabin-55",
    },
    checkinM: {
      name: t("landing.sizeCheckInMName", "Check-In M"),
      spec: t("landing.sizeCheckInMSpec", "68 × 45 × 28 cm · 65L · 5.4 kg"),
      desc: t("landing.sizeCheckInMDesc", "Ideal capacity for up to 8 days, with built-in impact and drop tracking."),
      image: "/images/trace/range-flagship.png",
      capacity: "65 Liters",
      tripDuration: "5 – 8 Days",
      overheadCompliant: false,
      sku: "check-in-68",
    },
    checkinL: {
      name: t("landing.sizeCheckInLName", "Check-In 76"),
      spec: t("landing.sizeCheckInLSpec", "78 × 52 × 28 cm · 86L · 6.2 kg"),
      desc: t("landing.sizeCheckInLDesc", "Extended trips up to 2 weeks. The weighing handle avoids luggage surcharge fees."),
      image: "/images/trace/range-executive.png",
      capacity: "86 Liters",
      tripDuration: "10 – 14 Days",
      overheadCompliant: false,
      sku: "check-in-76",
    },
    trunk: {
      name: t("landing.sizeTrunkName", "Trunk"),
      spec: t("landing.sizeTrunkSpec", "73 × 37 × 41 cm · 90L · 6.5 kg"),
      desc: t("landing.sizeTrunkDesc", "Deep iconic silhouette designed for bulky gear, ski wear, and longer stays."),
      image: "/images/trace/range-pro.png",
      capacity: "90 Liters",
      tripDuration: "2+ Weeks",
      overheadCompliant: false,
      sku: "trunk-90",
    },
  };

  const current = SIZES[activeSize];

  const TAG_COLORS = {
    cognac: "bg-[#8D5B38] text-[#FBEED7] border-[#673E22]",
    black: "bg-[#1A1A1A] text-white border-black",
    navy: "bg-[#0B1B3D] text-[#BCD5FA] border-[#07132B]",
  };

  return (
    <section className="flex flex-col gap-10 overflow-clip rounded-3xl bg-surface px-5 py-10 xl:rounded-[32px] xl:px-14 xl:py-16">
      {/* Section Header */}
      <div data-reveal className="flex flex-col items-center gap-3 text-center">
        <p className="text-caption-m text-brand font-semibold tracking-wider uppercase xl:text-caption">
          {t("landing.luxuryEyebrow", "LUXURY ENGINEERING")}
        </p>
        <h2 className="text-h1-m font-bold text-navy xl:text-h1">
          {t("landing.luxuryTitle", "Engineered for a lifetime of movement.")}
        </h2>
        <p className="max-w-2xl text-body-m text-mid xl:text-body">
          {t("landing.luxurySubhead", "Precision aerospace-grade ribbed alloy, ultra-silent ball-bearing multiwheels, and dual TSA combination locks.")}
        </p>
      </div>

      {/* Sizing Interactive Explorer */}
      <div data-reveal className="overflow-hidden rounded-3xl border border-divider bg-white p-6 shadow-card xl:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between border-b border-divider pb-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-h3-m font-semibold text-navy xl:text-h3">
              {t("landing.sizingTitle", "Choose Your Silhouette")}
            </h3>
            <p className="text-caption-m text-mid xl:text-caption">
              {t("landing.sizingSubhead", "Calibrated dimensions crafted for global airline compliance.")}
            </p>
          </div>

          {/* Size Pills Tabs */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SIZES) as SizeKey[]).map((key) => {
              const active = key === activeSize;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSize(key)}
                  className={`rounded-full px-4 py-2 text-caption font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand ${
                    active
                      ? "bg-navy text-white shadow-sm scale-105"
                      : "bg-surface text-mid hover:bg-stale/40 hover:text-navy"
                  }`}
                >
                  {SIZES[key].name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Size Visual & Specs Breakdown */}
        <div className="grid grid-cols-1 items-center gap-8 pt-8 lg:grid-cols-12">
          {/* Visual Showcase */}
          <div className="relative flex min-h-[300px] items-center justify-center rounded-2xl bg-gradient-to-b from-blue-pale/40 to-surface p-6 lg:col-span-5">
            <div className="relative h-64 w-48 transition-transform duration-500 hover:scale-105">
              <Image
                src={current.image}
                alt={current.name}
                fill
                sizes="(max-width: 768px) 200px, 240px"
                className="object-contain drop-shadow-xl"
              />
            </div>
            {current.overheadCompliant && (
              <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand">
                <CheckCircle2 className="size-3.5" />
                Overhead Bin Compliant
              </span>
            )}
          </div>

          {/* Specs & Description Details */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-h2-m font-bold text-navy xl:text-h2">{current.name}</h4>
                <span className="font-mono text-caption font-semibold text-brand">{current.capacity}</span>
              </div>
              <p className="text-body-m text-mid xl:text-body">{current.desc}</p>
            </div>

            {/* Spec Metric Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-divider bg-surface p-3">
                <span className="text-[11px] font-medium text-mid uppercase">Dimensions & Weight</span>
                <p className="mt-1 font-mono text-[13px] font-bold text-navy">{current.spec}</p>
              </div>
              <div className="rounded-xl border border-divider bg-surface p-3">
                <span className="text-[11px] font-medium text-mid uppercase">Optimal Duration</span>
                <p className="mt-1 font-mono text-[13px] font-bold text-navy">{current.tripDuration}</p>
              </div>
              <div className="rounded-xl border border-divider bg-surface p-3 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-mid uppercase">Smart Core Included</span>
                <p className="mt-1 font-mono text-[13px] font-bold text-brand">TRACE v2.4 (GNSS + BLE)</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy px-6 text-caption font-bold text-white transition-all hover:bg-navy-deep active:scale-95"
              >
                <span>Order in {current.name}</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/shop#viewer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-5 text-caption font-medium text-navy transition-all hover:bg-surface"
              >
                3D Interactive View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Craftsmanship */}
      <div data-stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Lifetime Guarantee */}
        <div data-reveal className="flex flex-col gap-3 rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ShieldCheck className="size-6" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
            {t("landing.guaranteeBadge", "Lifetime Guarantee")}
          </span>
          <h3 className="text-h3-m font-semibold text-navy">
            {t("landing.guaranteeTitle", "Covered for Life")}
          </h3>
          <p className="text-body-m text-mid">
            {t("landing.guaranteeText", "All functional damage to your suitcase shell, wheels, handles, and locks is protected for the practical lifespan of your journeys.")}
          </p>
        </div>

        {/* Dual TSA Locks */}
        <div data-reveal className="flex flex-col gap-3 rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Lock className="size-6" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
            {t("landing.locksBadge", "TSA-Approved")}
          </span>
          <h3 className="text-h3-m font-semibold text-navy">
            {t("landing.locksTitle", "Dual Combination Locks")}
          </h3>
          <p className="text-body-m text-mid">
            {t("landing.locksText", "Airport security can inspect your luggage without damage, keeping your essentials shielded at all times.")}
          </p>
        </div>

        {/* Multiwheel 360 */}
        <div data-reveal className="flex flex-col gap-3 rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <RotateCcw className="size-6" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
            {t("landing.wheelsBadge", "Multiwheel® 360°")}
          </span>
          <h3 className="text-h3-m font-semibold text-navy">
            {t("landing.wheelsTitle", "Ultra-Silent Ball Bearings")}
          </h3>
          <p className="text-body-m text-mid">
            {t("landing.wheelsText", "Smooth, effortless steering across rough terminal floors and tarmac with cushioned, shock-absorbing wheel axles.")}
          </p>
        </div>

        {/* Flex Divider System */}
        <div data-reveal className="flex flex-col gap-3 rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <SlidersHorizontal className="size-6" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-brand uppercase">
            {t("landing.dividerBadge", "Interior Architecture")}
          </span>
          <h3 className="text-h3-m font-semibold text-navy">
            {t("landing.dividerTitle", "Flex Divider System")}
          </h3>
          <p className="text-body-m text-mid">
            {t("landing.dividerText", "Height-adjustable compression packing pads that adapt to the exact volume of your belongings.")}
          </p>
        </div>
      </div>

      {/* Bespoke Personalisation & Monogramming Preview */}
      <div data-reveal className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white xl:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-sky" />
              <span className="text-[12px] font-bold tracking-wider text-sky uppercase">
                {t("landing.personalisationTitle", "Custom Personalisation")}
              </span>
            </div>
            <h3 className="text-h2-m font-bold xl:text-h2">
              Crafted for you. Distinctly identifiable.
            </h3>
            <p className="text-body-m text-blue-pale xl:text-body">
              {t("landing.personalisationDesc", "Make it yours with interchangeable leather luggage tags, wheel accents, and custom monogramming.")}
            </p>
          </div>

          {/* Interactive Tag Customizer */}
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md">
            {/* Visual Leather Tag */}
            <div className={`relative flex h-32 w-24 flex-col items-center justify-between rounded-xl border-2 p-3 shadow-lg transition-colors duration-300 ${TAG_COLORS[tagColor]}`}>
              <div className="size-3 rounded-full border border-black/30 bg-white/40 shadow-inner" />
              <div className="font-mono text-2xl font-black tracking-widest uppercase">
                {initials.slice(0, 3) || "AM"}
              </div>
              <span className="text-[9px] font-semibold tracking-wider uppercase opacity-75">AMORTRAV</span>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-[12px] font-medium text-blue-pale">
                Monogram Initials (up to 3 letters)
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-sm uppercase text-white outline-none focus:border-sky"
                />
              </label>

              <div className="flex flex-col gap-1 text-[12px] font-medium text-blue-pale">
                Tag Leather Color
                <div className="flex gap-2">
                  {(["cognac", "black", "navy"] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTagColor(color)}
                      aria-label={`Select ${color} tag`}
                      className={`size-6 rounded-full border-2 transition-transform ${
                        color === "cognac" ? "bg-[#8D5B38]" : color === "black" ? "bg-black" : "bg-[#0B1B3D]"
                      } ${tagColor === color ? "scale-125 border-sky shadow-md" : "border-white/30"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
