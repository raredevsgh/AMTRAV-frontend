"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, CornerDownLeft, Luggage } from "lucide-react";
import { useRegion } from "@/lib/region";

export interface SearchProduct {
  sku: string;
  name: string;
  category: "Luggage" | "Bags" | "Accessories" | "Services";
  tag: string;
  priceUsdMinor: number;
  image: string;
  href: string;
  description: string;
}

const SEARCH_CATALOG: SearchProduct[] = [
  {
    sku: "AMT-BAG-001",
    name: "AMTRAV Premium Suede & Aluminium Duffel Side Bag",
    category: "Bags",
    tag: "New Signature",
    priceUsdMinor: 48000,
    image: "/images/trace/duffel-side-bag.jpg",
    href: "/shop?product=duffel-side-bag",
    description: "Premium Suede with Aluminium Stripes, RFID Protection, 5 colorways, 32L.",
  },
  {
    sku: "AMT-CABIN-55",
    name: "Cabin 55 Smart Carry-On",
    category: "Luggage",
    tag: "Bestseller",
    priceUsdMinor: 34900,
    image: "/images/trace/range-essential.png",
    href: "/shop?product=Cabin+55",
    description: "Fits airline overhead bin. Aerospace polycarbonate, TRACE Core weighing.",
  },
  {
    sku: "AMT-CHECK-68",
    name: "Check-In 68 Smart Suitcase",
    category: "Luggage",
    tag: "Top Rated",
    priceUsdMinor: 42900,
    image: "/images/trace/range-flagship.png",
    href: "/shop?product=Check-in+68",
    description: "Drop & impact tracking, 65L capacity, dual TSA-approved combination locks.",
  },
  {
    sku: "AMT-CHECK-76",
    name: "Check-In 76 Extended Luggage",
    category: "Luggage",
    tag: "Long Haul",
    priceUsdMinor: 46900,
    image: "/images/trace/range-executive.png",
    href: "/shop?product=Check-in+76",
    description: "86L large volume. Built-in weighing handle avoids excess fees.",
  },
  {
    sku: "AMT-PAIR-001",
    name: "The Pair Bundle (Cabin 55 + Check-In 68)",
    category: "Luggage",
    tag: "Bundle Savings",
    priceUsdMinor: 71900,
    image: "/images/trace/hero-pair.jpg",
    href: "/shop?product=The+Pair",
    description: "Complete matching travel set with bundle savings and TRACE Core included.",
  },
  {
    sku: "AMT-SRV-LOCK",
    name: "TSA Lock Setting & Reset Tutorial",
    category: "Services",
    tag: "Support",
    priceUsdMinor: 0,
    image: "/images/trace/range-pro.png",
    href: "/services/lock-tutorial",
    description: "Interactive step-by-step combination lock reset and setup guide.",
  },
  {
    sku: "AMT-SRV-REG",
    name: "Digital Luggage Registration",
    category: "Services",
    tag: "Warranty",
    priceUsdMinor: 0,
    image: "/images/trace/range-essential.png",
    href: "/services/registration",
    description: "Activate your Lifetime Guarantee and pair your unique serial number.",
  },
];

const POPULAR_SEARCHES = [
  "Suede Duffel Bag",
  "Cabin 55",
  "Check-In 68",
  "RFID Protection",
  "Lifetime Guarantee",
  "Combination Lock Tutorial",
];

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const { formatPrice } = useRegion();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_CATALOG.slice(0, 4);
    return SEARCH_CATALOG.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
    );
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        window.location.href = filteredResults[selectedIndex].href;
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
      className="fixed inset-0 z-50 flex flex-col justify-start bg-ink/75 backdrop-blur-md transition-all p-3 sm:p-6"
    >
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-divider bg-white shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-divider px-5 py-4">
          <Search className="size-5 shrink-0 text-mid" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search by keyword, size, or item no. (e.g. Suede Duffel, Cabin 55...)"
            className="flex-1 bg-transparent text-base sm:text-lg font-medium text-navy placeholder:text-mid/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-full p-1 text-mid hover:bg-surface hover:text-navy"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface p-2 text-mid transition hover:bg-navy/10 hover:text-navy"
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Popular Tags */}
        <div className="border-b border-divider/60 bg-surface/50 px-5 py-2.5 flex items-center gap-2 overflow-x-auto text-caption">
          <span className="shrink-0 text-mid font-medium flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-sky inline-block" /> Popular:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="shrink-0 rounded-full bg-white px-3 py-1 border border-divider text-navy hover:border-navy hover:text-navy transition-all"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-mid">
              <Luggage className="mx-auto size-10 opacity-30 mb-2" />
              <p className="text-small font-medium text-navy">No products match &ldquo;{query}&rdquo;</p>
              <p className="text-caption mt-1">Try searching for &ldquo;Cabin 55&rdquo;, &ldquo;Duffel&rdquo;, or &ldquo;Lock&rdquo;</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={item.sku}
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-4 rounded-2xl p-3 transition-all ${
                    isSelected ? "bg-navy text-white shadow-md ring-1 ring-navy" : "hover:bg-surface text-navy"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white border border-divider p-1">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isSelected ? "bg-sky text-navy" : "bg-navy/10 text-navy"
                          }`}
                        >
                          {item.tag}
                        </span>
                        <span className={`text-[11px] font-mono ${isSelected ? "text-blue-pale" : "text-mid"}`}>
                          {item.sku}
                        </span>
                      </div>
                      <h4 className="text-small font-semibold truncate mt-0.5">{item.name}</h4>
                      <p className={`text-caption truncate ${isSelected ? "text-light-white" : "text-mid"}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    {item.priceUsdMinor > 0 ? (
                      <span className="text-small font-bold">{formatPrice(item.priceUsdMinor)}</span>
                    ) : (
                      <span className="text-caption font-semibold uppercase tracking-wider">Service</span>
                    )}
                    <ArrowRight className={`size-4 ${isSelected ? "text-sky" : "text-mid"}`} />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Instructions */}
        <div className="flex items-center justify-between border-t border-divider bg-surface px-5 py-3 text-caption text-mid">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-xs">↑</kbd>
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-xs">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-xs flex items-center">
                <CornerDownLeft className="size-2.5" />
              </kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-xs">ESC</kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="text-[11px] font-mono">AMTRAV Search Engine</span>
        </div>
      </div>
    </div>
  );
}