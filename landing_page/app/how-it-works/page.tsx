import type { Metadata } from "next";
import Image from "next/image";
import FaqList from "../_components/FaqList";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Box to boarding in three steps. Every AMORTRAV bag ships with a claim card. Scratch, pair in seconds, and toggle flight-safe mode at the gate.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: "How it works · AMORTRAV",
    description:
      "Box to boarding in three steps. Every AMORTRAV bag ships with a claim card. Scratch, pair in seconds, and toggle flight-safe mode at the gate.",
    url: "/how-it-works",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "I lost the claim card. Now what?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Contact the brand you bought from. They can issue a fresh claim code for your serial from their console.",
      },
    },
    {
      "@type": "Question",
      name: "Can I pair one bag to two phones?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One owner per bag. Sign in with the same Google account on both phones and you're set.",
      },
    },
    {
      "@type": "Question",
      name: "I bought it secondhand.",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The previous owner needs to release it first. Transfers inside the app are coming soon.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work without the app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's still a great bag. The app just adds pairing, docs and alerts.",
      },
    },
  ],
};

// Answers come from each FAQ item's Answer property in the design (closed items hide them).
const FAQ = [
  {
    question: "I lost the claim card. Now what?",
    answer: "Contact the brand you bought from. They can issue a fresh claim code for your serial from their console.",
  },
  {
    question: "Can I pair one bag to two phones?",
    answer: "One owner per bag. Sign in with the same Google account on both phones and you're set.",
  },
  {
    question: "I bought it secondhand.",
    answer: "The previous owner needs to release it first. Transfers inside the app are coming soon.",
  },
  {
    question: "Does it work without the app?",
    answer: "It's still a great bag. The app just adds pairing, docs and alerts.",
  },
] as const;

function HowItWorksHero() {
  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 xl:pt-14 xl:pb-20">
      <div className="grid grid-cols-1 items-center gap-12 xl:grid-cols-2 xl:gap-14">
        {/* Left Column: Copy & Actions */}
        <div className="flex flex-col items-start gap-6">
          <span className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#2A4BD7] uppercase">
            <span aria-hidden="true" className="h-[2px] w-6 bg-[#2A4BD7]" />
            How it works
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-[#0B1B3D] sm:text-5xl xl:text-[56px] xl:leading-[1.05]">
            Box to boarding in three steps.
          </h1>
          <p className="max-w-lg text-base font-normal leading-relaxed text-[#4A5266] sm:text-lg">
            A card in the box and the app do the work. No Bluetooth menus, no pairing dance.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0B1B3D] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-navy-deep sm:h-[50px] sm:px-7 sm:text-base"
            >
              Get the app
            </a>
            <a
              href="#steps"
              className="inline-flex h-12 items-center gap-2 text-[15px] font-medium text-[#0B1B3D] transition-colors duration-200 hover:text-[#2A4BD7] sm:h-[50px] sm:text-base"
            >
              See the steps
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Column: Visual Mockup with Phone & Floating Claim Card */}
        <div
          role="img"
          aria-label="An Amortrav claim card next to a phone showing the Claim a bag screen"
          className="relative mx-auto aspect-[540/460] w-full max-w-[520px]"
        >
          {/* Animated Flight Path SVG */}
          <svg viewBox="0 0 540 480" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
            <path
              d="M-20 330 C 90 280, 170 130, 300 82 S 500 20, 560 -6"
              fill="none"
              stroke="#9AAEDD"
              strokeWidth="2"
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
            <g>
              <path
                d="M12 0 C12 -1.5 10.5 -2 9 -2 L3 -2 L-4 -10 L-7 -10 L-3 -2 L-8 -2 L-10 -5 L-12 -5 L-11 0 L-12 5 L-10 5 L-8 2 L-3 2 L-7 10 L-4 10 L3 2 L9 2 C10.5 2 12 1.5 12 0 Z"
                fill="#0B1B3D"
              />
              <animateMotion
                dur="8s"
                repeatCount="indefinite"
                rotate="auto"
                path="M-20 330 C 90 280, 170 130, 300 82 S 500 20, 560 -6"
              />
            </g>
          </svg>

          {/* Phone Frame */}
          <div className="absolute top-0 right-[4%] aspect-[9/18] w-[46%] overflow-hidden rounded-[26px] sm:rounded-[34px] border-[5px] sm:border-[6px] border-[#0B1B3D] bg-[#F6F7F9] shadow-[0_30px_60px_-36px_rgba(11,27,61,0.45)]">
            {/* Sleek speaker slit */}
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-[#0B1B3D]/25 sm:mt-2.5 sm:h-1.5 sm:w-14" />

            <div className="flex h-full flex-col gap-3 p-3 pt-2 sm:p-5 sm:pt-3">
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#0B1B3D]">Claim a bag</span>
              <div className="grid grid-cols-2 gap-1.5">
                <span className="h-1 rounded-full bg-[#0B1B3D]" />
                <span className="h-1 rounded-full bg-[#DCE1EA]" />
              </div>
              <div className="mt-1 flex flex-col gap-1 sm:mt-2">
                <span className="text-[10px] sm:text-xs font-medium text-[#4A5266]">Serial number</span>
                <span className="overflow-hidden rounded-lg border border-[#DCE1EA] bg-white px-2.5 py-1.5 font-mono text-[10px] sm:text-xs text-[#0B1B3D] whitespace-nowrap">
                  AMT-C055-00F3A1
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs font-medium text-[#4A5266]">Claim code</span>
                <span className="overflow-hidden rounded-lg border border-[#0B1B3D] bg-white px-2.5 py-1.5 font-mono text-[10px] sm:text-xs tracking-wider text-[#0B1B3D] whitespace-nowrap">
                  7KQ2-••••-••••
                </span>
              </div>
              <span className="mt-auto mb-3 flex h-8 sm:h-9 items-center justify-center rounded-xl bg-[#0B1B3D] text-[10px] sm:text-xs font-medium text-white whitespace-nowrap">
                Claim this bag
              </span>
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20">
              <span className="block h-1 w-14 rounded-full bg-[#0B1B3D]/30" />
            </div>
          </div>

          {/* 3D Floating Claim Card with Real AMORTRAV Brand Logo */}
          <div className="animate-float absolute bottom-[8%] left-0 flex aspect-[1.586] w-[62%] -rotate-7 flex-col justify-between rounded-2xl bg-[#0B1B3D] p-4 sm:p-5 text-white shadow-[0_30px_50px_-28px_rgba(11,27,61,0.6)]">
            <div className="flex items-center justify-between">
              {/* Actual Brand Logo */}
              <Image
                src="/img/cta-mark.png"
                alt="AMORTRAV"
                width={28}
                height={23}
                className="h-5 sm:h-6 w-auto object-contain"
              />
              <span className="text-[10px] sm:text-xs font-medium text-[#A9B6D3]">Claim card</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] sm:text-[10px] font-medium text-[#A9B6D3]">Serial</span>
              <span className="font-mono text-xs sm:text-sm tracking-wider text-white">AMT-C055-00F3A1</span>
              <div className="mt-1 sm:mt-2 h-4 sm:h-5 rounded bg-[repeating-linear-gradient(135deg,#2B4479_0_6px,#1A2F60_6px_12px)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Half-phone mockup emerging from the bottom edge.
// Premium, spacious, and ultra-clean without crammed status-bar clutter.
function HalfPhoneMockup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-[280px] sm:h-[310px] w-[260px] sm:w-[285px] max-w-[85vw] shrink-0 flex-col overflow-hidden rounded-t-[34px] sm:rounded-t-[40px] border-[5px] border-b-0 border-[#0B1B3D] bg-white p-4 pt-2.5 sm:p-5 sm:pt-3 shadow-[0_-16px_40px_-16px_rgba(11,27,61,0.22)] ${className}`}
    >
      {/* Sleek speaker slit */}
      <div className="mx-auto mb-3 sm:mb-4 h-1 sm:h-1.5 w-12 sm:w-14 rounded-full bg-[#0B1B3D]/20" />

      {/* Screen Content */}
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

// "Steps · sticky stack": each step sticks to the top and the next one slides over it.
// Placed directly on the page background (bg-surface) with no card containers, maintaining the sticky animation from main.
function Step({
  number,
  title,
  badge,
  text,
  wrapper,
  children,
}: {
  number: string;
  title: string;
  badge?: string;
  text: string;
  wrapper: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`sticky top-[72px] xl:top-[80px] ${wrapper}`}>
      <div className="flex min-h-[460px] sm:min-h-[490px] flex-col justify-between overflow-hidden bg-surface px-4 pt-6 pb-0 xl:h-[360px] xl:flex-row xl:items-end xl:justify-center xl:gap-20 xl:px-14 xl:py-0">
        <div data-reveal className="flex flex-col px-2 pt-2 pb-4 xl:h-full xl:w-[460px] xl:shrink-0 xl:justify-center xl:px-0 xl:py-0">
          <div className="flex flex-col gap-2.5 sm:gap-3 xl:gap-4">
            <span className="font-mono text-xs font-semibold tracking-wider text-[#2A4BD7]">{number}</span>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold tracking-tight text-[#0B1B3D] sm:text-3xl xl:text-4xl">{title}</h3>
              {badge && (
                <span className="rounded-full bg-[#E6E9EF] px-2.5 py-0.5 text-xs font-semibold text-[#4A5266]">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-[#4A5266] sm:text-base xl:text-lg">{text}</p>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="flex flex-1 items-end justify-center xl:h-full xl:w-[460px] xl:flex-none"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Steps() {
  return (
    <section id="steps" className="flex flex-col gap-6 pt-6 pb-12 xl:gap-8 xl:py-16">
      <div className="flex flex-col gap-3">
        <span className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#2A4BD7] uppercase">
          <span aria-hidden="true" className="h-[2px] w-6 bg-[#2A4BD7]" />
          The steps
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-[#0B1B3D] sm:text-4xl xl:text-[42px]">
          From the box to the airport.
        </h2>
      </div>

      <div className="flex flex-col">
        {/* Step 1: Unbox */}
        <Step
          number="01"
          title="Unbox"
          text="Every bag ships with a claim card. The one-time code hides under a scratch strip."
          wrapper="z-[1] -mb-8 pt-3 pb-6 xl:-mb-[52px] xl:pt-6 xl:pb-8"
        >
          <div className="flex h-full w-full items-center justify-center py-6 xl:pb-12">
            <div className="animate-float flex h-[150px] w-[230px] sm:h-[164px] sm:w-[260px] -rotate-4 flex-col justify-between rounded-2xl bg-[#0B1B3D] p-4 sm:p-5 text-white shadow-[0_24px_48px_-16px_rgba(11,27,61,0.5)]">
              <div className="flex items-center justify-between">
                {/* Real AMORTRAV Brand Logo */}
                <Image
                  src="/img/cta-mark.png"
                  alt="AMORTRAV"
                  width={28}
                  height={23}
                  className="h-4.5 sm:h-5 w-auto object-contain"
                />
                <span className="text-[10px] sm:text-[11px] font-medium text-[#A9B6D3]">Claim card</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs sm:text-sm tracking-wide text-white">AMT-C055-00F3A1</span>
                <div className="mt-1.5 sm:mt-2 h-4 sm:h-5 rounded bg-[repeating-linear-gradient(135deg,#2B4479_0_6px,#1A2F60_6px_12px)]" />
              </div>
            </div>
          </div>
        </Step>

        {/* Step 2: Pair */}
        <Step
          number="02"
          title="Pair"
          text="Sign in with Google and enter both. The bag is yours, and the code stops working for good."
          wrapper="z-[2] -mb-8 pt-6 pb-3 xl:-mb-[52px] xl:pt-10 xl:pb-4"
        >
          <HalfPhoneMockup>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#E4E7EE] pb-2.5">
                <span className="text-sm font-bold tracking-tight text-[#0B1B3D]">Claim a bag</span>
                <span className="rounded-full bg-[#EEF2FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#2A4BD7]">
                  Pairing
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="text-[11px] font-medium text-[#5A6377]">Serial number</span>
                <span className="rounded-xl border border-[#DCE1EA] bg-[#F6F7F9] px-3.5 py-2 font-mono text-xs font-medium text-[#0B1B3D]">
                  AMT-C055-00F3A1
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[#5A6377]">Claim code</span>
                <span className="rounded-xl border border-[#DCE1EA] bg-[#F6F7F9] px-3.5 py-2 font-mono text-xs font-medium tracking-wider text-[#0B1B3D]">
                  7KQ2-9XHM-4RTA
                </span>
              </div>
              <div className="mt-1 flex items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F5EA] px-3 py-1.5 text-xs font-semibold text-[#11683B]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Paired to you
                </span>
              </div>
            </div>
          </HalfPhoneMockup>
        </Step>

        {/* Step 3: Fly */}
        <Step
          number="03"
          title="Fly"
          badge="Coming soon"
          text="Switch to flight-safe at the gate. Radios sleep until you land."
          wrapper="z-[3] pt-9 pb-3 xl:pt-14 xl:pb-6"
        >
          <HalfPhoneMockup>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-[#E4E7EE] pb-2.5">
                <span className="text-sm font-bold tracking-tight text-[#0B1B3D]">Blue carry-on</span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#11683B]">
                  <span className="size-2 rounded-full bg-[#11683B]" />
                  Connected
                </span>
              </div>

              {/* Flight-safe card */}
              <div className="flex flex-col gap-2 rounded-2xl bg-[#0B1B3D] p-4 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Image src="/icons/plane.svg" alt="" width={15} height={15} className="brightness-200" />
                    </span>
                    <span className="text-sm font-bold text-white">Flight-safe</span>
                  </div>
                  {/* Real Toggle Switch */}
                  <span className="relative h-5 w-9 rounded-full bg-[#B9CBFF] p-0.5 shadow-inner">
                    <span className="block size-4 translate-x-4 rounded-full bg-[#0B1B3D] shadow-xs" />
                  </span>
                </div>
                <span className="text-[11px] text-[#A9B6D3]">Radios sleep until you land.</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F6F7F9] px-3.5 py-2 text-xs text-[#5A6377]">
                <span>Status</span>
                <span className="font-semibold text-[#11683B]">Active standby</span>
              </div>
            </div>
          </HalfPhoneMockup>
        </Step>
      </div>
    </section>
  );
}

const HOOD_POINTS = [
  {
    title: "One code, one owner",
    text: "A claim code works once. After that, nobody else can pair your bag.",
    icon: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="M11 12l9-9M16.5 6.5l3 3M14 9l2 2" />
      </>
    ),
  },
  {
    title: "Every change is logged",
    text: "Registering, claiming, edits and revokes all land in an audit trail.",
    icon: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4.5" cy="6" r="1" />
        <circle cx="4.5" cy="12" r="1" />
        <circle cx="4.5" cy="18" r="1" />
      </>
    ),
  },
  {
    title: "Files stay private",
    text: "Your receipts belong to your account, not the brand's.",
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <rect x="9" y="13" width="6" height="4.5" rx="1" />
        <path d="M10.5 13v-1.2a1.5 1.5 0 0 1 3 0V13" />
      </>
    ),
  },
  {
    title: "Revoked means revoked",
    text: "If a brand pulls a bag from service, it can't be paired again.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
      </>
    ),
  },
];

function UnderTheHood() {
  return (
    <section className="flex flex-col gap-8 border-t border-[#E4E7EE] py-12 xl:py-20">
      <div className="flex flex-col gap-3">
        <span className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#2A4BD7] uppercase">
          <span aria-hidden="true" className="h-[2px] w-6 bg-[#2A4BD7]" />
          Under the hood
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-[#0B1B3D] sm:text-4xl xl:text-[42px]">
          Built so the bag stays yours.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-6 pt-4 md:grid-cols-2">
        {HOOD_POINTS.map((pt) => (
          <div key={pt.title} className="flex flex-col gap-2.5 border-t border-[#E4E7EE] pt-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2A4BD7"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {pt.icon}
            </svg>
            <h3 className="text-lg font-semibold tracking-tight text-[#0B1B3D]">{pt.title}</h3>
            <p className="text-base font-normal leading-relaxed text-[#4A5266]">{pt.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="flex flex-col gap-6 overflow-clip px-5 py-8 xl:flex-row xl:items-start xl:gap-10 xl:rounded-[32px] xl:p-14">
      <h2 data-reveal className="text-h1-m font-bold text-navy xl:hidden">
        Questions people actually ask
      </h2>
      <h2 data-reveal className="hidden w-[442px] shrink-0 text-h1 font-bold text-navy xl:block">
        Questions you may want to ask
      </h2>
      <FaqList items={FAQ} initialOpen={0} className="xl:min-w-0 xl:flex-1" />
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HowItWorksHero />
      <Steps />
      <UnderTheHood />
      <Faq />
    </>
  );
}
