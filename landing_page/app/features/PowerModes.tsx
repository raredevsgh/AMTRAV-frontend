"use client";

import { useState } from "react";

const MODES = ["Normal", "Economy", "Flight safe", "Backup", "Recovery sync"] as const;

// Figma "Power modes" (2045:1428): single-select picker. Tapping a chip selects it.
// The Features page shows "Flight safe" selected.
export default function PowerModes() {
  const [mode, setMode] = useState<(typeof MODES)[number]>("Flight safe");

  return (
    <div
      role="radiogroup"
      aria-label="Power mode preview"
      className="flex min-h-[156px] w-full shrink-0 flex-wrap content-center items-center gap-2 rounded-[20px] bg-surface p-4"
      onKeyDown={(event) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? MODES.length - 1 : (MODES.indexOf(mode) + (step ?? 0) + MODES.length) % MODES.length;
        setMode(MODES[next]);
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
      }}
    >
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          tabIndex={mode === m ? 0 : -1}
          onClick={() => setMode(m)}
          className={`flex h-8 items-center rounded-full px-3 text-caption-m whitespace-nowrap transition-[background-color,color,scale] duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-safe:active:scale-95 xl:h-9 xl:px-3.5 xl:text-caption ${
            mode === m ? "bg-brand text-white" : "bg-white text-mid hover:text-navy"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
