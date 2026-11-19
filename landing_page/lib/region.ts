"use client";

import { useSyncExternalStore } from "react";

export type Continent = "Europe" | "Americas" | "Asia & Pacific" | "Middle East & Africa" | "Global";

export interface CountryInfo {
  code: string;
  name: string;
  continent: Continent;
  currency: string;
  symbol: string;
  rateVsUsd: number;
  isEcommerce: boolean; // false for * catalog-only locales
  flag: string;
  phonePrefix: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  // Europe
  NO: { code: "NO", name: "Norway", continent: "Europe", currency: "NOK", symbol: "kr", rateVsUsd: 10.8, isEcommerce: true, flag: "🇳🇴", phonePrefix: "+47" },
  GB: { code: "GB", name: "United Kingdom", continent: "Europe", currency: "GBP", symbol: "£", rateVsUsd: 0.79, isEcommerce: true, flag: "🇬🇧", phonePrefix: "+44" },
  DE: { code: "DE", name: "Germany", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.92, isEcommerce: true, flag: "🇩🇪", phonePrefix: "+49" },
  FR: { code: "FR", name: "France", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.92, isEcommerce: true, flag: "🇫🇷", phonePrefix: "+33" },
  IT: { code: "IT", name: "Italy", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.92, isEcommerce: true, flag: "🇮🇹", phonePrefix: "+39" },
  ES: { code: "ES", name: "Spain", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.92, isEcommerce: true, flag: "🇪🇸", phonePrefix: "+34" },
  CH: { code: "CH", name: "Switzerland", continent: "Europe", currency: "CHF", symbol: "CHF", rateVsUsd: 0.88, isEcommerce: true, flag: "🇨🇭", phonePrefix: "+41" },
  NL: { code: "NL", name: "Netherlands", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.92, isEcommerce: true, flag: "🇳🇱", phonePrefix: "+31" },
  SE: { code: "SE", name: "Sweden", continent: "Europe", currency: "SEK", symbol: "kr", rateVsUsd: 10.6, isEcommerce: true, flag: "🇸🇪", phonePrefix: "+46" },

  // Americas
  US: { code: "US", name: "United States", continent: "Americas", currency: "USD", symbol: "$", rateVsUsd: 1.0, isEcommerce: true, flag: "🇺🇸", phonePrefix: "+1" },
  CA: { code: "CA", name: "Canada", continent: "Americas", currency: "CAD", symbol: "$", rateVsUsd: 1.38, isEcommerce: true, flag: "🇨🇦", phonePrefix: "+1" },
  BR: { code: "BR", name: "Brazil", continent: "Americas", currency: "BRL", symbol: "R$", rateVsUsd: 5.4, isEcommerce: true, flag: "🇧🇷", phonePrefix: "+55" },
  MX: { code: "MX", name: "Mexico", continent: "Americas", currency: "MXN", symbol: "$", rateVsUsd: 18.2, isEcommerce: true, flag: "🇲🇽", phonePrefix: "+52" },

  // Asia & Pacific
  JP: { code: "JP", name: "Japan", continent: "Asia & Pacific", currency: "JPY", symbol: "¥", rateVsUsd: 154.0, isEcommerce: true, flag: "🇯🇵", phonePrefix: "+81" },
  CN: { code: "CN", name: "China", continent: "Asia & Pacific", currency: "CNY", symbol: "¥", rateVsUsd: 7.25, isEcommerce: true, flag: "🇨🇳", phonePrefix: "+86" },
  KR: { code: "KR", name: "South Korea", continent: "Asia & Pacific", currency: "KRW", symbol: "₩", rateVsUsd: 1380.0, isEcommerce: true, flag: "🇰🇷", phonePrefix: "+82" },
  HK: { code: "HK", name: "Hong Kong", continent: "Asia & Pacific", currency: "HKD", symbol: "HK$", rateVsUsd: 7.8, isEcommerce: true, flag: "🇭🇰", phonePrefix: "+852" },
  SG: { code: "SG", name: "Singapore", continent: "Asia & Pacific", currency: "SGD", symbol: "S$", rateVsUsd: 1.34, isEcommerce: true, flag: "🇸🇬", phonePrefix: "+65" },
  AU: { code: "AU", name: "Australia", continent: "Asia & Pacific", currency: "AUD", symbol: "A$", rateVsUsd: 1.52, isEcommerce: true, flag: "🇦🇺", phonePrefix: "+61" },

  // Middle East & Africa
  AE: { code: "AE", name: "United Arab Emirates", continent: "Middle East & Africa", currency: "AED", symbol: "AED", rateVsUsd: 3.67, isEcommerce: true, flag: "🇦🇪", phonePrefix: "+971" },
  SA: { code: "SA", name: "Saudi Arabia", continent: "Middle East & Africa", currency: "SAR", symbol: "SAR", rateVsUsd: 3.75, isEcommerce: true, flag: "🇸🇦", phonePrefix: "+966" },
  GH: { code: "GH", name: "Ghana", continent: "Middle East & Africa", currency: "GHS", symbol: "GH₵", rateVsUsd: 15.5, isEcommerce: true, flag: "🇬🇭", phonePrefix: "+233" },
  ZA: { code: "ZA", name: "South Africa", continent: "Middle East & Africa", currency: "ZAR", symbol: "R", rateVsUsd: 18.0, isEcommerce: true, flag: "🇿🇦", phonePrefix: "+27" },

  // Global / Other
  WW: { code: "WW", name: "International (*)", continent: "Global", currency: "USD", symbol: "$", rateVsUsd: 1.0, isEcommerce: false, flag: "🌐", phonePrefix: "+1" },
};

const COUNTRY_KEY = "amortrav.country";
const listeners = new Set<() => void>();
let cachedCountry: string = "NO"; // Default to Norway storefront as requested

function getCountrySnapshot(): string {
  if (typeof window === "undefined") return "NO";
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    if (saved && saved in COUNTRIES) {
      cachedCountry = saved;
      return saved;
    }
  } catch {
    // Ignore
  }
  return cachedCountry;
}

function getCountryServerSnapshot(): string {
  return "NO";
}

function subscribeCountry(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setCountryPreference(countryCode: string) {
  if (!(countryCode in COUNTRIES)) return;
  cachedCountry = countryCode;
  try {
    localStorage.setItem(COUNTRY_KEY, countryCode);
    document.cookie = `NEXT_COUNTRY=${countryCode}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore
  }
  listeners.forEach((l) => l());
}

export function useRegion() {
  const countryCode = useSyncExternalStore(subscribeCountry, getCountrySnapshot, getCountryServerSnapshot);
  const country = COUNTRIES[countryCode] || COUNTRIES.NO;

  const formatPrice = (baseUsdMinor: number): string => {
    if (!country.isEcommerce) {
      return "In-Store Inquiry";
    }

    const converted = (baseUsdMinor / 100) * country.rateVsUsd;

    // Zero-decimal currencies or large denominations
    if (["JPY", "KRW", "NOK", "SEK"].includes(country.currency)) {
      // Rounded to clean luxury retail step (e.g. 9.000,00 kr or 14.900 kr)
      const rounded = Math.round(converted / 100) * 100;
      return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: country.currency,
        maximumFractionDigits: 0,
      }).format(rounded);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: country.currency,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  return {
    country,
    countryCode,
    setCountry: setCountryPreference,
    formatPrice,
    isEcommerce: country.isEcommerce,
  };
}
