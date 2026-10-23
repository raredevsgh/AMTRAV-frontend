import type { Metadata } from "next";
import Image from "next/image";
import Button from "../_components/Button";
import PageHeader from "../_components/PageHeader";
import StatusPill from "../_components/StatusPill";

// Figma "For brands page — Desktop 1440" (124:1179) and "— Mobile 390" (124:1375).
// "Talk to us" and "Open the console" have no destination in the design yet.

export const metadata: Metadata = { title: "For brands · AMORTRAV" };

const POINTS = [
  "Register inventory and print one-time claim codes",
  "Revoke a record in one click, with a full audit trail",
  "Keep spec sheets and certificates in private storage",
];

const CHIPS = {
  Claimed: "bg-blue-pale text-brand",
  Unclaimed: "bg-surface text-mid",
  Revoked: "bg-warning-faint text-critical",
} as const;

const ROWS = [
  { serial: "AMT-CO55-00F3A1", status: "Claimed" },
  { serial: "AMT-CI70-0012B7", status: "Unclaimed" },
  { serial: "AMT-WK40-1A09C3", status: "Revoked" },
] as const;

function ConsolePreview() {
  return (
    <div aria-hidden className="flex w-full justify-center p-6 xl:w-[670px] xl:shrink-0">
      <div className="flex w-[278px] -rotate-2 flex-col gap-3.5 overflow-clip rounded-[28px] bg-white p-[22px] shadow-lifted xl:w-[622px]">
        <div className="flex items-center justify-between">
          <span className="text-h3-m font-semibold whitespace-nowrap text-navy xl:text-h4">Amortrav console</span>
          <Image src="/icons/window-dots.svg" alt="" width={42} height={10} />
        </div>
        <div className="flex gap-2 xl:gap-2.5">
          {[
            { label: "Registered", value: "8", dark: false },
            { label: "Claimed", value: "4", dark: false },
            { label: "Unclaimed", value: "3", dark: true },
          ].map(({ label, value, dark }) => (
            <div key={label} className={`flex min-w-0 flex-1 flex-col rounded-2xl px-2.5 py-3.5 xl:p-3.5 ${dark ? "bg-navy" : "bg-surface"}`}>
              <span className={`text-micro whitespace-nowrap xl:text-caption ${dark ? "text-blue-faint" : "text-mid"}`}>{label}</span>
              <span className={`text-h2-m font-semibold xl:text-h3 ${dark ? "text-white" : "text-navy"}`}>{value}</span>
            </div>
          ))}
        </div>
        {ROWS.map(({ serial, status }) => (
          <div key={serial} className="flex items-center justify-between rounded-[14px] bg-surface px-3.5 py-2.5">
            <span className="font-mono text-mono-m font-medium whitespace-nowrap text-navy xl:text-mono">{serial}</span>
            <span className={`flex h-6 items-center rounded-full px-2.5 text-caption-m whitespace-nowrap xl:text-caption ${CHIPS[status]}`}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShipSmartBags() {
  return (
    <section className="flex flex-col items-center gap-7 overflow-clip px-5 py-10 xl:flex-row xl:gap-12 xl:rounded-[32px] xl:px-14 xl:py-16">
      <div className="flex w-full flex-col items-start gap-[22px] xl:w-[570px] xl:shrink-0">
        <p className="flex h-8 items-center rounded-full bg-blue-pale px-3.5 text-caption-m whitespace-nowrap text-brand xl:text-caption">For luggage makers</p>
        <h2 className="text-h1-m font-bold text-navy xl:text-h1">Ship smart bags without building the cloud.</h2>
        <ul className="flex w-full flex-col gap-2.5">
          {POINTS.map((point) => (
            <li key={point} className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy">
                <Image src="/icons/check-white.svg" alt="" width={16} height={16} />
              </span>
              <span className="flex-1 text-caption-m text-navy xl:text-caption">{point}</span>
            </li>
          ))}
        </ul>
        <Button href="#" label="Open the console" size="l" />
      </div>
      <ConsolePreview />
    </section>
  );
}

const TOOLS = [
  { title: "Register devices", text: "Add serials one by one, with model and batch info.", live: true },
  { title: "One-time claim codes", text: "Generate and rotate codes for the card in the box.", live: true },
  { title: "Revoke and audit", text: "Pull a bag from service. Every action is logged.", live: true },
  { title: "Private files", text: "Spec sheets, certificates and manuals in one place.", live: true },
  { title: "Fleet map", text: "See where your bags are, with battery and fix age.", live: false },
  { title: "Complaints and alerts", text: "Customer issues and device alerts in one inbox.", live: false },
];

function ConsoleTools() {
  return (
    <section className="flex flex-col gap-8 overflow-clip rounded-3xl bg-white px-5 py-8 xl:rounded-[32px] xl:p-14">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between xl:gap-8">
        <h2 className="text-h1-m font-bold text-navy xl:w-[620px] xl:text-h1">What&apos;s in the console</h2>
        <p className="text-small text-mid xl:w-[380px] xl:shrink-0 xl:text-body">
          A web console for your ops team. Fleet tools turn on as your bags start reporting in.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[repeat(4,310px)] xl:items-start">
        {TOOLS.map(({ title, text, live }) => (
          <div key={title} className="flex flex-col gap-3.5 overflow-clip rounded-[28px] bg-white p-7 shadow-card xl:min-h-[164px]">
            <div className="flex items-center gap-2.5">
              <h3 className="flex-1 text-h3-m font-semibold text-navy xl:text-h4">{title}</h3>
              <StatusPill live={live} />
            </div>
            <p className="text-body-m text-mid xl:text-body">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const ONBOARDING = [
  { title: "Get your account", text: "The Amortrav team sets up your manufacturer login." },
  { title: "Register your serials", text: "Add each bag and print its claim card." },
  { title: "Ship it", text: "Customers pair in the app. You see claims land live." },
];

function Onboarding() {
  return (
    <section className="flex flex-col gap-8 overflow-clip rounded-3xl bg-navy px-5 py-8 xl:rounded-[32px] xl:p-14">
      <h2 className="text-h1-m font-bold text-white xl:text-h1">Live in a week, not a quarter</h2>
      <ol className="flex flex-col gap-4 xl:flex-row">
        {ONBOARDING.map(({ title, text }, i) => (
          <li key={title} className="flex flex-col items-start gap-3 overflow-clip rounded-3xl bg-navy-deep p-6 xl:flex-1">
            <span className="flex size-12 items-center justify-center rounded-full bg-blue-faint text-h3-m font-semibold text-navy xl:text-h4">{i + 1}</span>
            <h3 className="text-h3-m font-semibold text-white xl:text-h4">{title}</h3>
            <p className="text-body-m text-blue-pale xl:text-body">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function ForBrandsPage() {
  return (
    <>
      <PageHeader
        page="For brands"
        title="Your bags, smart. Your team, in control."
        intro="Amortrav handles pairing, ownership and the cloud so you can focus on building great luggage."
        media="/img/brands-header.jpg"
        mediaAlt="Travellers in a busy airport terminal"
        action={{ label: "Talk to us", href: "#" }}
      />
      <ShipSmartBags />
      <ConsoleTools />
      <Onboarding />
    </>
  );
}
