"use client";

// Picks the site's language: remembers it (so links without a language land here next time)
// and moves to the same page in that language.
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  LOCALE_COOKIE,
  localeNames,
  locales,
  localize,
  type Locale,
} from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Remembers a language and opens the current page in it. */
export function useChooseLocale() {
  const router = useRouter();
  return (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const { pathname, search, hash } = window.location;
    router.push(localize(next, `${pathname}${search}${hash}`));
  };
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, m } = useI18n();
  const choose = useChooseLocale();
  return (
    <label className={`language-switcher ${className}`}>
      <Globe size={16} aria-hidden="true" />
      <span className="sr-only">{m.nav.language}</span>
      <select
        value={locale}
        onChange={(event) => choose(event.target.value as Locale)}
        aria-label={m.nav.language}
      >
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
