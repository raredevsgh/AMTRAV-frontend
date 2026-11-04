"use client";

// Steps the site's theme through System, Light and Dark. The choice is kept in this browser;
// the script in the root layout applies it (and follows the system when it's "system").
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { messagesFor } from "@/lib/i18n";
import { useOptionalI18n } from "@/lib/i18n/client";

export type Theme = "system" | "light" | "dark";
const KEY = "amortrav_theme";
export const themes: Theme[] = ["system", "light", "dark"];
export const themeIcons = { system: Monitor, light: Sun, dark: Moon } as const;

/** The saved theme, and a setter that saves and applies it. */
export function useTheme() {
  // Read after mounting: the server can't know the browser's choice.
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with browser storage once on mount
    if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
  }, []);
  function choose(value: Theme) {
    setTheme(value);
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new Event("amortrav-theme"));
  }
  return [theme, choose] as const;
}

export function ThemeSwitcher() {
  // English where the page has no language (the console and sign-in pages).
  const m = useOptionalI18n()?.m ?? messagesFor("en");
  const [theme, choose] = useTheme();
  const Icon = themeIcons[theme];
  const label = { system: m.theme.system, light: m.theme.light, dark: m.theme.dark }[
    theme
  ];
  return (
    <button
      type="button"
      className="theme-switcher"
      onClick={() => choose(themes[(themes.indexOf(theme) + 1) % themes.length])}
      aria-label={`${m.theme.label}: ${label}`}
      title={`${m.theme.label}: ${label}`}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
