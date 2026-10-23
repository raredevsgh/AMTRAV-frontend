"use client";

import { useState } from "react";

// Figma "FAQ list" (2022:1228) of "Accordion" rows (2019:453): only one item is open at a time,
// and clicking the open item closes it.
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

  return (
    <div className={`flex w-full flex-col gap-3 xl:gap-4 ${className}`}>
      {items.map(({ question, answer }, i) => {
        const isOpen = open === i;
        return (
          <div
            key={question}
            className={`flex flex-col gap-3 rounded-2xl p-5 xl:px-6 xl:py-5 ${isOpen ? "bg-navy text-surface" : "bg-blue-pale text-navy"}`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-2 text-left text-h3-m font-semibold xl:text-h3"
              >
                <span>{question}</span>
                <span aria-hidden>{isOpen ? "−" : "+"}</span>
              </button>
            </h3>
            {isOpen && <p className="text-body-m xl:text-body">{answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
