"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n, LOCALES, type Locale } from "@/lib/i18n/context";

export default function LanguageSwitcher({
  className = "",
  isNegative = false,
  direction = "down",
}: {
  className?: string;
  isNegative?: boolean;
  direction?: "down" | "up";
}) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LOCALES[locale] || LOCALES.en;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select website language"
        className={`flex h-9 items-center gap-1.5 rounded-full px-2.5 sm:px-3 text-caption font-semibold backdrop-blur-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky active:scale-95 ${
          isNegative
            ? "border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 shadow-xs"
            : "border border-line bg-surface/80 text-navy hover:border-sky hover:bg-surface shadow-xs"
        }`}
      >
        <Globe className={`size-3.5 transition-colors ${isNegative ? "text-white/80" : "text-mid"}`} />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline font-semibold">{current.label}</span>
        <ChevronDown
          className={`size-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${
            isNegative ? "text-white/80" : "text-mid"
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          className={`absolute right-0 z-50 ${
            direction === "up" ? "bottom-full mb-2 origin-bottom-right" : "top-full mt-1.5 origin-top-right"
          } w-60 rounded-2xl border border-divider bg-white p-2.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150 text-navy`}
        >
          {/* Header */}
          <div className="border-b border-divider pb-2 px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-mid">
              Select Language
            </span>
            <span className="text-[10px] font-mono text-mid bg-surface px-1.5 py-0.5 rounded-full border border-divider">
              {Object.keys(LOCALES).length} Locales
            </span>
          </div>

          {/* Language List - Clean, scrollable, ordered */}
          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-0.5">
            {(Object.keys(LOCALES) as Locale[]).map((loc) => {
              const item = LOCALES[loc];
              const isSelected = loc === locale;
              return (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLocale(loc);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-caption transition-colors ${
                    isSelected
                      ? "bg-navy text-white font-semibold shadow-xs"
                      : "text-navy hover:bg-surface"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <span>{item.label}</span>
                  </span>
                  {isSelected && <Check className="size-3.5 text-sky" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
