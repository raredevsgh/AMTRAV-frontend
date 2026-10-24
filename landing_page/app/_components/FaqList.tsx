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
                className="flex w-full items-start justify-between gap-2 rounded-md text-left text-h3-m font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky xl:text-h3"
              >
                <span>{question}</span>
                <span aria-hidden>{isOpen ? "−" : "+"}</span>
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
