"use client";

import React, { useState } from "react";
import { Globe, X, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { COUNTRIES, CountryInfo, Continent, useRegion } from "@/lib/region";
import { useI18n, LOCALES, Locale } from "@/lib/i18n/context";
import { clearCart } from "@/lib/shop";

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTINENTS: Continent[] = ["Europe", "Americas", "Asia & Pacific", "Middle East & Africa", "Global"];

export default function RegionModal({ isOpen, onClose }: RegionModalProps) {
  const { country, countryCode, setCountry } = useRegion();
  const { locale, setLocale } = useI18n();

  const [selectedContinent, setSelectedContinent] = useState<Continent>(country.continent);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(countryCode);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);

  if (!isOpen) return null;

  const handleApply = () => {
    const isCountryChanging = selectedCountryCode !== countryCode;
    if (isCountryChanging) {
      clearCart();
      setCountry(selectedCountryCode);
    }
    if (selectedLocale !== locale) {
      setLocale(selectedLocale);
    }
    onClose();
  };

  const continentCountries = Object.values(COUNTRIES).filter(
    (c: CountryInfo) => c.continent === selectedContinent
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="region-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-divider bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Globe className="size-5" />
            </div>
            <div>
              <h2 id="region-modal-title" className="text-h3-m font-bold text-navy">
                Choose Location & Language
              </h2>
              <p className="text-caption text-mid">
                Select your delivery country, currency and preferred language.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-mid transition hover:bg-surface hover:text-navy"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 bg-amber-50/80 px-6 py-3.5 border-b border-amber-200/50 text-amber-900">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-caption leading-relaxed">
            Changing your delivery destination updates product pricing, regional currency, local customs & taxes, and will safely reset your current shopping bag.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Continent Navigation Tabs */}
          <div>
            <label className="block text-caption-m font-semibold uppercase tracking-wider text-mid mb-2.5">
              Region / Continent
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTINENTS.map((cont) => (
                <button
                  key={cont}
                  type="button"
                  onClick={() => setSelectedContinent(cont)}
                  className={`rounded-full px-4 py-1.5 text-caption font-semibold transition-all ${
                    selectedContinent === cont
                      ? "bg-navy text-white shadow-sm"
                      : "bg-surface text-navy hover:bg-navy/10"
                  }`}
                >
                  {cont}
                </button>
              ))}
            </div>
          </div>

          {/* Country Selection Grid */}
          <div>
            <label className="block text-caption-m font-semibold uppercase tracking-wider text-mid mb-2.5">
              Country / Destination ({continentCountries.length})
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {continentCountries.map((c) => {
                const isSelected = selectedCountryCode === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCountryCode(c.code)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-navy bg-navy/5 font-semibold text-navy shadow-sm ring-1 ring-navy"
                        : "border-divider bg-white text-navy hover:border-mid/40 hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div className="truncate">
                        <div className="text-small truncate">{c.name}</div>
                        <div className="text-[11px] text-mid">
                          {c.currency} ({c.symbol}) {!c.isEcommerce && "· Catalog only*"}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="size-4 shrink-0 text-navy" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="border-t border-divider pt-5">
            <label className="block text-caption-m font-semibold uppercase tracking-wider text-mid mb-2.5">
              Language (10 Locales Available)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {(Object.keys(LOCALES) as Locale[]).map((locKey) => {
                const locInfo = LOCALES[locKey];
                const isSelected = selectedLocale === locKey;
                return (
                  <button
                    key={locKey}
                    type="button"
                    onClick={() => setSelectedLocale(locKey)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-small transition-all ${
                      isSelected
                        ? "border-navy bg-navy text-white shadow-sm font-semibold"
                        : "border-divider bg-white text-navy hover:border-mid/40 hover:bg-surface"
                    }`}
                  >
                    <span className="text-base">{locInfo.flag}</span>
                    <span className="truncate">{locInfo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between border-t border-divider bg-surface/50 px-6 py-4">
          <div className="text-caption text-mid hidden sm:block">
            Current: <strong className="text-navy">{country.name}</strong> ({country.currency}) ·{" "}
            <strong className="text-navy">{LOCALES[locale]?.label}</strong>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-small font-medium text-navy hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-small font-semibold text-white shadow-md hover:bg-navy-deep active:scale-95 transition-all"
            >
              <span>Confirm & Save</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}