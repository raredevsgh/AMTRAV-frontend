import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import BrandSignupForm from "./BrandSignupForm";
import BrandDashboardInteractive from "../_components/BrandDashboardInteractive";

export const metadata: Metadata = {
  title: "For brands",
  description:
    "Ship smart bags without building the cloud. We handle the phone app, bag tracking, customer setup, and lifetime audit trails so you can focus on making great luggage.",
  alternates: {
    canonical: "/for-brands",
  },
  openGraph: {
    title: "For brands · AMORTRAV",
    description:
      "Ship smart bags without building the cloud. Manufacturer console, bag claims, and customer app out of the box.",
    url: "/for-brands",
  },
};

const POINTS = [
  "Buyers connect their phone in seconds using a simple card in the box",
  "Turn off lost or stolen bags in one click and see the full history",
  "Store user guides, warranties, and papers right in the app",
];

const TOOLS = [
  {
    name: "Add new bags",
    desc: "Enter bag serial numbers one by one or upload a whole batch at once.",
    status: "In progress",
    tag: "bg-[#EAF0FF] text-[#1F3FBF]",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8",
  },
  {
    name: "Cards in the box",
    desc: "Create the one-time setup codes printed inside each bag's packaging.",
    status: "In progress",
    tag: "bg-[#EAF0FF] text-[#1F3FBF]",
    icon: "M4 7h16v10H4zM8 11h5M8 14h3",
  },
  {
    name: "Turn off lost bags",
    desc: "Deactivate any bag that gets lost, stolen, or taken out of service.",
    status: "In progress",
    tag: "bg-[#EAF0FF] text-[#1F3FBF]",
    icon: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  },
  {
    name: "Manuals and papers",
    desc: "Keep user guides, test papers, and warranty files safe in one spot.",
    status: "In progress",
    tag: "bg-[#EAF0FF] text-[#1F3FBF]",
    icon: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5",
  },
  {
    name: "Live map and battery",
    desc: "See where your bags are around the world and check their battery levels.",
    status: "Planned",
    tag: "bg-[#F1F2F5] text-[#4A5266]",
    icon: "M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21zM12 7v5",
  },
  {
    name: "Customer help",
    desc: "Help buyers with pairing questions and handle device issues quickly.",
    status: "Planned",
    tag: "bg-[#F1F2F5] text-[#4A5266]",
    icon: "M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20a2 2 0 0 0 4 0",
  },
];

const ONBOARDING = [
  {
    num: "01",
    title: "Create your account",
    desc: "We set up your brand account and send you sample test parts.",
    circleBg: "bg-white text-[#0B1B3D]",
  },
  {
    num: "02",
    title: "Test with your phone",
    desc: "Connect a sample bag with our app and see how easy it is.",
    circleBg: "bg-white text-[#0B1B3D]",
  },
  {
    num: "03",
    title: "Start selling",
    desc: "Put the card in the box and ship smart luggage to your buyers.",
    circleBg: "bg-[#B9CBFF] text-[#0B1B3D]",
  },
];

const CONSOLE_URL = "http://localhost:3001";

export default function ForBrandsPage() {
  return (
    <div id="brands-page" className="flex flex-col font-sans -mt-4 xl:-mt-5">
      {/* ── Section 1: Hero (Light Gray #F6F7F9) ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#E4E7EE] bg-[#F6F7F9] py-16 sm:py-20 xl:py-24">
        <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 xl:grid-cols-2 xl:gap-14">
            {/* Left */}
            <div className="flex flex-col items-start gap-6">
              <span className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#2A4BD7] uppercase">
                <span aria-hidden="true" className="h-[2px] w-6 bg-[#2A4BD7]" />
                For luggage makers
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-[#0B1B3D] sm:text-5xl xl:text-[56px] xl:leading-[1.08]">
                Your bags, smart.<br />Your team, in control.
              </h1>
              <p className="max-w-lg text-base font-normal leading-relaxed text-[#4A5266] sm:text-lg">
                We handle the phone app, bag tracking, and customer setup. You focus on making great luggage.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#signup"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0B1B3D] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-navy-deep sm:h-[50px] sm:px-7 sm:text-base"
                >
                  Join waitlist
                </a>
                <a
                  href={CONSOLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 text-[15px] font-semibold text-[#0B1B3D] transition-colors duration-200 hover:text-[#2A4BD7] sm:h-[50px] sm:text-base"
                >
                  See the dashboard
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Interactive Console Window Mockup */}
            <BrandDashboardInteractive />
          </div>
        </div>
      </section>

      {/* ── Section 2: Ship Smart Bags (White #FFFFFF) ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#E4E7EE] bg-white py-16 sm:py-20 xl:py-24">
        <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
          <div className="grid grid-cols-1 items-center gap-12 xl:grid-cols-2 xl:gap-16">
            {/* Left */}
            <div className="flex flex-col items-start gap-6">
              <h2 className="text-3xl font-semibold tracking-tight text-[#0B1B3D] sm:text-4xl xl:text-[42px] xl:leading-[1.1]">
                Sell smart luggage without the tech headaches.
              </h2>
              <ul className="w-full border-t border-[#E4E7EE]">
                {POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-3.5 border-b border-[#E4E7EE] py-4 text-sm font-normal text-[#0B1B3D] sm:text-base"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2A4BD7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0B1B3D] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-navy-deep sm:h-[50px] sm:px-7 sm:text-base"
              >
                Join waitlist
              </a>
            </div>

            {/* Right: Floating Claim Cards */}
            <div
              aria-hidden="true"
              className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#EEF1F7] p-6"
            >
              <div
                className="animate-float absolute aspect-[1.586] w-[60%] rounded-2xl bg-[#22366A]"
                style={{ "--r": "-10deg" } as CSSProperties}
              />
              <div
                className="animate-float absolute aspect-[1.586] w-[60%] rounded-2xl bg-[#16295A]"
                style={{ "--r": "-4deg", animationDelay: "-1.4s" } as CSSProperties}
              />
              <div
                className="animate-float relative flex aspect-[1.586] w-[60%] flex-col justify-between rounded-2xl bg-[#0B1B3D] p-5 text-white shadow-2xl"
                style={{ "--r": "3deg", animationDelay: "-2.8s" } as CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <svg viewBox="0 0 28 28" className="size-6 sm:size-7" aria-hidden="true">
                    <path d="M3 24 L14 4 L25 24 H19 L14 14 L9 24 Z" fill="#FFFFFF" />
                    <circle cx="21.5" cy="6.5" r="2.5" fill="#B9CBFF" />
                  </svg>
                  <span className="text-xs font-medium text-[#A9B6D3]">Setup card</span>
                </div>
                <div className="mt-auto flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-[#A9B6D3]">Bag number</span>
                  <span className="font-mono text-sm font-medium tracking-wider sm:text-base">
                    AMT-CI70-0012B7
                  </span>
                </div>
                <span
                  className="mt-2 h-3.5 rounded bg-[repeating-linear-gradient(135deg,#2B4479_0_6px,#1A2F60_6px_12px)]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: What's in the console (White #FFFFFF) ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#E4E7EE] bg-white py-16 sm:py-20 xl:py-24">
        <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
          <div className="flex flex-col gap-10 xl:gap-12">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="text-3xl font-semibold tracking-tight text-[#0B1B3D] sm:text-4xl xl:text-[42px]">
                What your team can do inside
              </h2>
              <p className="max-w-md text-base font-normal leading-relaxed text-[#4A5266]">
                A simple dashboard for your team to manage every bag you make.
              </p>
            </div>
            <div className="grid grid-cols-1 border-t border-l border-[#DCE1EA] md:grid-cols-2 xl:grid-cols-3">
              {TOOLS.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col gap-3 border-r border-b border-[#DCE1EA] p-8 transition-colors duration-200 hover:bg-[#F9FAFC]"
                >
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center rounded-xl bg-[#EEF1F7] text-[#0B1B3D]"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={t.icon} />
                      </svg>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.tag}`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[#0B1B3D]">{t.name}</h3>
                  <p className="text-sm font-normal leading-relaxed text-[#4A5266]">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Timeline (Deep Navy #0B1B3D) ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#0B1B3D] py-20 text-white sm:py-24 xl:py-28">
        <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
          <div className="flex flex-col gap-12 xl:gap-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-[42px]">
              From your workshop to the airport.
            </h2>
            <div className="relative">
              <div
                className="absolute top-5 right-10 left-10 hidden h-[2px] border-t-2 border-dashed border-[#B9CBFF]/30 xl:block"
                aria-hidden="true"
              />
              <div
                className="absolute top-6 bottom-6 left-5 block w-[2px] border-l-2 border-dashed border-[#B9CBFF]/30 xl:hidden"
                aria-hidden="true"
              />
              <ol className="relative flex flex-col gap-8 xl:grid xl:grid-cols-3 xl:gap-10">
                {ONBOARDING.map((step) => (
                  <li key={step.num} className="relative flex items-start gap-4 xl:flex-col xl:gap-5">
                    <span
                      aria-hidden="true"
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full font-semibold shadow-[0_0_0_8px_#0B1B3D] ${step.circleBg}`}
                    >
                      {step.num}
                    </span>
                    <div className="flex flex-col gap-2 pt-1 xl:pt-0">
                      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                      <p className="text-base font-normal leading-relaxed text-[#B8C4E0]">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Brand CTA (White #FFFFFF) ── */}
      <section
        id="signup"
        className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#E4E7EE] bg-white py-20 text-center sm:py-28"
      >
        <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
          <div className="flex flex-col items-center gap-5">
            {/* Logo on top, like in the CTA */}
            <div className="flex justify-center pb-1">
              <Image
                src="/img/cta-mark-navy.png"
                alt="AMORTRAV"
                width={56}
                height={45}
                className="h-11 w-auto object-contain"
              />
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-[#0B1B3D] sm:text-4xl xl:text-[44px]">
              Ready when your flight is.
            </h2>
            <p className="max-w-lg text-base font-normal text-[#4A5266] sm:text-lg">
              AMORTRAV is in development. Leave your email and we will write when it is ready to order.
            </p>

            {/* Email form (Image 3) instead of buttons (Image 4) */}
            <BrandSignupForm />
          </div>
        </div>
      </section>
    </div>
  );
}
