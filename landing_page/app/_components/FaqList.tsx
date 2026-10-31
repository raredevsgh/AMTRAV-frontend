"use client";

import { useId, useState } from "react";

// Figma "FAQ list" (2022:1228) of "Accordion" rows (2019:453): only one item is open at a time,
// and clicking the open item closes it. Answers stay in the DOM so their height can animate
// (grid rows 0fr → 1fr); a closed answer is inert, so it is skipped by keyboard and screen readers.
export default function FaqList({
  items,
  initialOpen = null,
  className = "xl:w-[765px]",
}: {
  items: readonly { question: string; answer: string }[];
  initialOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(initialOpen);
  const id = useId();

  return (
    <div data-stagger className={`flex w-full flex-col gap-3 xl:gap-4 ${className}`}>
      {items.map(({ question, answer }, i) => {
        const isOpen = open === i;
        return (
          <div
            key={question}
            data-reveal
            className={`flex flex-col rounded-2xl p-5 transition-colors duration-300 ease-out-soft xl:px-6 xl:py-5 ${isOpen ? "bg-navy text-surface" : "bg-blue-pale text-navy"}`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-start justify-between gap-3 rounded-md text-left text-h3-m font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky xl:text-h3"
              >
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">{question}</span>
                <span
                  aria-hidden
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out-soft ${
                    isOpen
                      ? "rotate-45 bg-white/20 text-white shadow-xs"
                      : "rotate-0 bg-white/70 text-navy shadow-xs group-hover:bg-white group-hover:scale-105"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="7" y1="2" x2="7" y2="12" />
                    <line x1="2" y1="7" x2="12" y2="7" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`${id}-${i}`}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out-soft motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="pt-3 text-body-m xl:text-body">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
