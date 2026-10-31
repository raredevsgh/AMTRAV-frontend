import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "../_components/PageHeader";

export const metadata: Metadata = {
  title: "For brands",
  description:
    "We're developing AMORTRAV TRACE to bring location intelligence, security features and connected services to compatible luggage and travel accessories.",
  alternates: {
    canonical: "/for-brands",
  },
  openGraph: {
    title: "For brands · AMORTRAV",
    description:
      "We're developing AMORTRAV TRACE to bring location intelligence, security features and connected services to compatible luggage and travel accessories.",
    url: "/for-brands",
  },
};

const CATEGORIES = [
  {
    name: "Suitcases",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="6" width="14" height="15" rx="3" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M7 21v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1" />
        <path d="M19 21v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1" />
        <line x1="9" y1="10" x2="9" y2="17" />
        <line x1="15" y1="10" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    name: "Cabin bags",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="7" width="12" height="13" rx="2.5" />
        <path d="M10 7V4.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5V7" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="15" cy="21" r="1" />
      </svg>
    ),
  },
  {
    name: "Backpacks",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9a6 6 0 0 1 12 0v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
        <path d="M9 5a3 3 0 0 1 6 0" />
        <path d="M9 13h6" />
        <path d="M8 17h8" />
      </svg>
    ),
  },
  {
    name: "Briefcases",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2.5" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="3" y1="13" x2="21" y2="13" />
        <circle cx="12" cy="13" r="1.5" />
      </svg>
    ),
  },
  {
    name: "Accessories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

export default function ForBrandsPage() {
  return (
    <div className="flex flex-col gap-4 xl:gap-5">
      {/* ── Section 1: Hero / PageHeader ── */}
      <PageHeader
        page="For brands"
        title={<>Your luggage.<br />A smarter future.</>}
        intro="We're developing AMORTRAV TRACE to bring location intelligence, security features and connected services to compatible luggage and travel accessories, including products from other brands."
        media="/img/page-header-media.png"
        mediaAlt="Travellers walking with luggage in an airport terminal"
        action={{ label: "Discuss a partnership", href: "mailto:partnerships@amortrav.com?subject=AMORTRAV%20Partnership%20Inquiry" }}
      />

      {/* ── Section 2: Bring more to the bags you make (Dark Card) ── */}
      <section className="relative flex flex-col gap-8 rounded-3xl bg-navy px-6 py-10 text-white xl:rounded-[32px] xl:px-14 xl:py-16">
        <div data-reveal className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-full bg-navy-deep px-4 text-caption font-medium text-blue-pale">
              For luggage makers
            </span>
            <h2 className="text-h1-m font-bold text-white xl:text-h1">
              Bring more to the<br />bags you make.
            </h2>
          </div>
          <p className="text-body-m text-blue-pale xl:max-w-[480px] xl:text-body xl:leading-relaxed">
            Your customers expect luggage that travels well. We&apos;re exploring how TRACE could help manufacturers offer more, with connected features designed around the needs of travellers.
          </p>
        </div>

        <div data-stagger className="grid grid-cols-1 gap-5 md:grid-cols-3 xl:gap-6">
          {/* Card 1: Location awareness */}
          <div data-reveal className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B2553]/70 p-6 transition-transform duration-300 hover:-translate-y-1 xl:p-8">
            <div className="flex flex-col items-start gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#163B7E] text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white">Location awareness</h3>
              <p className="text-sm leading-relaxed text-blue-pale">
                Help customers check where their luggage was last reported and when.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 rounded-full bg-[#0E2F68] px-3.5 py-1.5 text-xs font-mono text-blue-pale w-fit">
              <span className="size-1.5 rounded-full bg-sky" />
              <span>Last reported · Terminal B · 3 min ago</span>
            </div>
          </div>

          {/* Card 2: Security intelligence */}
          <div data-reveal className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B2553]/70 p-6 transition-transform duration-300 hover:-translate-y-1 xl:p-8">
            <div className="flex flex-col items-start gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#163B7E] text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white">Security intelligence</h3>
              <p className="text-sm leading-relaxed text-blue-pale">
                Build in support for movement alerts, tamper detection and recorded security events.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 rounded-full bg-[#0E2F68] px-3.5 py-1.5 text-xs font-mono text-blue-pale w-fit">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <span>Movement detected · 09:42</span>
            </div>
          </div>

          {/* Card 3: Connected ownership */}
          <div data-reveal className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0B2553]/70 p-6 transition-transform duration-300 hover:-translate-y-1 xl:p-8">
            <div className="flex flex-col items-start gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#163B7E] text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white">Connected ownership</h3>
              <p className="text-sm leading-relaxed text-blue-pale">
                Give customers a way to register their luggage and manage access through a companion app.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 rounded-full bg-[#0E2F68] px-3.5 py-1.5 text-xs font-mono text-blue-pale w-fit">
              <span className="size-1.5 rounded-full bg-sky" />
              <span>Registered to you · 2 people with access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: A platform built to grow with your products (White Card) ── */}
      <section className="flex flex-col gap-8 rounded-3xl bg-white px-6 py-10 shadow-card xl:rounded-[32px] xl:px-14 xl:py-16">
        <div data-reveal className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
          <h2 className="text-h1-m font-bold text-navy xl:max-w-[480px] xl:text-h1">
            A platform built to<br />grow with your products.
          </h2>
          <div className="flex flex-col gap-2 xl:max-w-[500px]">
            <p className="text-body-m text-mid xl:text-body leading-relaxed">
              TRACE is being designed for different kinds of travel gear, from suitcases and cabin bags to backpacks, briefcases and accessories.
            </p>
            <p className="text-body-m text-mid xl:text-body leading-relaxed">
              The goal is to make connected features available across compatible products, with shared technology behind them.
            </p>
          </div>
        </div>

        <div data-stagger className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4 pt-2">
          {CATEGORIES.map(({ name, icon }) => (
            <div
              key={name}
              data-reveal
              className="flex flex-col items-start gap-4 rounded-2xl bg-[#F4F6F9] p-5 xl:p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-navy shadow-xs">
                {icon}
              </div>
              <span className="text-base font-semibold text-navy">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Manage the details behind every bag (Pale Blue Card) ── */}
      <section className="flex flex-col gap-8 rounded-3xl bg-[#EAF0FA] px-6 py-10 xl:rounded-[32px] xl:px-14 xl:py-16">
        <div data-reveal className="flex flex-col items-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-brand shadow-xs">
              AMORTRAV Console
            </span>
            <span className="rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-mid shadow-xs">
              Proposed capabilities
            </span>
          </div>
          <h2 className="text-h1-m font-bold text-navy xl:text-h1 mt-2">
            Manage the details<br />behind every bag.
          </h2>
          <p className="text-body-m text-mid xl:text-body max-w-[560px] leading-relaxed">
            A management system is being developed to support the devices connected to the AMORTRAV ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-12 xl:gap-10 pt-2">
          {/* Left Column: 3 Capability Cards */}
          <div data-stagger className="flex flex-col gap-3.5 xl:col-span-6">
            {/* Capability 1 */}
            <div data-reveal className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-faint text-brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-navy">Device registration</h3>
                <p className="text-sm text-mid leading-relaxed">
                  Organise serial numbers, product identities and device records.
                </p>
              </div>
            </div>

            {/* Capability 2 */}
            <div data-reveal className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-faint text-brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-2-2-4 4 1.5 1.5L7 12l-5 5v5h5l5-5 1.5 1.5L15 17l1.5-1.5 2 2 4-4-1.5-1.5L22 10.5 21 9.5" />
                  <circle cx="15.5" cy="8.5" r="2.5" />
                </svg>
              </span>
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-navy">Ownership management</h3>
                <p className="text-sm text-mid leading-relaxed">
                  Support secure claiming, transfers and revocation.
                </p>
              </div>
            </div>

            {/* Capability 3 */}
            <div data-reveal className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-faint text-brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-navy">Device support</h3>
                <p className="text-sm text-mid leading-relaxed">
                  Access diagnostics, device status and relevant records as these capabilities become available.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Console Mockup Card */}
          <div data-reveal className="xl:col-span-6">
            <div className="rounded-2xl border border-white/60 bg-white p-6 shadow-xl xl:p-7">
              <div className="flex items-center justify-between border-b border-[#EAEFF7] pb-4">
                <span className="text-base font-semibold text-navy">Amortrav console</span>
                <span className="rounded-full bg-[#F1F3F7] px-2.5 py-0.5 text-xs font-medium text-mid">
                  Concept
                </span>
              </div>

              {/* Metric stats */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="rounded-xl border border-[#EAEFF7] bg-[#F8FAFC] p-3 text-center">
                  <p className="text-xs text-mid">Registered</p>
                  <p className="text-2xl font-bold text-navy mt-1">8</p>
                </div>
                <div className="rounded-xl border border-[#EAEFF7] bg-[#F8FAFC] p-3 text-center">
                  <p className="text-xs text-mid">Claimed</p>
                  <p className="text-2xl font-bold text-navy mt-1">4</p>
                </div>
                <div className="rounded-xl bg-[#0B1B3D] p-3 text-center text-white shadow-sm">
                  <p className="text-xs text-blue-pale">Unclaimed</p>
                  <p className="text-2xl font-bold text-white mt-1">3</p>
                </div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3 border border-[#EAEFF7]">
                  <span className="font-mono text-xs sm:text-sm font-medium text-navy">AMT-C055-087341</span>
                  <span className="rounded-full bg-[#EAF0FF] px-3 py-1 text-xs font-semibold text-[#1F3FBF]">
                    Claimed
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3 border border-[#EAEFF7]">
                  <span className="font-mono text-xs sm:text-sm font-medium text-navy">AMT-CD70-B11207</span>
                  <span className="rounded-full bg-[#F1F2F5] px-3 py-1 text-xs font-semibold text-[#4A5266]">
                    Unclaimed
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3 border border-[#EAEFF7]">
                  <span className="font-mono text-xs sm:text-sm font-medium text-navy">AMT-MA40-1A29C1</span>
                  <span className="rounded-full bg-[#FEECEC] px-3 py-1 text-xs font-semibold text-[#D9383A]">
                    Revoked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Have a product in mind? (Dark Banner CTA) ── */}
      <section id="partnership" className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center text-white xl:rounded-[32px] xl:px-14 xl:py-16">
        {/* Ambient Airplane graphic on the right */}
        <div className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 opacity-70 hidden xl:block">
          <Image src="/icons/plane.svg" alt="" width={32} height={32} className="rotate-45" />
        </div>
        {/* Subtle curved flight dotted path */}
        <svg viewBox="0 0 1000 300" className="pointer-events-none absolute inset-0 size-full opacity-20" fill="none">
          <path d="M 50 250 C 300 200, 700 100, 950 150" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
        </svg>

        <div data-reveal className="relative flex flex-col items-center gap-4">
          <Image
            src="/img/cta-mark.png"
            alt="AMORTRAV"
            width={48}
            height={40}
            className="brightness-0 invert object-contain"
          />
          <h2 className="text-h2-m font-bold text-white xl:text-h2">
            Have a product in mind?
          </h2>
          <p className="text-body-m text-blue-pale xl:text-body max-w-[560px] leading-relaxed">
            If you&apos;re building luggage or travel accessories and want to explore connected features, we&apos;d like to hear about it.
          </p>
          <div className="pt-2">
            <a
              href="mailto:partnerships@amortrav.com?subject=AMORTRAV%20Partnership%20Inquiry"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              Discuss a partnership
            </a>
          </div>
        </div>
      </section>

      {/* ── Disclaimer text ── */}
      <p className="text-center text-caption-m text-mid xl:text-caption max-w-[760px] mx-auto py-2 leading-relaxed">
        Third-party integrations are part of AMORTRAV&apos;s development plans. Compatibility and availability will depend on technical assessment and future product decisions.
      </p>
    </div>
  );
}
