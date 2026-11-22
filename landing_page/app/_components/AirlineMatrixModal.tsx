"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X, CheckCircle, AlertCircle, Plane } from "lucide-react";

export interface AirlineSpec {
  name: string;
  flag: string;
  maxDimensionsCm: string;
  maxDimensionsIn: string;
  maxWeightKg: string;
  cabin55Compatible: boolean;
  notes: string;
}

const AIRLINES: AirlineSpec[] = [
  { name: "SAS Scandinavian Airlines", flag: "🇸🇪", maxDimensionsCm: "55 x 40 x 23 cm", maxDimensionsIn: "21.7 x 15.7 x 9.1 in", maxWeightKg: "8 kg", cabin55Compatible: true, notes: "Standard SAS Go & Plus carry-on." },
  { name: "Norwegian Air", flag: "🇳🇴", maxDimensionsCm: "55 x 40 x 23 cm", maxDimensionsIn: "21.7 x 15.7 x 9.1 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "Included in LowFare+ and Flex tickets." },
  { name: "Lufthansa", flag: "🇩🇪", maxDimensionsCm: "55 x 40 x 23 cm", maxDimensionsIn: "21.7 x 15.7 x 9.1 in", maxWeightKg: "8 kg", cabin55Compatible: true, notes: "Economy: 1 piece. Business: 2 pieces." },
  { name: "Air France", flag: "🇫🇷", maxDimensionsCm: "55 x 35 x 25 cm", maxDimensionsIn: "21.7 x 13.8 x 9.8 in", maxWeightKg: "12 kg", cabin55Compatible: true, notes: "Combined hand luggage + accessory." },
  { name: "British Airways", flag: "🇬🇧", maxDimensionsCm: "56 x 45 x 25 cm", maxDimensionsIn: "22 x 18 x 10 in", maxWeightKg: "23 kg", cabin55Compatible: true, notes: "Generous hand-luggage policy." },
  { name: "KLM Royal Dutch Airlines", flag: "🇳🇱", maxDimensionsCm: "55 x 35 x 25 cm", maxDimensionsIn: "21.7 x 13.8 x 9.8 in", maxWeightKg: "12 kg", cabin55Compatible: true, notes: "Economy: 1 item up to 12kg." },
  { name: "Swiss International", flag: "🇨🇭", maxDimensionsCm: "55 x 40 x 23 cm", maxDimensionsIn: "21.7 x 15.7 x 9.1 in", maxWeightKg: "8 kg", cabin55Compatible: true, notes: "Star Alliance network rules." },
  { name: "Delta Air Lines", flag: "🇺🇸", maxDimensionsCm: "56 x 35 x 23 cm", maxDimensionsIn: "22 x 14 x 9 in", maxWeightKg: "No limit", cabin55Compatible: true, notes: "Must fit in overhead sizer." },
  { name: "American Airlines", flag: "🇺🇸", maxDimensionsCm: "56 x 36 x 23 cm", maxDimensionsIn: "22 x 14 x 9 in", maxWeightKg: "No limit", cabin55Compatible: true, notes: "Domestic and international standard." },
  { name: "United Airlines", flag: "🇺🇸", maxDimensionsCm: "56 x 35 x 22 cm", maxDimensionsIn: "22 x 14 x 9 in", maxWeightKg: "No limit", cabin55Compatible: true, notes: "Basic Economy rules apply." },
  { name: "Emirates", flag: "🇦🇪", maxDimensionsCm: "55 x 38 x 20 cm", maxDimensionsIn: "21.7 x 15 x 7.9 in", maxWeightKg: "7 kg", cabin55Compatible: true, notes: "Economy 1 bag, First/Business 2 bags." },
  { name: "Qatar Airways", flag: "🇶🇦", maxDimensionsCm: "50 x 37 x 25 cm", maxDimensionsIn: "19.7 x 14.6 x 9.8 in", maxWeightKg: "7 kg", cabin55Compatible: true, notes: "First & Business allow 2 pieces (15kg)." },
  { name: "Singapore Airlines", flag: "🇸🇬", maxDimensionsCm: "55 x 40 x 20 cm", maxDimensionsIn: "21.7 x 15.7 x 7.9 in", maxWeightKg: "7 kg", cabin55Compatible: true, notes: "Sum of length + width + height <= 115cm." },
  { name: "All Nippon Airways (ANA)", flag: "🇯🇵", maxDimensionsCm: "55 x 40 x 25 cm", maxDimensionsIn: "21.7 x 15.7 x 9.8 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "Aircraft over 100 seats." },
  { name: "Japan Airlines (JAL)", flag: "🇯🇵", maxDimensionsCm: "55 x 40 x 25 cm", maxDimensionsIn: "21.7 x 15.7 x 9.8 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "Total linear dimensions <= 115cm." },
  { name: "Korean Air", flag: "🇰🇷", maxDimensionsCm: "55 x 40 x 20 cm", maxDimensionsIn: "21.7 x 15.7 x 7.9 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "Economy: 10kg. Prestige: 18kg (2 pieces)." },
  { name: "Cathay Pacific", flag: "🇭🇰", maxDimensionsCm: "56 x 36 x 23 cm", maxDimensionsIn: "22 x 14 x 9 in", maxWeightKg: "7 kg", cabin55Compatible: true, notes: "Business: 10kg, First: 15kg." },
  { name: "Qantas", flag: "🇦🇺", maxDimensionsCm: "56 x 36 x 23 cm", maxDimensionsIn: "22 x 14 x 9 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "Total linear sum 115cm." },
  { name: "Iberia", flag: "🇪🇸", maxDimensionsCm: "56 x 40 x 25 cm", maxDimensionsIn: "22 x 15.7 x 9.8 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "Plus 1 personal accessory." },
  { name: "ITA Airways", flag: "🇮🇹", maxDimensionsCm: "55 x 35 x 25 cm", maxDimensionsIn: "21.7 x 13.8 x 9.8 in", maxWeightKg: "8 kg", cabin55Compatible: true, notes: "Must fit in airport sizer." },
  { name: "Ryanair", flag: "🇮🇪", maxDimensionsCm: "55 x 40 x 20 cm", maxDimensionsIn: "21.7 x 15.7 x 7.9 in", maxWeightKg: "10 kg", cabin55Compatible: true, notes: "With Priority & 2 Cabin Bags booking." },
  { name: "EasyJet", flag: "🇬🇧", maxDimensionsCm: "56 x 45 x 25 cm", maxDimensionsIn: "22 x 17.7 x 9.8 in", maxWeightKg: "15 kg", cabin55Compatible: true, notes: "With Speedy Boarding or Large Cabin booking." },
];

interface AirlineMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AirlineMatrixModal({ isOpen, onClose }: AirlineMatrixModalProps) {
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredAirlines = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AIRLINES;
    return AIRLINES.filter((a) => a.name.toLowerCase().includes(q) || a.notes.toLowerCase().includes(q));
  }, [query]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="airline-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 pt-[max(56px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] sm:p-6"
    >
      <div className="fixed inset-0 bg-ink/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative flex flex-col w-full max-w-4xl max-h-[calc(100vh-max(72px,env(safe-area-inset-top)))] overflow-hidden rounded-3xl border border-divider dark:border-white/15 bg-white dark:bg-[#071739] shadow-2xl">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between border-b border-divider dark:border-white/15 px-4 sm:px-6 py-4 sm:py-5 gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-navy/5 dark:bg-white/10 text-navy dark:text-sky">
              <Plane className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h2 id="airline-modal-title" className="text-body font-bold text-navy dark:text-white sm:text-h3-m leading-tight">
                Airline Hand-Luggage Compatibility Matrix
              </h2>
              <p className="text-[11px] sm:text-caption text-mid dark:text-blue-pale/80 line-clamp-2 mt-0.5">
                Compare AMTRAV Cabin 55 (55 × 40 × 23 cm) against global airline overhead bin restrictions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full bg-surface dark:bg-white/10 text-mid dark:text-white hover:bg-navy dark:hover:bg-white/25 hover:text-white transition-all active:scale-90"
            aria-label="Close"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>

        {/* Filter & Metric / Imperial Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider dark:border-white/15 bg-surface/50 dark:bg-[#0a1836] px-6 py-3.5">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mid dark:text-blue-pale/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search airline (e.g. SAS, Lufthansa, Delta, Emirates)..."
              className="w-full rounded-full border border-divider dark:border-white/20 bg-white dark:bg-[#0c1e45] py-2 pl-9 pr-4 text-small text-navy dark:text-white placeholder:text-mid dark:placeholder:text-blue-pale/50 focus:border-navy dark:focus:border-sky focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-[#0c1e45] border border-divider dark:border-white/15 p-1">
            <button
              type="button"
              onClick={() => setUnit("metric")}
              className={`rounded-full px-3 py-1 text-caption font-semibold transition-all ${
                unit === "metric" ? "bg-navy dark:bg-sky text-white dark:text-navy shadow-xs font-bold" : "text-mid dark:text-blue-pale/75 hover:text-navy dark:hover:text-white"
              }`}
            >
              Metric (cm / kg)
            </button>
            <button
              type="button"
              onClick={() => setUnit("imperial")}
              className={`rounded-full px-3 py-1 text-caption font-semibold transition-all ${
                unit === "imperial" ? "bg-navy dark:bg-sky text-white dark:text-navy shadow-xs font-bold" : "text-mid dark:text-blue-pale/75 hover:text-navy dark:hover:text-white"
              }`}
            >
              Imperial (in / lbs)
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse text-small">
            <thead className="sticky top-0 bg-surface dark:bg-[#0a1836] border-b border-divider dark:border-white/15 text-caption-m uppercase tracking-wider text-mid dark:text-blue-pale/70 font-semibold">
              <tr>
                <th className="px-6 py-3">Airline</th>
                <th className="px-4 py-3">Max Overhead Sizer</th>
                <th className="px-4 py-3">Max Weight</th>
                <th className="px-4 py-3">Cabin 55 Status</th>
                <th className="px-6 py-3">Guidelines</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/70 dark:divide-white/10">
              {filteredAirlines.map((airline) => (
                <tr key={airline.name} className="hover:bg-surface/60 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-navy dark:text-white flex items-center gap-2">
                    <span className="text-lg">{airline.flag}</span>
                    <span>{airline.name}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-caption text-navy dark:text-blue-pale">
                    {unit === "metric" ? airline.maxDimensionsCm : airline.maxDimensionsIn}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-caption text-navy dark:text-blue-pale">
                    {airline.maxWeightKg}
                  </td>
                  <td className="px-4 py-3.5">
                    {airline.cabin55Compatible ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 text-caption font-semibold">
                        <CheckCircle className="size-3.5" /> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 text-caption font-semibold">
                        <AlertCircle className="size-3.5" /> Check sizer
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-caption text-mid dark:text-blue-pale/70">
                    {airline.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="border-t border-divider dark:border-white/15 bg-surface dark:bg-[#0a1836] px-6 py-3.5 flex items-center justify-between text-caption text-mid dark:text-blue-pale/70">
          <span>Showing {filteredAirlines.length} international airlines</span>
          <span className="font-medium text-navy dark:text-white">AMTRAV Travel Assurance</span>
        </div>
      </div>
    </div>,
    document.body
  );
}