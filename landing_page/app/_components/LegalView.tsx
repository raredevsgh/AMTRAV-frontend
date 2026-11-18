import type { LegalDocument } from "@/lib/legal";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalView({ doc }: { doc: LegalDocument }) {
  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl bg-white p-6 shadow-card sm:p-10 xl:p-14">
      <Link
        href="/"
        className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-4 py-1.5 text-caption font-semibold text-navy transition-colors hover:bg-blue-pale hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        <span>Back to Home</span>
      </Link>

      <header className="border-b border-line pb-6">
        <span className="text-caption font-mono uppercase tracking-wider text-brand">Legal & Compliance</span>
        <h1 className="mt-1 text-display-m font-bold text-navy sm:text-h1">{doc.title}</h1>
        <p className="mt-3 text-body-m text-mid sm:text-body">{doc.intro}</p>
      </header>

      <div className="flex flex-col gap-8">
        {doc.sections.map((section, idx) => (
          <section key={idx} className="flex flex-col gap-3">
            <h2 className="text-h3-m font-bold text-navy sm:text-h3">{section.heading}</h2>
            {section.paragraphs?.map((p, pIdx) => (
              <p key={pIdx} className="text-body-m leading-relaxed text-mid">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="flex flex-col gap-2 pl-4">
                {section.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="list-disc text-body-m leading-relaxed text-mid">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
