"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Coins, ChevronDown, Check, RefreshCw, Calculator, Search } from "lucide-react";
import { useRegion } from "@/lib/region";

export default function CurrencySwitcher({
  className = "",
  isNegative = false,
  direction = "down",
}: {
  className?: string;
  isNegative?: boolean;
  direction?: "down" | "up";
}) {
  const {
    currency,
    currencyCode,
    currencies,
    setCurrency,
    convertPrice,
    rateVsUsd,
    syncLiveRates,
  } = useRegion();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [calcAmount, setCalcAmount] = useState<string>("480"); // Default signature bag price ($480)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync live rates on mount
  useEffect(() => {
    syncLiveRates();
  }, [syncLiveRates]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncLiveRates();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencies, searchQuery]);

  // Real-time calculation for the calculator tool
  const parsedCalcUsdMinor = useMemo(() => {
    const num = parseFloat(calcAmount);
    return isNaN(num) ? 0 : Math.round(num * 100);
  }, [calcAmount]);

  const convertedResult = useMemo(() => {
    return convertPrice(parsedCalcUsdMinor);
  }, [convertPrice, parsedCalcUsdMinor]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Header Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Current currency ${currency.code}. Click to open real-time currency converter.`}
        className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 sm:px-3 text-caption font-semibold backdrop-blur-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky active:scale-95 ${
          isNegative
            ? "border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 shadow-xs"
            : "border border-line bg-surface/80 text-navy hover:border-sky hover:bg-surface shadow-xs"
        }`}
      >
        <span className="relative flex size-2 shrink-0 items-center justify-center">
          <span className="absolute size-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
          <span className="relative size-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-base leading-none">{currency.flag}</span>
        <span className="font-mono text-xs">{currency.code}</span>
        <span className="hidden sm:inline font-mono text-[11px] text-mid">
          ({currency.symbol})
        </span>
        <ChevronDown
          className={`size-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${
            isNegative ? "text-white/80" : "text-mid"
          }`}
        />
      </button>

      {/* Floating Currency & Live Converter Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Real-time currency converter"
          className={`absolute right-0 z-50 ${
            direction === "up" ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-2 origin-top-right"
          } w-[300px] sm:w-[400px] max-w-[90vw] rounded-3xl border border-divider bg-white p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-navy`}
        >
          {/* Header with Live Status */}
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-navy/5 text-navy">
                <Coins className="size-4" />
              </div>
              <div>
                <h3 className="text-caption font-bold text-navy">
                  Real-Time Currency & Forex
                </h3>
                <p className="text-[11px] font-mono text-mid">
                  1 USD = {rateVsUsd} {currency.code} · Live
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh live market exchange rates"
              className="flex size-7 items-center justify-center rounded-full border border-divider bg-surface text-mid hover:text-navy hover:bg-white transition-all active:scale-90"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-brand" : ""}`} />
            </button>
          </div>

          {/* Interactive Live Converter Calculator */}
          <div className="my-3 rounded-2xl bg-surface/80 border border-divider p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-mid">
                <Calculator className="size-3 text-brand" /> Live Converter Tool
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Rates Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              {/* Input: Base USD */}
              <div className="flex flex-col gap-1 rounded-xl bg-white p-2 border border-divider shadow-inner">
                <span className="text-[10px] font-mono text-mid uppercase">USD Amount ($)</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-sm font-bold text-navy">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="w-full bg-transparent font-mono text-sm font-bold text-navy outline-none"
                    placeholder="480"
                  />
                </div>
              </div>

              {/* Output: Converted In Real Time */}
              <div className="flex flex-col gap-1 rounded-xl bg-navy p-2 text-white shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-blue-pale uppercase">
                  <span>{currency.code} ({currency.symbol})</span>
                  <span>{rateVsUsd}x</span>
                </div>
                <div className="font-mono text-sm font-bold text-sky truncate">
                  {convertedResult.formatted}
                </div>
              </div>
            </div>

            {/* Quick Luggage Price Presets */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
              <span className="text-[10px] text-mid shrink-0 mr-1">Presets:</span>
              {[
                { label: "Cabin 55", usd: "349" },
                { label: "Check-In 68", usd: "429" },
                { label: "The Pair (Duo)", usd: "719" },
                { label: "Trunk 90", usd: "590" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setCalcAmount(p.usd)}
                  className={`shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-mono transition-all ${
                    calcAmount === p.usd
                      ? "border-navy bg-navy text-white font-bold"
                      : "border-divider bg-white text-navy hover:bg-surface"
                  }`}
                >
                  {p.label} (${p.usd})
                </button>
              ))}
            </div>
          </div>

          {/* Search Currencies */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-mid" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter 24 currencies (e.g. NOK, EUR, GBP, JPY, kr)..."
              className="w-full rounded-xl border border-divider bg-surface py-1.5 pl-8 pr-3 text-caption text-navy placeholder:text-mid focus:border-navy focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Currency Selection Grid */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredCurrencies.map((c) => {
              const isSelected = c.code === currencyCode;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-caption transition-all ${
                    isSelected
                      ? "bg-navy text-white shadow-xs font-semibold"
                      : "text-navy hover:bg-surface border border-transparent hover:border-divider"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{c.flag}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{c.code}</span>
                        <span className={`text-[11px] font-mono ${isSelected ? "text-blue-pale" : "text-mid"}`}>
                          ({c.symbol})
                        </span>
                      </div>
                      <span className={`text-[11px] truncate max-w-[170px] ${isSelected ? "text-blue-pale" : "text-mid"}`}>
                        {c.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs ${isSelected ? "text-sky" : "text-mid"}`}>
                      {c.rateVsUsd}x
                    </span>
                    {isSelected && <Check className="size-4 text-sky" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-divider flex items-center justify-between text-[11px] text-mid">
            <span>All shop prices convert instantly</span>
            <span className="font-semibold text-brand">Auto-Converted</span>
          </div>
        </div>
      )}
    </div>
  );
}
