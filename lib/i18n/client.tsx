"use client";

// The current language for client components: its text, its BCP 47 tag for formatting, and
// `href` to keep links in the same language.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { localeTags, localize, type Locale } from "./config";
import { messagesFor, type Messages } from "./index";

const I18nContext = createContext<{
  locale: Locale;
  tag: string;
  m: Messages;
  href(path: string): string;
} | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  // The page's language on <html>, shared with the console: English again when it unmounts.
  useEffect(() => {
    document.documentElement.lang = localeTags[locale];
    return () => {
      document.documentElement.lang = "en";
    };
  }, [locale]);
  const value = useMemo(
    () => ({
      locale,
      tag: localeTags[locale],
      m: messagesFor(locale),
      href: (path: string) => localize(locale, path),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** The language context if this page has one (the console and sign-in pages don't). */
export const useOptionalI18n = () => useContext(I18nContext);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("I18nProvider missing");
  return context;
}
