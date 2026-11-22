"use client";

import React, { useState, useEffect } from "react";
import { Plane, Check, ShieldCheck, Scale, Compass, Sparkles, Layers } from "lucide-react";
import { ShopProduct, CATALOG } from "@/lib/shop";
import AirlineMatrixModal from "./AirlineMatrixModal";

interface TechnicalBlueprintProps {
  product?: ShopProduct;
}

type SilhouetteTab = "cabin" | "checkin" | "both";

export default function TechnicalBlueprint({ product }: TechnicalBlueprintProps) {
  const [selectedSilhouette, setSelectedSilhouette] = useState<SilhouetteTab>(
    product?.sizeCategory === "Check-In"
      ? "checkin"
      : product?.category === "Bundles"
      ? "both"
      : "cabin"
  );
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [matrixOpen, setMatrixOpen] = useState(false);

  // Sync when parent changes product
  useEffect(() => {
    if (product) {
      if (product.category === "Bundles") {
        setSelectedSilhouette("both");
      } else if (product.sizeCategory === "Check-In") {
        setSelectedSilhouette("checkin");
      } else {
        setSelectedSilhouette("cabin");
      }
    }
  }, [product]);

  const isMetric = unit === "metric";

  // Silhouette configuration
  const currentSpec = {
    cabin: {
      name: "Cabin 55 (Carry-On)",
      subtitle: "Overhead Bin Compliant · 2–4 Days",
      cm: { height: 55, width: 40, depth: 23 },
      inches: { height: 21.7, width: 15.7, depth: 9.1 },
      weightKg: 3.8,
      weightLbs: 8.4,
      volumeL: 35,
      volumeGal: 9.2,
      linearSumCm: 118,
      linearSumIn: 46.5,
      iataStatus: "100% IATA Overhead Bin Compliant",
      iataNote: "Fits in overhead compartments across 50+ international airlines including Lufthansa, British Airways, Delta, and United.",
      shellMaterial: product?.material === "Aluminium" ? "Aerospace Aluminium 6063-T5" : "Aerospace Virgin Polycarbonate",
      wheelSystem: "Hinomoto 360° Lisof® Silent Dual Ball Bearings",
      lockSystem: "Dual TSA 008 Integrated Master Combination Locks",
      sensor: "TRACE Core v2 (BLE 5.3 · NB-IoT · Digital Strain Gauge)",
      handle: "3-Stage Ergonomic Aluminium Pull (105 cm Max)",
    },
    checkin: {
      name: "Check-In 68 (Checked Luggage)",
      subtitle: "Mid-Sized Travel · 5–8 Days",
      cm: { height: 68, width: 45, depth: 28 },
      inches: { height: 26.8, width: 17.7, depth: 11.0 },
      weightKg: 4.8,
      weightLbs: 10.6,
      volumeL: 65,
      volumeGal: 17.2,
      linearSumCm: 141,
      linearSumIn: 55.5,
      iataStatus: "Maximum Checked Luggage Standard",
      iataNote: "Complies with standard 158 cm (62 in) linear airline maximums for checked hold baggage with zero oversize fees.",
      shellMaterial: product?.material === "Aluminium" ? "Aerospace Aluminium 6063-T5" : "Aerospace Virgin Polycarbonate",
      wheelSystem: "Hinomoto 360° Lisof® Silent Dual Ball Bearings",
      lockSystem: "Dual TSA 008 Integrated Master Combination Locks",
      sensor: "TRACE Core v2 (Impact Shock Sensing · BLE 5.3 · Cellular)",
      handle: "2-Stage Ergonomic Aluminium Pull (105 cm Max)",
    },
    both: {
      name: "The Pair Duo (Cabin 55 + Check-In 68)",
      subtitle: "Complete Travel System · Up to 14 Days",
      cm: { height: 68, width: 45, depth: 28 }, // primary dimensions
      inches: { height: 26.8, width: 17.7, depth: 11.0 },
      weightKg: 8.6,
      weightLbs: 19.0,
      volumeL: 100,
      volumeGal: 26.4,
      linearSumCm: 259,
      linearSumIn: 102.0,
      iataStatus: "Dual-Tier Travel Matrix (Cabin + Hold)",
      iataNote: "Cabin 55 travels in the overhead locker, Check-In 68 travels in the hold. Synchronized via the AMTRAV Companion App.",
      shellMaterial: product?.material === "Aluminium" ? "Aerospace Aluminium 6063-T5" : "Aerospace Virgin Polycarbonate",
      wheelSystem: "8x Hinomoto 360° Lisof® Silent Dual Ball Bearings",
      lockSystem: "4x TSA 008 Integrated Master Combination Locks",
      sensor: "Dual TRACE Core v2 with Auto-Pair Synchronization",
      handle: "Telescopic Aluminium Multi-Stage Pull Systems",
    },
  }[selectedSilhouette];

  const heightStr = isMetric ? `${currentSpec.cm.height} cm` : `${currentSpec.inches.height} in`;
  const widthStr = isMetric ? `${currentSpec.cm.width} cm` : `${currentSpec.inches.width} in`;
  const depthStr = isMetric ? `${currentSpec.cm.depth} cm` : `${currentSpec.inches.depth} in`;
  const measurementStr = isMetric
    ? `${currentSpec.cm.height} × ${currentSpec.cm.width} × ${currentSpec.cm.depth} cm`
    : `${currentSpec.inches.height} × ${currentSpec.inches.width} × ${currentSpec.inches.depth} in`;

  const weightStr = isMetric ? `${currentSpec.weightKg} kg` : `${currentSpec.weightLbs} lbs`;
  const volumeStr = isMetric ? `${currentSpec.volumeL} L` : `${currentSpec.volumeGal} gal`;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* 1. Header Bar: Title, Silhouette Switcher & Metric/Imperial Units */}
      <div className="flex flex-col gap-4 border-b border-divider dark:border-white/15 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand dark:text-sky font-bold">
              Engineering Specifications
            </span>
            <span className="size-1 rounded-full bg-divider dark:bg-white/20" />
            <span className="text-[11px] font-mono text-mid dark:text-blue-pale/70 uppercase">
              Swiss-German Precision
            </span>
          </div>
          <h2 className="mt-1 text-h2-m font-bold text-navy dark:text-white md:text-h2">
            Size, Weight & Technical Geometry
          </h2>
          <p className="mt-1 max-w-xl text-small text-mid dark:text-blue-pale/80">
            Exact tolerances measured with wheels and handle retracted in accordance with IATA airline guidelines.
          </p>
        </div>

        {/* Controls: Silhouette Selector + Unit Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Silhouette Selector Pills */}
          <div className="flex items-center gap-1 rounded-full border border-divider dark:border-white/15 bg-white dark:bg-[#0c1e45] p-1 shadow-xs">
            {(
              [
                { id: "cabin", label: "Cabin 55" },
                { id: "checkin", label: "Check-In 68" },
                { id: "both", label: "The Pair (Duo)" },
              ] as { id: SilhouetteTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSilhouette(tab.id)}
                className={`rounded-full px-3 py-1.5 text-caption font-semibold transition-all ${
                  selectedSilhouette === tab.id
                    ? "bg-navy dark:bg-sky text-white dark:text-navy shadow-xs font-bold"
                    : "text-mid dark:text-blue-pale/75 hover:text-navy dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Metric / Imperial Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-divider dark:border-white/15 bg-white dark:bg-[#0c1e45] p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setUnit("metric")}
              className={`rounded-full px-3 py-1.5 text-caption font-semibold transition-all ${
                isMetric ? "bg-navy dark:bg-sky text-white dark:text-navy shadow-xs" : "text-mid dark:text-blue-pale/75 hover:text-navy dark:hover:text-white"
              }`}
            >
              Metric
            </button>
            <button
              type="button"
              onClick={() => setUnit("imperial")}
              className={`rounded-full px-3 py-1.5 text-caption font-semibold transition-all ${
                !isMetric ? "bg-navy dark:bg-sky text-white dark:text-navy shadow-xs" : "text-mid dark:text-blue-pale/75 hover:text-navy dark:hover:text-white"
              }`}
            >
              Imperial
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Technical Display */}
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left (CAD Blueprint SVG Projection) - Spans 5 columns on desktop */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-divider/60 dark:border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-brand dark:text-sky" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-navy dark:text-white">
                CAD Orthogonal Projection
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-sky bg-navy dark:bg-sky/20 dark:text-sky px-2 py-0.5 rounded-full">
              Scale 1:10
            </span>
          </div>

          {/* SVG Technical Drawing */}
          <div className="relative my-6 flex flex-col items-center justify-center min-h-[300px]">
            {/* Blueprint Grid Watermark Background */}
            <div
              className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] pointer-events-none rounded-xl"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {selectedSilhouette === "both" ? (
              /* Dual Suitcase CAD Projection (Check-In 68 + Cabin 55 side-by-side) */
              <svg
                viewBox="0 0 350 290"
                className="w-full max-w-[340px] text-navy dark:text-white select-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* 1. Check-In 68 (Left - Hold Bag) */}
                <g className="checkin-spec">
                  <rect
                    x="20"
                    y="55"
                    width="115"
                    height="180"
                    rx="14"
                    className="stroke-navy dark:stroke-white fill-white dark:fill-[#0c1e45]"
                  />
                  {/* Telescopic Handle */}
                  <path d="M50 55 V22 H105 V55" className="stroke-navy/50 dark:stroke-white/50" strokeDasharray="3 3" />
                  <rect x="62" y="16" width="31" height="8" rx="2" className="fill-navy/20 dark:fill-white/20 stroke-navy dark:stroke-white" />
                  {/* Ribs */}
                  {[78, 100, 122, 144, 166, 188, 210].map((y) => (
                    <line key={`c-${y}`} x1="30" y1={y} x2="125" y2={y} className="stroke-navy/20 dark:stroke-white/20" />
                  ))}
                  {/* Wheels */}
                  <circle cx="42" cy="243" r="7" className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white" />
                  <circle cx="112" cy="243" r="7" className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white" />
                  {/* Label */}
                  <text x="77" y="266" textAnchor="middle" className="fill-brand dark:fill-sky text-[9.5px] font-mono font-bold">
                    Check-In 68 · 65L
                  </text>
                </g>

                {/* 2. Cabin 55 (Right - Carry-On) */}
                <g className="cabin-spec">
                  <rect
                    x="160"
                    y="90"
                    width="95"
                    height="145"
                    rx="12"
                    className="stroke-navy dark:stroke-white fill-white dark:fill-[#0c1e45]"
                  />
                  {/* Telescopic Handle */}
                  <path d="M185 90 V55 H230 V90" className="stroke-navy/50 dark:stroke-white/50" strokeDasharray="3 3" />
                  <rect x="193" y="49" width="29" height="7" rx="2" className="fill-navy/20 dark:fill-white/20 stroke-navy dark:stroke-white" />
                  {/* Ribs */}
                  {[110, 130, 150, 170, 190, 210].map((y) => (
                    <line key={`k-${y}`} x1="170" y1={y} x2="245" y2={y} className="stroke-navy/20 dark:stroke-white/20" />
                  ))}
                  {/* Wheels */}
                  <circle cx="180" cy="243" r="7" className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white" />
                  <circle cx="235" cy="243" r="7" className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white" />
                  {/* Label */}
                  <text x="207" y="266" textAnchor="middle" className="fill-brand dark:fill-sky text-[9.5px] font-mono font-bold">
                    Cabin 55 · 35L
                  </text>
                </g>

                {/* Overall Height Callout Line */}
                <line x1="285" y1="55" x2="285" y2="245" className="stroke-brand dark:stroke-sky" strokeWidth="1.2" />
                <path d="M281 59 L285 55 L289 59 M281 241 L285 245 L289 241" className="stroke-brand dark:stroke-sky" />
                <text
                  x="298"
                  y="150"
                  className="fill-navy dark:fill-white text-[10px] font-mono font-bold"
                  transform="rotate(90 298 150)"
                >
                  68 cm Max
                </text>
              </svg>
            ) : (
              /* Single Suitcase Projection */
              <svg
                viewBox="0 0 340 300"
                className="w-full max-w-[320px] text-navy dark:text-white select-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Front Elevation Outline */}
                <rect
                  x={selectedSilhouette === "checkin" ? "25" : "35"}
                  y="55"
                  width={selectedSilhouette === "checkin" ? "125" : "110"}
                  height={selectedSilhouette === "checkin" ? "185" : "165"}
                  rx="14"
                  className="stroke-navy dark:stroke-white fill-white dark:fill-[#0c1e45]"
                />

                {/* Telescopic Handle (Stage-free 105 cm) */}
                <path
                  d={
                    selectedSilhouette === "checkin"
                      ? "M60 55 V22 H115 V55"
                      : "M65 55 V22 H115 V55"
                  }
                  className="stroke-navy/50 dark:stroke-white/50"
                  strokeDasharray="3 3"
                />
                <rect
                  x={selectedSilhouette === "checkin" ? "68" : "72"}
                  y="16"
                  width="40"
                  height="8"
                  rx="2"
                  className="fill-navy/20 dark:fill-white/20 stroke-navy dark:stroke-white"
                />

                {/* Front Ribs / Reinforcement Grooves */}
                {[78, 98, 118, 138, 158, 178, 198, 218].map((y) => (
                  <line
                    key={y}
                    x1={selectedSilhouette === "checkin" ? "42" : "50"}
                    y1={y}
                    x2={selectedSilhouette === "checkin" ? "133" : "130"}
                    y2={y}
                    className="stroke-navy/20 dark:stroke-white/20"
                  />
                ))}

                {/* Front Spinner Multiwheels (Hinomoto 360) */}
                <circle
                  cx={selectedSilhouette === "checkin" ? "48" : "55"}
                  cy={selectedSilhouette === "checkin" ? "248" : "228"}
                  r="7"
                  className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white"
                />
                <circle
                  cx={selectedSilhouette === "checkin" ? "127" : "125"}
                  cy={selectedSilhouette === "checkin" ? "248" : "228"}
                  r="7"
                  className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white"
                />

                {/* Side Elevation Outline */}
                <rect
                  x={selectedSilhouette === "checkin" ? "180" : "185"}
                  y="55"
                  width={selectedSilhouette === "checkin" ? "75" : "65"}
                  height={selectedSilhouette === "checkin" ? "185" : "165"}
                  rx="12"
                  className="stroke-navy dark:stroke-white fill-white dark:fill-[#0c1e45]"
                />
                {/* Side Handle Mount */}
                <path
                  d={
                    selectedSilhouette === "checkin"
                      ? "M205 55 V22 H230 V55"
                      : "M205 55 V22 H230 V55"
                  }
                  className="stroke-navy/50 dark:stroke-white/50"
                  strokeDasharray="3 3"
                />
                <rect
                  x="200"
                  y="16"
                  width="35"
                  height="8"
                  rx="2"
                  className="fill-navy/20 dark:fill-white/20 stroke-navy dark:stroke-white"
                />
                {/* Side Spinner Wheels */}
                <circle
                  cx="200"
                  cy={selectedSilhouette === "checkin" ? "248" : "228"}
                  r="7"
                  className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white"
                />
                <circle
                  cx={selectedSilhouette === "checkin" ? "240" : "235"}
                  cy={selectedSilhouette === "checkin" ? "248" : "228"}
                  r="7"
                  className="fill-navy/10 dark:fill-white/10 stroke-navy dark:stroke-white"
                />

                {/* Dimension: Height Line */}
                <line
                  x1={selectedSilhouette === "checkin" ? "280" : "275"}
                  y1="55"
                  x2={selectedSilhouette === "checkin" ? "280" : "275"}
                  y2={selectedSilhouette === "checkin" ? "255" : "235"}
                  className="stroke-brand dark:stroke-sky"
                  strokeWidth="1.2"
                />
                <path
                  d={`M276 59 L280 55 L284 59 M276 ${selectedSilhouette === "checkin" ? 251 : 231} L280 ${selectedSilhouette === "checkin" ? 255 : 235} L284 ${selectedSilhouette === "checkin" ? 251 : 231}`}
                  className="stroke-brand dark:stroke-sky"
                />
                <text
                  x={selectedSilhouette === "checkin" ? "292" : "287"}
                  y={selectedSilhouette === "checkin" ? "160" : "150"}
                  className="fill-navy dark:fill-white text-[11px] font-mono font-bold"
                  transform={`rotate(90 ${selectedSilhouette === "checkin" ? 292 : 287} ${selectedSilhouette === "checkin" ? 160 : 150})`}
                >
                  {heightStr}
                </text>

                {/* Dimension: Width Line */}
                <line
                  x1={selectedSilhouette === "checkin" ? "25" : "35"}
                  y1={selectedSilhouette === "checkin" ? "272" : "252"}
                  x2={selectedSilhouette === "checkin" ? "150" : "145"}
                  y2={selectedSilhouette === "checkin" ? "272" : "252"}
                  className="stroke-brand dark:stroke-sky"
                  strokeWidth="1.2"
                />
                <path
                  d={`M${selectedSilhouette === "checkin" ? 29 : 39} ${selectedSilhouette === "checkin" ? 268 : 248} L${selectedSilhouette === "checkin" ? 25 : 35} ${selectedSilhouette === "checkin" ? 272 : 252} L${selectedSilhouette === "checkin" ? 29 : 39} ${selectedSilhouette === "checkin" ? 276 : 256} M${selectedSilhouette === "checkin" ? 146 : 141} ${selectedSilhouette === "checkin" ? 268 : 248} L${selectedSilhouette === "checkin" ? 150 : 145} ${selectedSilhouette === "checkin" ? 272 : 252} L${selectedSilhouette === "checkin" ? 146 : 141} ${selectedSilhouette === "checkin" ? 276 : 256}`}
                  className="stroke-brand dark:stroke-sky"
                />
                <text
                  x={selectedSilhouette === "checkin" ? "70" : "75"}
                  y={selectedSilhouette === "checkin" ? "288" : "268"}
                  className="fill-navy dark:fill-white text-[11px] font-mono font-bold"
                >
                  {widthStr}
                </text>

                {/* Dimension: Depth Line */}
                <line
                  x1={selectedSilhouette === "checkin" ? "180" : "185"}
                  y1={selectedSilhouette === "checkin" ? "272" : "252"}
                  x2={selectedSilhouette === "checkin" ? "255" : "250"}
                  y2={selectedSilhouette === "checkin" ? "272" : "252"}
                  className="stroke-brand dark:stroke-sky"
                  strokeWidth="1.2"
                />
                <path
                  d={`M${selectedSilhouette === "checkin" ? 184 : 189} ${selectedSilhouette === "checkin" ? 268 : 248} L${selectedSilhouette === "checkin" ? 180 : 185} ${selectedSilhouette === "checkin" ? 272 : 252} L${selectedSilhouette === "checkin" ? 184 : 189} ${selectedSilhouette === "checkin" ? 276 : 256} M${selectedSilhouette === "checkin" ? 251 : 246} ${selectedSilhouette === "checkin" ? 268 : 248} L${selectedSilhouette === "checkin" ? 255 : 250} ${selectedSilhouette === "checkin" ? 272 : 252} L${selectedSilhouette === "checkin" ? 251 : 246} ${selectedSilhouette === "checkin" ? 276 : 256}`}
                  className="stroke-brand dark:stroke-sky"
                />
                <text
                  x={selectedSilhouette === "checkin" ? "202" : "205"}
                  y={selectedSilhouette === "checkin" ? "288" : "268"}
                  className="fill-navy dark:fill-white text-[11px] font-mono font-bold"
                >
                  {depthStr}
                </text>
              </svg>
            )}
          </div>

          {/* Bottom Callout & Compliance Badge */}
          <div className="flex flex-col gap-2 border-t border-divider/60 dark:border-white/15 pt-3 text-[11.5px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-mid dark:text-blue-pale/70">Telescopic Extension:</span>
              <span className="font-mono font-semibold text-navy dark:text-white">105 cm / 41.3 in</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-mid dark:text-blue-pale/70">Ground Clearance:</span>
              <span className="font-mono font-semibold text-navy dark:text-white">5.5 cm (Lisof 360°)</span>
            </div>
          </div>
        </div>

        {/* Right (Metrics Cards & Detailed Specs Table) - Spans 7 columns on desktop */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="rounded-2xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-4.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-mid dark:text-blue-pale/70 block mb-1">
                External Dimensions
              </span>
              <span className="text-lead font-bold font-mono text-navy dark:text-white block">
                {measurementStr}
              </span>
              <span className="text-[11px] text-mid dark:text-blue-pale/70 mt-1 block">
                {isMetric ? `Linear: ${currentSpec.linearSumCm} cm` : `Linear: ${currentSpec.linearSumIn} in`}
              </span>
            </div>

            <div className="rounded-2xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-4.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-mid dark:text-blue-pale/70 block mb-1">
                Net Tare Weight
              </span>
              <span className="text-lead font-bold font-mono text-navy dark:text-white block">
                {weightStr}
              </span>
              <span className="text-[11px] text-brand dark:text-sky font-semibold mt-1 block flex items-center gap-1">
                <Scale className="size-3" />
                TRACE Core Calibrated
              </span>
            </div>

            <div className="rounded-2xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-4.5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-mid dark:text-blue-pale/70 block mb-1">
                Packing Volume
              </span>
              <span className="text-lead font-bold font-mono text-navy dark:text-white block">
                {volumeStr}
              </span>
              <span className="text-[11px] text-mid dark:text-blue-pale/70 mt-1 block">
                {currentSpec.subtitle.split("·")[1]?.trim() || "Multi-day capacity"}
              </span>
            </div>
          </div>

          {/* Detailed Engineering Specifications Table */}
          <div className="rounded-2xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <h3 className="text-caption font-mono uppercase tracking-wider text-navy dark:text-white font-bold border-b border-divider/70 dark:border-white/15 pb-2.5">
              Material & Hardware Architecture
            </h3>

            <div className="divide-y divide-divider/60 dark:divide-white/10 text-[13px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-mid dark:text-blue-pale/70 font-medium shrink-0">Shell Composition</span>
                <span className="font-semibold text-navy dark:text-white sm:text-right">{currentSpec.shellMaterial}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-mid dark:text-blue-pale/70 font-medium shrink-0">Wheel System</span>
                <span className="font-semibold text-navy dark:text-white sm:text-right">{currentSpec.wheelSystem}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-mid dark:text-blue-pale/70 font-medium shrink-0">Locking System</span>
                <span className="font-semibold text-navy dark:text-white sm:text-right">{currentSpec.lockSystem}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-mid dark:text-blue-pale/70 font-medium shrink-0">Handle Engineering</span>
                <span className="font-semibold text-navy dark:text-white sm:text-right">{currentSpec.handle}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-mid dark:text-blue-pale/70 font-medium shrink-0">Digital Intelligence</span>
                <span className="font-semibold text-brand dark:text-sky font-mono text-[12px] sm:text-right">{currentSpec.sensor}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-mid dark:text-blue-pale/70 font-medium shrink-0">Airline Clearance</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 sm:text-right">
                  <Check className="size-3.5 stroke-[3] shrink-0" />
                  {currentSpec.iataStatus}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-mid dark:text-blue-pale/60 italic pt-1">
              * Measurements include handles and silent-run wheels in strict conformance with International Air Transport Association (IATA) guidelines.
            </p>
          </div>

          {/* Quick Action Footer: Airline Matrix Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky/15 text-navy dark:text-sky shrink-0">
                <Plane className="size-5 text-brand dark:text-sky" />
              </div>
              <div>
                <span className="text-small font-bold text-navy dark:text-white block">
                  Global Airline Compatibility
                </span>
                <span className="text-[12px] text-mid dark:text-blue-pale/70 block">
                  Verify dimensional compatibility with 50+ airlines (Lufthansa, BA, SAS, Delta, etc.)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMatrixOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-navy dark:bg-sky px-4 py-2 text-caption font-semibold text-white dark:text-navy shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
            >
              <span>Inspect Matrix (50+ Airlines)</span>
            </button>
          </div>
        </div>
      </div>

      <AirlineMatrixModal isOpen={matrixOpen} onClose={() => setMatrixOpen(false)} />
    </div>
  );
}
