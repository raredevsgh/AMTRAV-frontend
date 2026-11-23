"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useRegion } from "@/lib/region";
import { addToCart } from "@/lib/shop";
import CartDrawer from "../_components/CartDrawer";
import BagViewer from "../_components/BagViewer";

interface ShellOption {
  id: string;
  name: string;
  tier: "Essential" | "Pro" | "Executive" | "Flagship";
  size: "Cabin 55" | "Check-In 68" | "Both (The Pair)" | "Trunk 90";
  finish: string;
  finishColor: string;
  priceUsdMinor: number;
  image: string;
}

const SHELLS: ShellOption[] = [
  // Essential Collection (Photo 1 colors)
  { id: "ess-c55-black", name: "Essential Cabin 55", tier: "Essential", size: "Cabin 55", finish: "Midnight Black", finishColor: "#1a1a1c", priceUsdMinor: 32900, image: "/images/trace/range-essential.png" },
  { id: "ess-c55-grey", name: "Essential Cabin 55", tier: "Essential", size: "Cabin 55", finish: "Space Grey", finishColor: "#7d828a", priceUsdMinor: 32900, image: "/images/trace/range-pro.png" },
  { id: "ess-c55-navy", name: "Essential Cabin 55", tier: "Essential", size: "Cabin 55", finish: "Navy Blue", finishColor: "#1e2d42", priceUsdMinor: 32900, image: "/images/trace/range-flagship.png" },
  { id: "ess-c68-navy", name: "Essential Check-In 68", tier: "Essential", size: "Check-In 68", finish: "Navy Blue", finishColor: "#1e2d42", priceUsdMinor: 39900, image: "/images/trace/range-flagship.png" },
  { id: "ess-both-pair", name: "Essential The Pair (Duo)", tier: "Essential", size: "Both (The Pair)", finish: "Matched Cabin + Check-In", finishColor: "#1e2d42", priceUsdMinor: 65900, image: "/images/trace/hero-pair.jpg" },

  // Pro & Flagship Collection (Photo 2 colors)
  { id: "pro-c55-silver", name: "AMTRAV Pro Cabin 55", tier: "Pro", size: "Cabin 55", finish: "Titanium Silver", finishColor: "#c5cbd3", priceUsdMinor: 38900, image: "/images/trace/range-pro.png" },
  { id: "pro-c55-black", name: "AMTRAV Pro Cabin 55", tier: "Pro", size: "Cabin 55", finish: "Graphite Black", finishColor: "#2b2d2f", priceUsdMinor: 38900, image: "/images/trace/range-essential.png" },
  { id: "pro-c55-blue", name: "AMTRAV Pro Cabin 55", tier: "Pro", size: "Cabin 55", finish: "Midnight Blue", finishColor: "#1d3356", priceUsdMinor: 38900, image: "/images/trace/range-flagship.png" },
  { id: "pro-c55-white", name: "AMTRAV Pro Cabin 55", tier: "Pro", size: "Cabin 55", finish: "Pearl White", finishColor: "#f4f5f7", priceUsdMinor: 38900, image: "/images/trace/range-essential.png" },
  { id: "pro-c55-gold", name: "AMTRAV Pro Cabin 55", tier: "Pro", size: "Cabin 55", finish: "Champagne Gold", finishColor: "#d8b888", priceUsdMinor: 38900, image: "/images/trace/range-executive.png" },
  { id: "pro-c55-green", name: "AMTRAV Pro Cabin 55", tier: "Pro", size: "Cabin 55", finish: "Forest Green", finishColor: "#3e533e", priceUsdMinor: 38900, image: "/images/trace/range-flagship.png" },

  // Pro Check-in & Duo
  { id: "pro-c68-silver", name: "AMTRAV Pro Check-In 68", tier: "Pro", size: "Check-In 68", finish: "Titanium Silver", finishColor: "#c5cbd3", priceUsdMinor: 48900, image: "/images/trace/range-pro.png" },
  { id: "pro-both-pair", name: "AMTRAV Pro The Pair (Duo)", tier: "Pro", size: "Both (The Pair)", finish: "Titanium Silver Duo Set", finishColor: "#c5cbd3", priceUsdMinor: 77900, image: "/images/trace/hero-pair.jpg" },

  // Trunk
  { id: "t90-silver", name: "AMTRAV Original Trunk 90", tier: "Executive", size: "Trunk 90", finish: "Brushed Aluminium", finishColor: "#c5cbd3", priceUsdMinor: 59000, image: "/images/trace/range-flagship.png" },
];

const TAG_COLORS = [
  { id: "cognac", name: "Cognac Leather", hex: "#7a411f", priceUsdMinor: 0 },
  { id: "black", name: "Onyx Black", hex: "#1a1a1a", priceUsdMinor: 0 },
  { id: "papaya", name: "Papaya Orange", hex: "#e05a2b", priceUsdMinor: 3000 },
  { id: "emerald", name: "Emerald Green", hex: "#1c5d3f", priceUsdMinor: 3000 },
  { id: "ocean", name: "Ocean Cobalt", hex: "#133863", priceUsdMinor: 3000 },
];

const FOIL_TYPES = [
  { id: "blind", name: "Blind Deboss (Subtle)" },
  { id: "silver", name: "Silver Metallic Foil" },
  { id: "gold", name: "24K Gold Foil" },
];

const HANDLE_COLORS = [
  { id: "standard", name: "Standard Classic Handle", hex: "#1a1a1a", priceUsdMinor: 0 },
  { id: "cognac", name: "Cognac Full-Grain Leather", hex: "#7a411f", priceUsdMinor: 8000 },
  { id: "papaya", name: "Papaya Accent Leather", hex: "#e05a2b", priceUsdMinor: 8000 },
  { id: "emerald", name: "Emerald Accent Leather", hex: "#1c5d3f", priceUsdMinor: 8000 },
];

const WHEEL_SETS = [
  { id: "black", name: "Matte Black Multiwheel®", hex: "#1a1a1a", priceUsdMinor: 0 },
  { id: "silver", name: "Brushed Silver Hub", hex: "#b8c0cc", priceUsdMinor: 4000 },
  { id: "orange", name: "Signal Orange Caps", hex: "#e05a2b", priceUsdMinor: 6000 },
  { id: "blue", name: "Cobalt Blue Caps", hex: "#133863", priceUsdMinor: 6000 },
  { id: "emerald", name: "Emerald Green Caps", hex: "#1c5d3f", priceUsdMinor: 6000 },
];

export default function ConfiguratorClient() {
  const router = useRouter();
  const { formatPrice, isEcommerce } = useRegion();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedShell, setSelectedShell] = useState<ShellOption>(SHELLS[0]);
  const [shellSizeFilter, setShellSizeFilter] = useState<"all" | "Cabin 55" | "Check-In 68" | "Both (The Pair)">("all");
  const [customShellHex, setCustomShellHex] = useState("#c5cbd3");
  const [isCustomShellColor, setIsCustomShellColor] = useState(false);
  const [selectedTag, setSelectedTag] = useState(TAG_COLORS[0]);
  const [monogramText, setMonogramText] = useState("AMT");
  const [monogramFoil, setMonogramFoil] = useState(FOIL_TYPES[1]);
  const [selectedHandle, setSelectedHandle] = useState(HANDLE_COLORS[0]);
  const [selectedWheels, setSelectedWheels] = useState(WHEEL_SETS[0]);

  const [cartOpen, setCartOpen] = useState(false);

  // Total price computation
  const totalMinor =
    selectedShell.priceUsdMinor +
    selectedTag.priceUsdMinor +
    selectedHandle.priceUsdMinor +
    selectedWheels.priceUsdMinor;

  const handleAddCustomToBag = () => {
    if (!isEcommerce) {
      router.push("/services/stores");
      return;
    }
    // Map to base SKU in catalog
    const baseSku = selectedShell.size.includes("Pair")
      ? "the-pair"
      : selectedShell.size === "Cabin 55"
      ? "cabin-55"
      : selectedShell.size === "Check-In 68"
      ? "checkin-68"
      : "trunk-90";

    const activeColorHex = isCustomShellColor ? customShellHex : selectedShell.finishColor;
    const cleanHex = activeColorHex.replace("#", "");
    const colorDesc = isCustomShellColor ? `Bespoke Custom (${customShellHex})` : selectedShell.finish;
    const compoundSku = `${baseSku}__${encodeURIComponent(`${selectedShell.name} · ${colorDesc} [Tag: ${monogramText || "AMT"}]`)}__${cleanHex}`;

    addToCart(compoundSku, 1);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface/30 pt-0 sm:pt-2 pb-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Studio Header */}
        <div className="border-b border-divider pb-4 sm:pb-6 text-center">
          <h1 className="text-display-m font-bold text-navy md:text-h1 tracking-tight">
            Build Your Bespoke Silhouette
          </h1>
          <p className="mt-2 text-small text-mid max-w-xl mx-auto">
            Configure your case shell, personalized leather tag monogram, handle accents, and customized Multiwheel® sets in real time.
          </p>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="my-6 sm:my-8 flex items-center justify-between max-w-2xl mx-auto px-2">
          {[
            { num: 1, label: "Shell & Size" },
            { num: 2, label: "Tag & Monogram" },
            { num: 3, label: "Handle Accents" },
            { num: 4, label: "Wheel Sets" },
          ].map((step) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num as typeof currentStep)}
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full text-caption font-bold transition-all ${
                    isCurrent
                      ? "bg-navy text-white shadow-md ring-2 ring-sky"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-surface border border-divider text-mid"
                  }`}
                >
                  {isCompleted ? <Check className="size-4" /> : step.num}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-center max-w-[70px] sm:max-w-none leading-tight ${
                    isCurrent ? "text-navy" : "text-mid"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Configurator Area: 3D Left, Configuration Right */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left: Interactive 3D Canvas / Visual Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
            <BagViewer
              defaultLuggageType={selectedShell.size.includes("Pair") ? "both" : selectedShell.size === "Cabin 55" ? "cabin" : "checkin"}
              externalLuggageType={selectedShell.size.includes("Pair") ? "both" : selectedShell.size === "Cabin 55" ? "cabin" : "checkin"}
              externalColorHex={isCustomShellColor ? customShellHex : selectedShell.finishColor}
              externalTier={selectedShell.tier.toLowerCase() as any}
              className="w-full"
            />

            {/* Monogram Overlay Badge Preview */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface border border-divider p-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/20 shadow-md font-serif font-bold text-lg"
                    style={{
                      backgroundColor: selectedTag.hex,
                      color:
                        monogramFoil.id === "gold"
                          ? "#f3d178"
                          : monogramFoil.id === "silver"
                          ? "#e2e8f0"
                          : "rgba(0,0,0,0.45)",
                    }}
                  >
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-black/40 border border-white/20" />
                    <span className="drop-shadow-sm tracking-wider">{monogramText || "AMT"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-mid">
                      Personalized Luggage Tag
                    </span>
                    <p className="text-small font-semibold text-navy">
                      {selectedTag.name} · {monogramFoil.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-caption font-mono text-mid">Initial Stamp</span>
                  <p className="text-small font-bold text-navy uppercase tracking-widest">{monogramText || "AMT"}</p>
                </div>
              </div>
          </div>

          {/* Right: Step Options Panel (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-divider bg-white p-6 sm:p-8 shadow-card space-y-6">
            {/* Step 1: Base Shell & Silhouette */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <span className="text-caption font-mono text-sky uppercase">Step 1 of 4</span>
                  <h3 className="text-h3-m font-bold text-navy">Select Base Shell & Size</h3>
                  <p className="text-caption text-mid mt-0.5">
                    Choose your case capacity (Cabin, Check-In, or Both) and aerospace finish.
                  </p>
                </div>

                {/* Luggage Type Filter Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-xl bg-surface p-1 border border-divider text-center">
                  {[
                    { id: "all", label: "All" },
                    { id: "Cabin 55", label: "Cabin 55" },
                    { id: "Check-In 68", label: "Check-In" },
                    { id: "Both (The Pair)", label: "Both (Duo)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setShellSizeFilter(tab.id as typeof shellSizeFilter)}
                      className={`rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                        shellSizeFilter === tab.id
                          ? "bg-navy text-white shadow-xs"
                          : "text-mid hover:text-navy"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {SHELLS.filter(
                    (s) => shellSizeFilter === "all" || s.size === shellSizeFilter
                  ).map((shell) => {
                    const isSelected = selectedShell.id === shell.id && !isCustomShellColor;
                    return (
                      <button
                        key={shell.id}
                        type="button"
                        onClick={() => {
                          setSelectedShell(shell);
                          setIsCustomShellColor(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                          isSelected
                            ? "border-navy bg-navy/5 shadow-xs ring-1 ring-navy font-semibold"
                            : "border-divider bg-white hover:border-mid hover:bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span
                            className="size-4.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: shell.finishColor }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-small text-navy flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="truncate">{shell.name}</span>
                              <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-mono text-mid shrink-0">
                                {shell.size}
                              </span>
                            </div>
                            <div className="text-caption text-mid font-normal truncate">{shell.finish}</div>
                          </div>
                        </div>
                        <span className="text-small font-bold text-navy shrink-0 ml-2">
                          {formatPrice(shell.priceUsdMinor)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Bespoke Custom Color Picker */}
                <div className="rounded-2xl border border-divider bg-surface/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-navy">
                      Bespoke Shell Hue
                    </span>
                    <label className="relative flex cursor-pointer items-center gap-2 rounded-lg border border-divider bg-white px-2.5 py-1 text-xs font-mono font-bold text-navy hover:border-navy shadow-xs">
                      <span
                        className="size-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: customShellHex }}
                      />
                      <span>{customShellHex.toUpperCase()}</span>
                      <input
                        type="color"
                        value={customShellHex}
                        onChange={(e) => {
                          setCustomShellHex(e.target.value);
                          setIsCustomShellColor(true);
                        }}
                        className="absolute inset-0 size-full cursor-pointer opacity-0"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-mid">
                    Click the color chip to choose any custom RAL/hex shade for your aerospace shell.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Leather Luggage Tag & Monogramming */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <span className="text-caption font-mono text-sky uppercase">Step 2 of 4</span>
                  <h3 className="text-h3-m font-bold text-navy">Leather Tag & Monogram</h3>
                  <p className="text-caption text-mid mt-0.5">
                    Italian leather luggage tag embossed with your initials.
                  </p>
                </div>

                {/* Monogram Input */}
                <div>
                  <label className="block text-caption-m font-semibold uppercase text-mid mb-1">
                    Your Initials (Up to 3 letters)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={monogramText}
                    onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                    placeholder="AMT"
                    className="w-full rounded-xl border border-divider px-4 py-2.5 text-center font-serif text-xl font-bold tracking-widest text-navy uppercase focus:border-navy focus:outline-none"
                  />
                </div>

                {/* Foil Finish */}
                <div>
                  <label className="block text-caption-m font-semibold uppercase text-mid mb-2">
                    Embossing Foil
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {FOIL_TYPES.map((foil) => {
                      const isSelected = monogramFoil.id === foil.id;
                      return (
                        <button
                          key={foil.id}
                          type="button"
                          onClick={() => setMonogramFoil(foil)}
                          className={`flex items-center justify-between rounded-xl border p-3 text-small text-left transition-all ${
                            isSelected
                              ? "border-navy bg-navy text-white font-semibold shadow-xs"
                              : "border-divider bg-white text-navy hover:bg-surface"
                          }`}
                        >
                          <span>{foil.name}</span>
                          {isSelected && <Check className="size-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tag Colorway */}
                <div>
                  <label className="block text-caption-m font-semibold uppercase text-mid mb-2">
                    Leather Color
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {TAG_COLORS.map((tag) => {
                      const isSelected = selectedTag.id === tag.id;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setSelectedTag(tag)}
                          className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-navy bg-navy/5 font-semibold text-navy ring-1 ring-navy"
                              : "border-divider bg-white text-navy hover:bg-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="size-4.5 rounded-full border border-black/20"
                              style={{ backgroundColor: tag.hex }}
                            />
                            <span className="text-small">{tag.name}</span>
                          </div>
                          <span className="text-caption font-bold text-navy">
                            {tag.priceUsdMinor > 0 ? `+${formatPrice(tag.priceUsdMinor)}` : "Complimentary"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Handle Accents */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <span className="text-caption font-mono text-sky uppercase">Step 3 of 4</span>
                  <h3 className="text-h3-m font-bold text-navy">Handle Accent Colors</h3>
                  <p className="text-caption text-mid mt-0.5">
                    Customize the top and side carrying handles with colored Italian leather.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {HANDLE_COLORS.map((handle) => {
                    const isSelected = selectedHandle.id === handle.id;
                    return (
                      <button
                        key={handle.id}
                        type="button"
                        onClick={() => setSelectedHandle(handle)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-navy bg-navy/5 font-semibold text-navy ring-1 ring-navy"
                            : "border-divider bg-white text-navy hover:bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="size-5 rounded-full border border-black/20"
                            style={{ backgroundColor: handle.hex }}
                          />
                          <span className="text-small">{handle.name}</span>
                        </div>
                        <span className="text-caption font-bold text-navy">
                          {handle.priceUsdMinor > 0 ? `+${formatPrice(handle.priceUsdMinor)}` : "Included"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Multiwheel Wheel Sets */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <span className="text-caption font-mono text-sky uppercase">Step 4 of 4</span>
                  <h3 className="text-h3-m font-bold text-navy">Multiwheel® Accent Set</h3>
                  <p className="text-caption text-mid mt-0.5">
                    Select matching or high-contrast ball-bearing wheel caps.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {WHEEL_SETS.map((wheel) => {
                    const isSelected = selectedWheels.id === wheel.id;
                    return (
                      <button
                        key={wheel.id}
                        type="button"
                        onClick={() => setSelectedWheels(wheel)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-navy bg-navy/5 font-semibold text-navy ring-1 ring-navy"
                            : "border-divider bg-white text-navy hover:bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="size-5 rounded-full border border-black/20"
                            style={{ backgroundColor: wheel.hex }}
                          />
                          <span className="text-small">{wheel.name}</span>
                        </div>
                        <span className="text-caption font-bold text-navy">
                          {wheel.priceUsdMinor > 0 ? `+${formatPrice(wheel.priceUsdMinor)}` : "Standard"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-divider pt-5">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as typeof currentStep)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-caption font-semibold transition-all ${
                  currentStep === 1
                    ? "opacity-30 cursor-not-allowed text-mid"
                    : "text-navy hover:bg-surface"
                }`}
              >
                <ChevronLeft className="size-4" /> Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as typeof currentStep)}
                  className="flex items-center gap-1.5 rounded-full bg-navy px-5 py-2 text-caption font-semibold text-white shadow-xs hover:bg-navy-deep active:scale-95 transition-all"
                >
                  Next Step <ChevronRight className="size-4" />
                </button>
              ) : (
                <span className="text-caption font-bold text-emerald-600">Configuration Ready ✓</span>
              )}
            </div>

            {/* Configuration Summary & Add to Bag */}
            <div className="rounded-2xl bg-surface p-4 border border-divider space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption text-mid">Total Custom Build</span>
                <span className="text-h3-m font-bold text-navy">{formatPrice(totalMinor)}</span>
              </div>

              <button
                type="button"
                onClick={handleAddCustomToBag}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-small font-semibold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all"
              >
                <ShoppingBag className="size-4" />
                <span>{isEcommerce ? "Add Custom Build to Bag" : "Store Appointment"}</span>
              </button>
              <p className="text-[10px] text-center text-mid">
                Includes Lifetime Guarantee & complimentary initial embossing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}