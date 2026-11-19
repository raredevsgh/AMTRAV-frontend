"use client";

import React, { useState } from "react";
import { Plane } from "lucide-react";
import { ShopProduct } from "@/lib/shop";
import AirlineMatrixModal from "./AirlineMatrixModal";

interface TechnicalBlueprintProps {
  product: ShopProduct;
}

export default function TechnicalBlueprint({ product }: TechnicalBlueprintProps) {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [matrixOpen, setMatrixOpen] = useState(false);

  const isMetric = unit === "metric";

  const heightVal = isMetric ? `${product.dimensionsCm.height} cm` : `${product.dimensionsInches.height} in`;
  const widthVal = isMetric ? `${product.dimensionsCm.width} cm` : `${product.dimensionsInches.width} in`;
  const depthVal = isMetric ? `${product.dimensionsCm.depth} cm` : `${product.dimensionsInches.depth} in`;

  const measurementStr = isMetric
    ? `${product.dimensionsCm.height} × ${product.dimensionsCm.width} × ${product.dimensionsCm.depth} cm`
    : `${product.dimensionsInches.height} × ${product.dimensionsInches.width} × ${product.dimensionsInches.depth} in`;

  const weightStr = isMetric ? `${product.weightKg} kg` : `${product.weightLbs} lbs`;
  const volumeStr = isMetric ? `${product.volumeL} L` : `${product.volumeGal} gal`;

  return (
    <div className="rounded-3xl border border-divider bg-white p-6 sm:p-8">
      {/* Section Title & Metric / Imperial Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-4">
        <div>
          <span className="text-caption font-mono uppercase tracking-wider text-mid">Engineering Specifications</span>
          <h3 className="text-h3-m font-bold text-navy">Size and Weight</h3>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-surface border border-divider p-1">
          <button
            type="button"
            onClick={() => setUnit("metric")}
            className={`rounded-full px-3.5 py-1 text-caption font-semibold transition-all ${
              isMetric ? "bg-navy text-white shadow-xs" : "text-mid hover:text-navy"
            }`}
          >
            Metric
          </button>
          <button
            type="button"
            onClick={() => setUnit("imperial")}
            className={`rounded-full px-3.5 py-1 text-caption font-semibold transition-all ${
              !isMetric ? "bg-navy text-white shadow-xs" : "text-mid hover:text-navy"
            }`}
          >
            Imperial
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* CAD Blueprint SVG Illustration */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-surface/50 p-6 border border-divider">
          <svg
            viewBox="0 0 320 280"
            className="w-full max-w-[280px] text-navy"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Front View Outline */}
            <rect x="40" y="50" width="110" height="170" rx="14" className="stroke-navy/80 fill-white" />
            {/* Telescopic Handle */}
            <path d="M70 50 V20 H120 V50" className="stroke-navy/60" strokeDasharray="3 3" />
            <rect x="75" y="14" width="40" height="8" rx="2" className="fill-navy/20 stroke-navy" />
            {/* Grooves / Ribs */}
            <line x1="60" y1="75" x2="130" y2="75" className="stroke-navy/30" />
            <line x1="60" y1="95" x2="130" y2="95" className="stroke-navy/30" />
            <line x1="60" y1="115" x2="130" y2="115" className="stroke-navy/30" />
            <line x1="60" y1="135" x2="130" y2="135" className="stroke-navy/30" />
            <line x1="60" y1="155" x2="130" y2="155" className="stroke-navy/30" />
            <line x1="60" y1="175" x2="130" y2="175" className="stroke-navy/30" />
            <line x1="60" y1="195" x2="130" y2="195" className="stroke-navy/30" />
            {/* Wheels */}
            <circle cx="60" cy="225" r="7" className="fill-navy/10 stroke-navy" />
            <circle cx="130" cy="225" r="7" className="fill-navy/10 stroke-navy" />

            {/* Side View Outline */}
            <rect x="180" y="50" width="65" height="170" rx="12" className="stroke-navy/80 fill-white" />
            <path d="M200 50 V20 H225 V50" className="stroke-navy/60" strokeDasharray="3 3" />
            <rect x="195" y="14" width="35" height="8" rx="2" className="fill-navy/20 stroke-navy" />
            <circle cx="195" cy="225" r="7" className="fill-navy/10 stroke-navy" />
            <circle cx="230" cy="225" r="7" className="fill-navy/10 stroke-navy" />

            {/* Height dimension line */}
            <line x1="265" y1="50" x2="265" y2="230" className="stroke-sky" strokeWidth="1.2" />
            <path d="M261 54 L265 50 L269 54 M261 226 L265 230 L269 226" className="stroke-sky" />
            <text x="275" y="145" className="fill-navy text-[11px] font-mono font-medium" transform="rotate(90 275 145)">
              {heightVal}
            </text>

            {/* Width dimension line */}
            <line x1="40" y1="248" x2="150" y2="248" className="stroke-sky" strokeWidth="1.2" />
            <path d="M44 244 L40 248 L44 252 M146 244 L150 248 L146 252" className="stroke-sky" />
            <text x="75" y="262" className="fill-navy text-[11px] font-mono font-medium">
              {widthVal}
            </text>

            {/* Depth dimension line */}
            <line x1="180" y1="248" x2="245" y2="248" className="stroke-sky" strokeWidth="1.2" />
            <path d="M184 244 L180 248 L184 252 M241 244 L245 248 L241 252" className="stroke-sky" />
            <text x="195" y="262" className="fill-navy text-[11px] font-mono font-medium">
              {depthVal}
            </text>
          </svg>
          <span className="mt-3 text-[11px] text-mid font-mono">CAD Technical Projection</span>
        </div>

        {/* Dimension Specs & Airline Compatibility CTA */}
        <div className="space-y-4">
          <div className="flex justify-between border-b border-divider/80 py-2.5">
            <span className="text-small text-mid">Measurement</span>
            <span className="text-small font-semibold font-mono text-navy">{measurementStr}</span>
          </div>

          <div className="flex justify-between border-b border-divider/80 py-2.5">
            <span className="text-small text-mid">Weight</span>
            <span className="text-small font-semibold font-mono text-navy">{weightStr}</span>
          </div>

          <div className="flex justify-between border-b border-divider/80 py-2.5">
            <span className="text-small text-mid">Volume</span>
            <span className="text-small font-semibold font-mono text-navy">{volumeStr}</span>
          </div>

          <p className="text-[11px] text-mid italic">
            * Measurements include wheels and handles in compliance with international IATA standards.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setMatrixOpen(true)}
              className="group flex items-center gap-2 text-small font-semibold text-brand underline underline-offset-4 hover:text-navy transition-colors"
            >
              <Plane className="size-4 text-sky" />
              <span>Airline Compatibility Matrix (50+ Airlines)</span>
            </button>
          </div>
        </div>
      </div>

      <AirlineMatrixModal isOpen={matrixOpen} onClose={() => setMatrixOpen(false)} />
    </div>
  );
}