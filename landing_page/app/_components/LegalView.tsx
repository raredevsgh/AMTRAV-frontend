"use client";

import React from "react";
import type { LegalDocument } from "@/lib/legal";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalView({ doc }: { doc: LegalDocument }) {
  return (
    <article className="flex w-full flex-col gap-8 rounded-3xl bg-white p-6 shadow-card sm:p-10 xl:rounded-[32px] xl:p-14">
      {/* Top Bar: Back to Home + Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-divider bg-surface px-4 py-1.5 text-caption font-semibold text-navy transition-colors hover:bg-blue-pale hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 text-caption text-mid">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span>/</span>
          <span className="text-mid">Legal & Compliance</span>
          <span>/</span>
          <span className="font-semibold text-navy">{doc.title}</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-divider pb-8 max-w-4xl">
        <span className="text-caption font-mono uppercase tracking-wider text-brand font-semibold">
          Legal & Compliance
        </span>
        <h1 className="mt-1 text-display-m font-bold text-navy sm:text-h1 tracking-tight">
          {doc.title}
        </h1>
        <p className="mt-4 text-body-m text-mid sm:text-body leading-relaxed">
          {doc.intro}
        </p>
      </header>

      {/* Sections with full-width balanced definition rows */}
      <div className="flex flex-col divide-y divide-divider/70">
        {doc.sections.map((section, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-4 py-8 first:pt-4 last:pb-4 md:grid-cols-12 md:gap-8 lg:gap-12 items-start"
          >
            <div className="md:col-span-4 lg:col-span-4">
              <h2 className="text-h3-m font-bold text-navy md:text-[22px] tracking-tight leading-snug">
                {section.heading}
              </h2>
            </div>
            <div className="md:col-span-8 lg:col-span-8 space-y-3.5">
              {section.paragraphs?.map((p, pIdx) => (
                <p key={pIdx} className="text-body-m text-mid leading-relaxed sm:text-body">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2.5 pt-1">
                  {section.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-start gap-3 text-body-m text-mid leading-relaxed sm:text-body"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-brand mt-2.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
