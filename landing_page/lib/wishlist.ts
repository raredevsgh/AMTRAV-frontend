"use client";

import { useSyncExternalStore } from "react";

const WISHLIST_KEY = "amortrav.wishlist";
const listeners = new Set<() => void>();
let cachedWishlist: string[] = [];

function getWishlistSnapshot(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (saved) {
      cachedWishlist = JSON.parse(saved);
      return cachedWishlist;
    }
  } catch {
    // Ignore
  }
  return cachedWishlist;
}

function getWishlistServerSnapshot(): string[] {
  return [];
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
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
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
