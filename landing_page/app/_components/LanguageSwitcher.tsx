"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n, LOCALES, type Locale } from "@/lib/i18n/context";
import { useRegion, COUNTRIES } from "@/lib/region";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const { country, countryCode, setCountry } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lang" | "region">("lang");
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
        aria-label="Select language and region"
        className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 text-caption font-medium text-navy backdrop-blur-sm transition-colors hover:border-sky hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky"
      >
        <Globe className="size-3.5 text-mid" />
        <span className="mr-0.5">{current.flag}</span>
        <span className="hidden sm:inline font-semibold">{current.label}</span>
        <span className="text-[11px] text-mid hidden md:inline">({country.currency})</span>
        <ChevronDown className={`size-3 text-mid transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Language and region options"
          className="absolute right-0 z-50 mt-1.5 w-60 origin-top-right rounded-2xl border border-line bg-white p-2 shadow-xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-surface p-1 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("lang")}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition-all ${
                activeTab === "lang" ? "bg-white text-navy shadow-xs" : "text-mid hover:text-navy"
              }`}
            >
              Language ({Object.keys(LOCALES).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("region")}
              className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition-all ${
                activeTab === "region" ? "bg-white text-navy shadow-xs" : "text-mid hover:text-navy"
              }`}
            >
              Market / Currency
            </button>
          </div>

          {activeTab === "lang" ? (
            /* Language List */
            <div className="max-h-60 overflow-y-auto space-y-0.5">
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
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-caption transition-colors ${
                      isSelected
                        ? "bg-blue-pale/70 font-semibold text-brand"
                        : "text-navy hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <Check className="size-3.5 text-brand" />}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Market / Currency List */
            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {Object.values(COUNTRIES).map((c) => {
                const isSelected = c.code === countryCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c.code);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-caption transition-colors ${
                      isSelected
                        ? "bg-blue-pale/70 font-semibold text-brand"
                        : "text-navy hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[11px] font-mono text-mid">{c.currency}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}