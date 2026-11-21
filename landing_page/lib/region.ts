"use client";

import { useSyncExternalStore } from "react";

export type Continent = "Europe" | "Americas" | "Asia & Pacific" | "Middle East & Africa" | "Global";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rateVsUsd: number;
  locale: string;
  isZeroDecimal?: boolean;
}

export interface CountryInfo {
  code: string;
  name: string;
  continent: Continent;
  currency: string;
  symbol: string;
  rateVsUsd: number;
  isEcommerce: boolean;
  flag: string;
  phonePrefix: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", rateVsUsd: 10.95, locale: "nb-NO" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rateVsUsd: 0.925, locale: "de-DE" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rateVsUsd: 0.792, locale: "en-GB" },
  USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rateVsUsd: 1.0, locale: "en-US" },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", rateVsUsd: 0.885, locale: "de-CH" },
  SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", rateVsUsd: 10.65, locale: "sv-SE" },
  DKK: { code: "DKK", name: "Danish Krone", symbol: "kr.", flag: "🇩🇰", rateVsUsd: 6.91, locale: "da-DK" },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rateVsUsd: 154.2, locale: "ja-JP", isZeroDecimal: true },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦", rateVsUsd: 1.385, locale: "en-CA" },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rateVsUsd: 1.525, locale: "en-AU" },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rateVsUsd: 1.345, locale: "en-SG" },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", rateVsUsd: 7.82, locale: "zh-HK" },
  AED: { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", rateVsUsd: 3.6725, locale: "en-AE" },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", rateVsUsd: 3.751, locale: "en-SA" },
  QAR: { code: "QAR", name: "Qatari Riyal", symbol: "QAR", flag: "🇶🇦", rateVsUsd: 3.64, locale: "en-QA" },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", rateVsUsd: 7.24, locale: "zh-CN" },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", rateVsUsd: 1395.0, locale: "ko-KR", isZeroDecimal: true },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rateVsUsd: 84.4, locale: "en-IN" },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", rateVsUsd: 5.65, locale: "pt-BR" },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", rateVsUsd: 18.5, locale: "es-MX" },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rateVsUsd: 18.2, locale: "en-ZA" },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", rateVsUsd: 34.5, locale: "tr-TR" },
  PLN: { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", rateVsUsd: 4.02, locale: "pl-PL" },
  NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", rateVsUsd: 1.675, locale: "en-NZ" },
};

export const COUNTRIES: Record<string, CountryInfo> = {
  // Europe
  NO: { code: "NO", name: "Norway", continent: "Europe", currency: "NOK", symbol: "kr", rateVsUsd: 10.95, isEcommerce: true, flag: "🇳🇴", phonePrefix: "+47" },
  GB: { code: "GB", name: "United Kingdom", continent: "Europe", currency: "GBP", symbol: "£", rateVsUsd: 0.792, isEcommerce: true, flag: "🇬🇧", phonePrefix: "+44" },
  DE: { code: "DE", name: "Germany", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.925, isEcommerce: true, flag: "🇩🇪", phonePrefix: "+49" },
  FR: { code: "FR", name: "France", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.925, isEcommerce: true, flag: "🇫🇷", phonePrefix: "+33" },
  IT: { code: "IT", name: "Italy", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.925, isEcommerce: true, flag: "🇮🇹", phonePrefix: "+39" },
  ES: { code: "ES", name: "Spain", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.925, isEcommerce: true, flag: "🇪🇸", phonePrefix: "+34" },
  CH: { code: "CH", name: "Switzerland", continent: "Europe", currency: "CHF", symbol: "CHF", rateVsUsd: 0.885, isEcommerce: true, flag: "🇨🇭", phonePrefix: "+41" },
  NL: { code: "NL", name: "Netherlands", continent: "Europe", currency: "EUR", symbol: "€", rateVsUsd: 0.925, isEcommerce: true, flag: "🇳🇱", phonePrefix: "+31" },
  SE: { code: "SE", name: "Sweden", continent: "Europe", currency: "SEK", symbol: "kr", rateVsUsd: 10.65, isEcommerce: true, flag: "🇸🇪", phonePrefix: "+46" },
  DK: { code: "DK", name: "Denmark", continent: "Europe", currency: "DKK", symbol: "kr.", rateVsUsd: 6.91, isEcommerce: true, flag: "🇩🇰", phonePrefix: "+45" },

  // Americas
  US: { code: "US", name: "United States", continent: "Americas", currency: "USD", symbol: "$", rateVsUsd: 1.0, isEcommerce: true, flag: "🇺🇸", phonePrefix: "+1" },
  CA: { code: "CA", name: "Canada", continent: "Americas", currency: "CAD", symbol: "CA$", rateVsUsd: 1.385, isEcommerce: true, flag: "🇨🇦", phonePrefix: "+1" },
  BR: { code: "BR", name: "Brazil", continent: "Americas", currency: "BRL", symbol: "R$", rateVsUsd: 5.65, isEcommerce: true, flag: "🇧🇷", phonePrefix: "+55" },
  MX: { code: "MX", name: "Mexico", continent: "Americas", currency: "MXN", symbol: "MX$", rateVsUsd: 18.5, isEcommerce: true, flag: "🇲🇽", phonePrefix: "+52" },

  // Asia & Pacific
  JP: { code: "JP", name: "Japan", continent: "Asia & Pacific", currency: "JPY", symbol: "¥", rateVsUsd: 154.2, isEcommerce: true, flag: "🇯🇵", phonePrefix: "+81" },
  CN: { code: "CN", name: "China", continent: "Asia & Pacific", currency: "CNY", symbol: "¥", rateVsUsd: 7.24, isEcommerce: true, flag: "🇨🇳", phonePrefix: "+86" },
  KR: { code: "KR", name: "South Korea", continent: "Asia & Pacific", currency: "KRW", symbol: "₩", rateVsUsd: 1395.0, isEcommerce: true, flag: "🇰🇷", phonePrefix: "+82" },
  HK: { code: "HK", name: "Hong Kong", continent: "Asia & Pacific", currency: "HKD", symbol: "HK$", rateVsUsd: 7.82, isEcommerce: true, flag: "🇭🇰", phonePrefix: "+852" },
  SG: { code: "SG", name: "Singapore", continent: "Asia & Pacific", currency: "SGD", symbol: "S$", rateVsUsd: 1.345, isEcommerce: true, flag: "🇸🇬", phonePrefix: "+65" },
  AU: { code: "AU", name: "Australia", continent: "Asia & Pacific", currency: "AUD", symbol: "A$", rateVsUsd: 1.525, isEcommerce: true, flag: "🇦🇺", phonePrefix: "+61" },
  NZ: { code: "NZ", name: "New Zealand", continent: "Asia & Pacific", currency: "NZD", symbol: "NZ$", rateVsUsd: 1.675, isEcommerce: true, flag: "🇳🇿", phonePrefix: "+64" },
  IN: { code: "IN", name: "India", continent: "Asia & Pacific", currency: "INR", symbol: "₹", rateVsUsd: 84.4, isEcommerce: true, flag: "🇮🇳", phonePrefix: "+91" },

  // Middle East & Africa
  AE: { code: "AE", name: "United Arab Emirates", continent: "Middle East & Africa", currency: "AED", symbol: "AED", rateVsUsd: 3.6725, isEcommerce: true, flag: "🇦🇪", phonePrefix: "+971" },
  SA: { code: "SA", name: "Saudi Arabia", continent: "Middle East & Africa", currency: "SAR", symbol: "SAR", rateVsUsd: 3.751, isEcommerce: true, flag: "🇸🇦", phonePrefix: "+966" },
  QA: { code: "QA", name: "Qatar", continent: "Middle East & Africa", currency: "QAR", symbol: "QAR", rateVsUsd: 3.64, isEcommerce: true, flag: "🇶🇦", phonePrefix: "+974" },
  GH: { code: "GH", name: "Ghana", continent: "Middle East & Africa", currency: "GHS", symbol: "GH₵", rateVsUsd: 15.6, isEcommerce: true, flag: "🇬🇭", phonePrefix: "+233" },
  ZA: { code: "ZA", name: "South Africa", continent: "Middle East & Africa", currency: "ZAR", symbol: "R", rateVsUsd: 18.2, isEcommerce: true, flag: "🇿🇦", phonePrefix: "+27" },
  TR: { code: "TR", name: "Turkey", continent: "Europe", currency: "TRY", symbol: "₺", rateVsUsd: 34.5, isEcommerce: true, flag: "🇹🇷", phonePrefix: "+90" },
  PL: { code: "PL", name: "Poland", continent: "Europe", currency: "PLN", symbol: "zł", rateVsUsd: 4.02, isEcommerce: true, flag: "🇵🇱", phonePrefix: "+48" },

  // Global / Other
  WW: { code: "WW", name: "International (*)", continent: "Global", currency: "USD", symbol: "$", rateVsUsd: 1.0, isEcommerce: false, flag: "🌐", phonePrefix: "+1" },
};

const COUNTRY_KEY = "amortrav.country";
const CURRENCY_KEY = "amortrav.currency";
const listeners = new Set<() => void>();

let cachedCountry: string = "NO";
let cachedCurrency: string = "NOK";
let dynamicRates: Record<string, number> = {};
let lastRatesFetch: number = 0;

function getSnapshot(): string {
  if (typeof window === "undefined") return "NO:NOK";
  try {
    const savedCountry = localStorage.getItem(COUNTRY_KEY);
    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    if (savedCountry && savedCountry in COUNTRIES) {
      cachedCountry = savedCountry;
    }
    if (savedCurrency && savedCurrency in CURRENCIES) {
      cachedCurrency = savedCurrency;
    } else if (savedCountry && COUNTRIES[savedCountry]) {
      cachedCurrency = COUNTRIES[savedCountry].currency;
    }
  } catch {
    // Ignore
  }
  return `${cachedCountry}:${cachedCurrency}`;
}

function getServerSnapshot(): string {
  return "NO:NOK";
}

function subscribeRegion(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setCountryPreference(countryCode: string) {
  if (!(countryCode in COUNTRIES)) return;
  cachedCountry = countryCode;
  const autoCurrency = COUNTRIES[countryCode].currency;
  if (autoCurrency && autoCurrency in CURRENCIES) {
    cachedCurrency = autoCurrency;
  }
  try {
    localStorage.setItem(COUNTRY_KEY, countryCode);
    localStorage.setItem(CURRENCY_KEY, cachedCurrency);
    document.cookie = `NEXT_COUNTRY=${countryCode}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `NEXT_CURRENCY=${cachedCurrency}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore
  }
  listeners.forEach((l) => l());
}

export function setCurrencyPreference(currencyCode: string) {
  if (!(currencyCode in CURRENCIES)) return;
  cachedCurrency = currencyCode;
  try {
    localStorage.setItem(CURRENCY_KEY, currencyCode);
    document.cookie = `NEXT_CURRENCY=${currencyCode}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore
  }
  listeners.forEach((l) => l());
}

// Client-side background rate synchronizer
export async function syncLiveRates() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastRatesFetch < 10 * 60 * 1000) return; // 10 min throttle
  lastRatesFetch = now;

  try {
    const res = await fetch("/api/currency/rates");
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        dynamicRates = data.rates;
        listeners.forEach((l) => l());
      }
    }
  } catch {
    // Fall back to baseline
  }
}

export function useRegion() {
  const snapshot = useSyncExternalStore(subscribeRegion, getSnapshot, getServerSnapshot);
  const [countryCode, currencyCode] = snapshot.split(":");

  const country = COUNTRIES[countryCode] || COUNTRIES.NO;
  const currency = CURRENCIES[currencyCode] || CURRENCIES.NOK;

  const currentRate = dynamicRates[currency.code] ?? currency.rateVsUsd;

  /**
   * Real-time calculation: converts base USD (in minor units / cents) to active currency.
   */
  const convertPrice = (
    baseUsdMinor: number,
    targetCurrencyCode?: string
  ): { value: number; formatted: string; symbol: string; rate: number } => {
    const activeTarget = targetCurrencyCode && CURRENCIES[targetCurrencyCode]
      ? CURRENCIES[targetCurrencyCode]
      : currency;

    const rate = dynamicRates[activeTarget.code] ?? activeTarget.rateVsUsd;
    const rawConverted = (baseUsdMinor / 100) * rate;

    // Zero-decimal or clean retail rounding
    let roundedValue = rawConverted;
    if (activeTarget.isZeroDecimal) {
      roundedValue = Math.round(rawConverted / 100) * 100;
    } else if (["NOK", "SEK", "DKK"].includes(activeTarget.code)) {
      roundedValue = Math.round(rawConverted / 10) * 10;
    } else {
      roundedValue = Math.round(rawConverted);
    }

    const formatted = new Intl.NumberFormat(activeTarget.locale, {
      style: "currency",
      currency: activeTarget.code,
      maximumFractionDigits: 0,
    }).format(roundedValue);

    return {
      value: roundedValue,
      formatted,
      symbol: activeTarget.symbol,
      rate,
    };
  };

  /**
   * Direct string formatter for UI components with real-time currency conversion
   */
  const formatPrice = (baseUsdMinor: number, targetCurrencyCode?: string): string => {
    if (!country.isEcommerce) {
      return "In-Store Inquiry";
    }
    return convertPrice(baseUsdMinor, targetCurrencyCode).formatted;
  };

  return {
    country,
    countryCode,
    currency,
    currencyCode: currency.code,
    currencies: Object.values(CURRENCIES),
    countries: Object.values(COUNTRIES),
    rateVsUsd: currentRate,
    setCountry: setCountryPreference,
    setCurrency: setCurrencyPreference,
    convertPrice,
    formatPrice,
    isEcommerce: country.isEcommerce,
    syncLiveRates,
  };
}
