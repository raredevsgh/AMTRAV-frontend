"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (notify: () => void) => {
  const preference = matchMedia(query);
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
};

export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => true);
}
