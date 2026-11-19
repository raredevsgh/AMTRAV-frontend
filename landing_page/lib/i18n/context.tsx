"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { en } from "./messages/en";
import { de } from "./messages/de";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { it } from "./messages/it";
import { ja } from "./messages/ja";
import { ko } from "./messages/ko";
import { no } from "./messages/no";
import { zhHans } from "./messages/zh-hans";
import { zhHant } from "./messages/zh-hant";
import { ar } from "./messages/ar";
import { pt } from "./messages/pt";
import { nl } from "./messages/nl";
import { sv } from "./messages/sv";
import { da } from "./messages/da";
import { fi } from "./messages/fi";
import { ru } from "./messages/ru";
import { hi } from "./messages/hi";
import { tr } from "./messages/tr";
import { pl } from "./messages/pl";

export type Locale =
  | "en"
  | "no"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "ja"
  | "ko"
  | "zh-hans"
  | "zh-hant"
  | "ar"
  | "pt"
  | "nl"
  | "sv"
  | "da"
  | "fi"
  | "ru"
  | "hi"
  | "tr"
  | "pl";

export const LOCALES: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  no: { label: "Norsk", flag: "🇳🇴" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  fr: { label: "Français", flag: "🇫🇷" },
  es: { label: "Español", flag: "🇪🇸" },
  it: { label: "Italiano", flag: "🇮🇹" },
  ja: { label: "日本語", flag: "🇯🇵" },
  ko: { label: "한국어", flag: "🇰🇷" },
  "zh-hans": { label: "简体中文", flag: "🇨🇳" },
  "zh-hant": { label: "繁體中文", flag: "🇹🇼" },
  ar: { label: "العربية", flag: "🇦🇪" },
  pt: { label: "Português", flag: "🇵🇹" },
  nl: { label: "Nederlands", flag: "🇳🇱" },
  sv: { label: "Svenska", flag: "🇸🇪" },
  da: { label: "Dansk", flag: "🇩🇰" },
  fi: { label: "Suomi", flag: "🇫🇮" },
  ru: { label: "Русский", flag: "🇷🇺" },
  hi: { label: "हिन्दी", flag: "🇮🇳" },
  tr: { label: "Türkçe", flag: "🇹🇷" },
  pl: { label: "Polski", flag: "🇵🇱" },
};

const MESSAGES: Record<Locale, typeof en> = {
  en,
  no,
  de,
  fr,
  es,
  it,
  ja,
  ko,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  ar,
  pt,
  nl,
  sv,
  da,
  fi,
  ru,
  hi,
  tr,
  pl,
};

const listeners = new Set<() => void>();
let currentLocale: Locale = "en";

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("amortrav.locale") as Locale;
    if (saved && saved in MESSAGES) {
      currentLocale = saved;
      if (document?.documentElement) {
        document.documentElement.lang = saved;
        document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      }
      return saved;
    }
  } catch {
    // Ignore
  }
  return currentLocale;
}

function getLocaleServerSnapshot(): Locale {
  return "en";
}

function subscribeLocale(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function updateLocale(newLocale: Locale) {
  currentLocale = newLocale;
  try {
    localStorage.setItem("amortrav.locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    if (document?.documentElement) {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
    }
  } catch {
    // Ignore
  }
  listeners.forEach((l) => l());
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: typeof en;
  t: (keyPath: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  messages: en,
  t: (_path, fallback) => fallback ?? _path,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleServerSnapshot);
  const currentMessages = MESSAGES[locale] ?? en;

  const t = (keyPath: string, fallback?: string, vars?: Record<string, string | number>): string => {
    const parts = keyPath.split(".");
    let val: unknown = currentMessages;
    for (const part of parts) {
      if (val && typeof val === "object" && part in (val as Record<string, unknown>)) {
        val = (val as Record<string, unknown>)[part];
      } else {
        val = undefined;
        break;
      }
    }
    let res = typeof val === "string" ? val : fallback ?? keyPath;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        res = res.replaceAll(`{${k}}`, String(v));
      }
    }
    return res;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: updateLocale, messages: currentMessages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
