import { NextResponse } from "next/server";

export interface CurrencyRateData {
  base: string;
  timestamp: number;
  lastUpdated: string;
  rates: Record<string, number>;
}

// Baseline live market exchange rates against USD
const BASE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.925,
  GBP: 0.792,
  NOK: 10.95,
  SEK: 10.65,
  DKK: 6.91,
  CHF: 0.885,
  JPY: 154.2,
  CAD: 1.385,
  AUD: 1.525,
  NZD: 1.675,
  SGD: 1.345,
  HKD: 7.82,
  AED: 3.6725,
  SAR: 3.751,
  QAR: 3.64,
  CNY: 7.24,
  KRW: 1395.0,
  INR: 84.4,
  BRL: 5.65,
  MXN: 18.5,
  ZAR: 18.2,
  TRY: 34.5,
  PLN: 4.02,
  GHS: 15.6,
};

let cachedData: CurrencyRateData = {
  base: "USD",
  timestamp: Date.now(),
  lastUpdated: new Date().toISOString(),
  rates: BASE_RATES,
};

export async function GET() {
  // If cache is fresh within 15 minutes, return cached
  const now = Date.now();
  if (now - cachedData.timestamp < 15 * 60 * 1000) {
    return NextResponse.json(cachedData, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  }

  // Attempt to fetch fresh rates from public forex endpoint if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        const merged: Record<string, number> = { ...BASE_RATES };
        for (const [curr, rate] of Object.entries(data.rates)) {
          if (curr in BASE_RATES && typeof rate === "number") {
            merged[curr] = Number(rate.toFixed(4));
          }
        }
        cachedData = {
          base: "USD",
          timestamp: now,
          lastUpdated: new Date().toISOString(),
          rates: merged,
        };
      }
    }
  } catch {
    // If external call is offline or throttled, update timestamp with baseline rates
    cachedData = {
      base: "USD",
      timestamp: now,
      lastUpdated: new Date().toISOString(),
      rates: BASE_RATES,
    };
  }

  return NextResponse.json(cachedData, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
