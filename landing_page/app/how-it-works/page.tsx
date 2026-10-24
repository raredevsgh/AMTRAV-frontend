import type { Metadata } from "next";
import Image from "next/image";
import FaqList from "../_components/FaqList";
import PageHeader from "../_components/PageHeader";
import StatusPill from "../_components/StatusPill";

// Figma "How it works page — Desktop 1440" (124:776) and "— Mobile 390" (124:976).

export const metadata: Metadata = { title: "How it works · AMORTRAV" };

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

// "Steps · sticky stack": each step sticks to the top and the next one slides over it.
// The wrappers' top padding (stack offset) and negative bottom margin come from the design.
function Step({
  number,
  title,
  text,
  planned = false,
  wrapper,
  children,
}: {
  number: number;
  title: string;
  text: string;
  planned?: boolean;
  wrapper: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`sticky top-0 ${wrapper}`}>
      <div className="flex h-[358px] flex-col gap-4 overflow-clip border-t border-divider bg-surface px-2 py-4 xl:h-80 xl:flex-row xl:items-start xl:justify-center xl:gap-16 xl:px-14 xl:py-6">
        <div data-reveal className="flex flex-col px-3 pt-1 xl:h-full xl:w-[480px] xl:shrink-0 xl:justify-center xl:px-0 xl:py-2">
          <div className="flex flex-col gap-3 xl:gap-5">
            <div className="flex items-center gap-3 xl:gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-h3-m font-semibold text-blue-faint xl:size-12 xl:text-h4">
                {number}
              </span>
              <h2 className="text-h1-m font-bold text-navy xl:text-h1">{title}</h2>
              {planned && <StatusPill live={false} onSurface />}
            </div>
            <p className="text-small text-mid xl:text-body">{text}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function FlightSafeBadge() {
  return (
    <div className="relative flex items-center gap-3 rounded-[20px] bg-white/51 py-3 pr-[18px] pl-3 drop-shadow-[0_20px_20px_rgba(0,10,31,0.3)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy">
        <Image src="/icons/plane.svg" alt="" width={20} height={20} />
      </span>
      <span className="flex flex-col gap-0.5 whitespace-nowrap">
        <span className="text-caption text-navy">Flight-safe mode</span>
        <span className="text-caption-m text-mid">Radios off until landing</span>
      </span>
    </div>
  );
}

function Steps() {
  return (
    <section className="flex flex-col">
      <Step
        number={1}
        title="Unbox"
        text="Inside the box, you'll find a card with your bag's serial number and a hidden claim code. Keep it somewhere safe."
        wrapper="z-[1] -mb-8 pt-3 pb-6 xl:-mb-[52px] xl:pt-6 xl:pb-8"
      >
        <div data-reveal className="relative flex-1 overflow-hidden rounded-[20px] bg-white [--motion-delay:120ms] xl:h-full xl:w-[520px] xl:flex-none xl:shrink-0 xl:rounded-3xl">
          <Image
            src="/img/step-unbox.png"
            alt="An AMORTRAV suitcase next to its claim card"
            width={1122}
            height={1402}
            sizes="(min-width: 1280px) 520px, 100vw"
            className="absolute top-[-121.13%] left-0 h-[237.69%] w-full max-w-none xl:top-[-125.81%] xl:h-[239.77%]"
          />
        </div>
      </Step>
      <Step
        number={2}
        title="Pair"
        text="Open the AMORTRAV app and enter both codes to register your bag to your account."
        wrapper="z-[2] -mb-8 pt-6 pb-3 xl:-mb-[52px] xl:pt-10 xl:pb-4"
      >
        <div data-reveal className="flex flex-1 items-start justify-center overflow-clip rounded-[20px] bg-blue-pale [--motion-delay:120ms] pt-[22px] xl:h-full xl:w-[520px] xl:flex-none xl:shrink-0 xl:rounded-3xl xl:pt-8">
          <div className="relative h-[280px] w-[140px] shrink-0 overflow-hidden rounded-[21.54px] xl:h-[400px] xl:w-[200px] xl:rounded-[30.77px]">
            <Image
              src="/img/step-phone.png"
              alt="The AMORTRAV app's Claim your bag screen"
              width={1024}
              height={1536}
              sizes="(min-width: 1280px) 342px, 240px"
              className="absolute top-[-15.65%] left-[-37.69%] h-[127.94%] w-[170.58%] max-w-none"
            />
          </div>
        </div>
      </Step>
      <Step
        number={3}
        title="Fly"
        planned
        text="Flight-safe mode is being designed to adjust your bag's wireless activity during air travel."
        wrapper="z-[3] pt-9 pb-3 xl:pt-14 xl:pb-6"
      >
        <div data-reveal className="relative flex flex-1 flex-col items-end overflow-hidden rounded-[20px] bg-white p-3.5 [--motion-delay:120ms] xl:h-full xl:w-[520px] xl:flex-none xl:shrink-0 xl:rounded-3xl xl:p-6">
          <Image
            src="/img/tile-dropoff.png"
            alt="An AMORTRAV suitcase at the airport"
            width={1536}
            height={1024}
            sizes="(min-width: 1280px) 520px, 100vw"
            className="absolute top-[-6.36%] left-0 h-[112.72%] w-full max-w-none xl:top-[-0.01%] xl:left-[0.09%] xl:h-[127.92%]"
          />
          <FlightSafeBadge />
        </div>
      </Step>
    </section>
  );
}

const POINTS = [
  { title: "One code, one owner", text: "A claim code works exactly once. After that, nobody else can pair your bag." },
  { title: "Every change is logged", text: "Registering, claiming, edits and revokes all land in an audit trail." },
  { title: "Files stay private", text: "Your receipts are scoped to your account, not the brand's." },
  { title: "Revoked means revoked", text: "If a brand pulls a bag from service, it can't be paired again." },
];

// Only the mobile frame has this section.
function UnderTheHood() {
  return (
    <section className="flex flex-col gap-8 overflow-clip rounded-3xl bg-navy px-5 py-8 xl:hidden">
      <h2 data-reveal className="text-h1-m font-bold text-white">
        Under the hood
      </h2>
      <div data-stagger className="flex flex-col gap-4">
        {POINTS.map(({ title, text }) => (
          <div key={title} data-reveal className="flex flex-col gap-2.5 rounded-3xl bg-navy-deep p-6">
            <h3 className="text-h3-m font-semibold text-white">{title}</h3>
            <p className="text-body-m text-blue-pale">{text}</p>
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
      <PageHeader
        page="How it works"
        title="Box to boarding in three steps."
        intro="Your AMORTRAV bag comes with a claim card. Use its serial number and one-time code to link the bag to your account."
        introMobile="No pairing dance, no Bluetooth menus. A card in the box and the Amortrav app do the work."
        media="/img/tile-gate.jpg"
        mediaAlt="A teal suitcase at an airport gate"
      />
      <Steps />
      <UnderTheHood />
      <Faq />
    </>
  );
}
