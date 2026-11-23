"use client";

import { useSyncExternalStore } from "react";

const WISHLIST_KEY = "amortrav.wishlist";
const EMPTY_WISHLIST: string[] = [];

const listeners = new Set<() => void>();
let cachedWishlist: string[] = EMPTY_WISHLIST;
let lastRawWishlist: string | null = null;

function getWishlistSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_WISHLIST;
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (raw === lastRawWishlist) {
      return cachedWishlist;
    }
    lastRawWishlist = raw;
    cachedWishlist = raw ? JSON.parse(raw) : EMPTY_WISHLIST;
    return cachedWishlist;
  } catch {
    return cachedWishlist;
  }
}

function getWishlistServerSnapshot(): string[] {
  return EMPTY_WISHLIST;
}

function subscribeWishlist(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function toggleWishlistItem(sku: string) {
  const current = getWishlistSnapshot();
  const exists = current.includes(sku);
  const updated = exists ? current.filter((s) => s !== sku) : [...current, sku];
  cachedWishlist = updated;
  lastRawWishlist = JSON.stringify(updated);
  try {
    localStorage.setItem(WISHLIST_KEY, lastRawWishlist);
  } catch {
    // Ignore
  }
  listeners.forEach((l) => l());
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getWishlistServerSnapshot);

  return {
    items,
    count: items.length,
    has: (sku: string) => items.includes(sku),
    toggle: toggleWishlistItem,
  };
}
