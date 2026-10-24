import type { Metadata } from "next";
import Image from "next/image";
import Button from "../_components/Button";
import PageHeader from "../_components/PageHeader";
import StatusPill from "../_components/StatusPill";
import ClaimPanel from "./ClaimPanel";
import PowerModes from "./PowerModes";

// Figma "Features page — Desktop 1440" (124:298) and "— Mobile 390" (124:539).

export const metadata: Metadata = {
  title: "Features",
  description:
    "Discover AMORTRAV smart luggage features: one-time claim card security, flight-safe wireless controls, receipts and document storage, and manufacturer warranty tracking.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features · AMORTRAV",
    description:
      "One-time claim codes, flight-safe wireless mode, bag receipts, and warranty alerts.",
    url: "/features",
  },
};

function FeatureCard({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex h-[354px] w-[296px] shrink-0 flex-col gap-3.5 overflow-clip rounded-3xl bg-white p-6 shadow-card transition-[translate,box-shadow] duration-300 ease-out-soft hover:shadow-card-hover motion-safe:hover:-translate-y-1 xl:h-[363px] xl:w-auto xl:flex-1 xl:rounded-[28px] xl:p-7"
    >
      <div className="flex min-h-14 w-full items-start gap-2">
        <h3 className="flex-1 text-h3-m font-semibold text-navy xl:text-h4">{title}</h3>
        <StatusPill live={false} />
      </div>
      {children}
      <p className="text-body-m text-mid xl:text-body">{text}</p>
    </div>
  );
}

function Features() {
  return (
    <section className="flex flex-col gap-6 overflow-clip py-8 xl:gap-9 xl:rounded-[32px] xl:px-14 xl:py-16">
      <div data-reveal className="flex flex-col px-5 xl:flex-row xl:items-end xl:justify-between xl:gap-8 xl:px-0">
        <h2 className="text-h1-m font-bold text-navy xl:w-[620px] xl:text-h1">Your bag has a few new tricks.</h2>
        <p className="text-body-m text-mid xl:w-[380px] xl:shrink-0 xl:text-body">Some features are ready to use. Others are still in development.</p>
      </div>

      <div data-reveal className="px-5 xl:px-0">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-blue-pale px-4 pt-6 pb-4 xl:h-[300px] xl:flex-row xl:gap-8 xl:rounded-[28px] xl:p-8">
          <div className="flex w-full flex-col gap-3.5 px-2 xl:w-[596px] xl:shrink-0 xl:px-0">
            <h3 className="text-h2-m font-semibold text-navy xl:text-h3">Pair your bag in seconds</h3>
            <p className="text-body-m text-mid xl:text-body">
              Type the serial and the one-time code from the box. The bag is yours, and that code never works again.
            </p>
          </div>
          <ClaimPanel />
        </div>
      </div>

      <div className="flex flex-col xl:gap-[18px]">
        <div data-reveal="group" data-stagger className="flex gap-3 overflow-x-auto px-5 pt-1 pb-6 [scrollbar-width:none] xl:gap-[18px] xl:overflow-visible xl:p-0">
          <FeatureCard title="Know where it is" text="Last known spot, and how fresh that fix is.">
            <div className="flex h-[156px] w-full shrink-0 items-center justify-center rounded-[20px] bg-surface">
              <Image src="/img/location-map-m.svg" alt="" width={240} height={120} className="h-[119.94px] w-[239.88px] xl:hidden" />
              <Image src="/img/location-map.svg" alt="" width={253} height={126} className="hidden h-[126.25px] w-[252.5px] xl:block" />
            </div>
          </FeatureCard>
          <FeatureCard title="Opens for you only" text="Biometric unlock. Your fingerprint stays on the bag, never in the cloud.">
            <div className="flex h-[156px] w-full shrink-0 items-center justify-center rounded-[20px] bg-surface">
              <Image src="/icons/fingerprint.svg" alt="" width={84} height={84} />
            </div>
          </FeatureCard>
          <FeatureCard title="Flight-safe by design" text="Power modes that drop radios for takeoff and save battery when it counts.">
            <PowerModes />
          </FeatureCard>
          <FeatureCard title="Gets better over time" text="Over-the-air updates, with rollback if anything looks off.">
            <div className="flex h-[156px] w-full shrink-0 flex-col justify-center gap-2.5 rounded-[20px] bg-surface p-5">
              <div className="flex items-start justify-between whitespace-nowrap">
                <span className="text-caption-m text-navy xl:text-caption">Firmware update</span>
                <span className="font-mono text-mono-m font-medium text-mid xl:text-mono">[VERSION]</span>
              </div>
              <div className="h-2.5 w-full overflow-clip rounded-full bg-blue-pale">
                <div data-reveal="grow" className="h-2.5 w-[62%] rounded-full bg-brand [--motion-delay:300ms]" />
              </div>
              <span className="text-caption-m whitespace-nowrap text-mid xl:text-caption">Signed and verified before install</span>
            </div>
          </FeatureCard>
        </div>

        <div data-reveal className="px-5 xl:px-0">
          <div className="flex flex-col items-center gap-5 overflow-clip rounded-3xl bg-white p-6 shadow-card xl:flex-row xl:gap-10 xl:rounded-[28px] xl:p-7">
            <div className="flex w-full flex-col gap-3.5 xl:flex-1">
              <h3 className="text-h3-m font-semibold text-navy xl:text-h4">Your docs, in the app</h3>
              <p className="text-body-m text-mid xl:text-body">Receipts and warranty cards, private to you.</p>
            </div>
            <ul className="flex w-full flex-col gap-2 text-caption-m whitespace-nowrap xl:flex-1 xl:text-caption">
              <li className="flex items-center gap-2.5 rounded-2xl bg-surface px-3.5 py-2.5">
                <span className="text-warning">PDF</span>
                <span className="text-navy">Carry-on receipt</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-2xl bg-surface px-3.5 py-2.5">
                <span className="text-brand">JPG</span>
                <span className="text-navy">Warranty card</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const STATUS = [
  { label: "Pairing and account setup", live: true },
  { label: "Private documents", live: true },
  { label: "Private files", live: true },
  { label: "Location tracking", live: true },
  { label: "Fingerprint access", live: false },
  { label: "Flight-safe power modes", live: false },
];

function WhatsLive() {
  return (
    <section className="flex flex-col gap-6 overflow-clip rounded-3xl bg-white px-5 pt-8 pb-6 xl:flex-row xl:items-start xl:gap-10 xl:rounded-[32px] xl:p-14">
      <div data-reveal className="flex flex-col gap-4 xl:w-[429px] xl:shrink-0">
        <h2 className="text-h1-m font-bold text-navy xl:text-h1">
          What&apos;s live, <br />
          what&apos;s next
        </h2>
        <p className="text-body-m text-mid xl:text-body">No vapor. Anything marked Planned arrives as a free update to bags you already own.</p>
        <div className="flex flex-wrap gap-x-2.5 gap-y-2">
          <span className="flex items-center gap-2 text-caption-m whitespace-nowrap text-mid xl:text-caption">
            <StatusPill live />
            works today
          </span>
          <span className="flex items-center gap-2 text-caption-m whitespace-nowrap text-mid xl:text-caption">
            <StatusPill live={false} />
            on the roadmap
          </span>
        </div>
      </div>
      <ul data-stagger className="flex flex-col xl:min-w-0 xl:flex-1">
        {STATUS.map(({ label, live }) => (
          <li key={label} data-reveal className="flex items-center gap-3 border-t border-surface py-4 xl:gap-5 xl:px-1 xl:py-[18px]">
            <span className="flex-1 text-h3-m font-semibold text-navy xl:text-h4">{label}</span>
            <StatusPill live={live} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function OnTheRoad() {
  return (
    <section data-stagger className="flex flex-col gap-4 xl:flex-row xl:gap-5">
      <div data-reveal className="relative h-[300px] overflow-hidden rounded-3xl xl:h-[420px] xl:flex-[610_1_0] xl:rounded-[32px]">
        <Image src="/img/tile-carryon.jpg" alt="A traveller wheeling a silver suitcase" fill sizes="(min-width: 1280px) 610px, 100vw" className="object-cover" />
      </div>
      <div data-reveal className="flex flex-col items-start justify-center gap-4 overflow-clip rounded-3xl bg-blue-faint px-6 py-8 xl:h-[420px] xl:flex-[770_1_0] xl:gap-[18px] xl:rounded-[32px] xl:p-12">
        <h2 className="text-h1-m font-bold text-navy xl:w-[441px] xl:text-h1">Looks like a bag. Thinks like a phone.</h2>
        <p className="text-body-m text-navy xl:w-[456px] xl:text-body">
          The familiar design of everyday luggage, with a connected system built into its shell.
        </p>
        <div className="xl:hidden">
          <Button href="/how-it-works" label="See how it works" />
        </div>
        <div className="hidden xl:block">
          <Button href="/how-it-works" label="See how it works" size="l" />
        </div>
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        page="Features"
        title="Everything your bag should've done already."
        intro="Pair your bag, keep its documents handy and receive important updates. Location tracking, biometric security and flight-safe power modes are on the way."
        media="/img/page-header-media.png"
        mediaAlt="Three black AMORTRAV suitcases"
        crop
      />
      <Features />
      <WhatsLive />
      <OnTheRoad />
    </>
  );
}
