"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Plane,
  ShieldCheck,
  Lock,
  FileCheck,
  History,
  QrCode,
  Smartphone,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Radio,
} from "lucide-react";
import FaqList from "../_components/FaqList";
import Itinerary from "../_components/Itinerary";
import Button from "../_components/Button";
import { GET_THE_APP_HREF } from "../_components/nav";
import { useI18n } from "@/lib/i18n/context";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "I lost the claim card. Now what?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Contact client care or sign into your registered boutique account. Our security team can verify your serial and issue a cryptographic replacement code.",
      },
    },
    {
      "@type": "Question",
      name: "Can I pair one bag to multiple devices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One primary owner per bag. Sign in with the same account across all your personal devices (iPhone, iPad, Mac) and your luggage syncs automatically.",
      },
    },
    {
      "@type": "Question",
      name: "I purchased or inherited this bag secondhand. How do I transfer ownership?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The previous owner initiates a verified transfer within the AMTRAV app. Once confirmed, you can pair the bag to your account while retaining full lifetime service logs.",
      },
    },
    {
      "@type": "Question",
      name: "Does the suitcase work without installing the companion app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It remains an exceptional aerospace-grade suitcase with dual TSA locks and ball-bearing Multiwheels. The app adds real-time weight sensing, cellular tracking, impact timestamps, and digital paperwork.",
      },
    },
  ],
};

const FAQ = [
  {
    question: "I lost the claim card. Now what?",
    answer:
      "Contact client care or sign into your registered boutique account. Our security team can verify your serial number and issue a cryptographic replacement code to your verified identity.",
  },
  {
    question: "Can I pair one bag to multiple devices?",
    answer:
      "One primary owner per bag. Sign in with the same account across all your personal devices (iPhone, iPad, Mac) and your luggage syncs seamlessly with encrypted cloud backup.",
  },
  {
    question: "I purchased or inherited this bag secondhand. How do I transfer ownership?",
    answer:
      "The previous owner initiates a verified transfer within the AMTRAV app. Once confirmed, you can pair the bag to your account while retaining full lifetime service records and guarantee coverage.",
  },
  {
    question: "Does the suitcase work without installing the companion app?",
    answer:
      "Yes. It remains an exceptional aerospace-grade suitcase with dual TSA locks and ultra-silent ball-bearing Multiwheels. The app unlocks self-weighing, global cellular tracking, impact timestamps, and lifetime digital certificates.",
  },
] as const;

export default function HowItWorksPage() {
  const { t } = useI18n();
  const [flightSafeActive, setFlightSafeActive] = useState(true);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-14">
        {/* 1. Hero Section: Precision Onboarding */}
        <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 xl:pt-40 xl:pb-20">
          <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-2 xl:gap-16">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="flex flex-col items-start gap-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-blue-pale/50 px-3.5 py-1 text-[11px] font-mono font-bold tracking-wider text-brand uppercase">
                <span className="size-1.5 rounded-full bg-brand" />
                <span>Onboarding & Security Architecture</span>
              </div>

              <h1 className="text-display-m font-bold tracking-tight text-navy sm:text-5xl xl:text-[56px] xl:leading-[1.08]">
                Box to boarding
                <br />
                <span className="text-brand">in three simple steps.</span>
              </h1>

              <p className="max-w-lg text-body-m text-mid sm:text-lead sm:leading-relaxed">
                An engraved metal claim card and our streamlined companion app eliminate Bluetooth pairing dances. No complex setup menus—just pure Swiss-German precision.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button href={GET_THE_APP_HREF} label={t("landing.heroGetApp", "Get the app")} style="sky" size="m" arrow />
                <Button href="#steps" label="Explore the 3 steps" style="outline" size="m" />
              </div>
            </div>

            {/* Right Column: Visual Presentation with Metallic Card & Smartphone */}
            <div className="relative mx-auto flex w-full max-w-[500px] items-center justify-center py-6">
              {/* Outer Glow Halo */}
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-sky/20 via-blue-pale/30 to-brand/10 blur-3xl opacity-70" />

              {/* Smartphone Frame */}
              <div className="relative z-10 w-[240px] sm:w-[260px] overflow-hidden rounded-[38px] border-[6px] border-navy bg-white shadow-2xl">
                {/* Dynamic Island / Speaker */}
                <div className="mx-auto mt-2.5 h-1.5 w-16 rounded-full bg-navy/20" />

                {/* Smartphone Screen Content */}
                <div className="flex flex-col gap-3.5 p-4 pt-3">
                  <div className="flex items-center justify-between border-b border-divider pb-2">
                    <span className="text-[13px] font-bold text-navy">Pair Luggage</span>
                    <span className="rounded-full bg-blue-pale px-2 py-0.5 text-[10px] font-semibold text-brand">
                      Step 2 of 2
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-mid uppercase tracking-wider">
                      Case Serial Number
                    </span>
                    <span className="rounded-lg border border-divider bg-surface px-2.5 py-1.5 font-mono text-xs font-semibold text-navy">
                      AMT-C055-00F3A1
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-mid uppercase tracking-wider">
                      Encrypted Claim Code
                    </span>
                    <span className="rounded-lg border border-navy/30 bg-surface px-2.5 py-1.5 font-mono text-xs font-bold tracking-widest text-navy">
                      7KQ2-••••-••••
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 rounded-xl bg-success/10 px-2.5 py-2 text-[11px] font-semibold text-success">
                    <Check className="size-3.5 shrink-0" />
                    <span>Cryptographically verified</span>
                  </div>

                  <button
                    type="button"
                    className="mt-2 flex h-9 items-center justify-center rounded-xl bg-navy text-caption font-semibold text-white shadow-xs"
                  >
                    Bind to My Account
                  </button>
                </div>

                {/* Home Indicator Bar */}
                <div className="mx-auto my-2 h-1 w-20 rounded-full bg-navy/20" />
              </div>

              {/* Floating Metallic Claim Card (Overlapping in Realistic 3D Perspective) */}
              <div className="animate-float absolute -bottom-2 -left-4 sm:-left-8 z-20 flex aspect-[1.586] w-[220px] sm:w-[250px] -rotate-6 flex-col justify-between rounded-2xl border border-white/20 bg-gradient-to-br from-navy via-navy-deep to-ink p-4 text-white shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/img/cta-mark.png"
                      alt="AMORTRAV"
                      width={22}
                      height={18}
                      className="h-4 w-auto object-contain brightness-0 invert"
                    />
                    <span className="text-[10px] font-bold tracking-wider uppercase">AMORTRAV</span>
                  </div>
                  <span className="text-[9px] font-mono text-sky uppercase">Claim Card</span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono uppercase text-light-white">
                    Unique Serial
                  </span>
                  <span className="font-mono text-[11px] tracking-wider text-white">
                    AMT-C055-00F3A1
                  </span>
                  <div className="mt-1.5 h-4 rounded border border-white/10 bg-[repeating-linear-gradient(135deg,#2B4479_0_6px,#1A2F60_6px_12px)] shadow-inner" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Three-Step Progression Cards with Clean Box Sizing */}
        <section id="steps" className="scroll-mt-28 py-12 xl:py-16">
          <div className="flex flex-col gap-3 border-b border-divider pb-6 mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold">
              The Journey
            </span>
            <h2 className="text-h1-m font-bold text-navy xl:text-h1">
              From unboxing to the departure gate.
            </h2>
            <p className="text-small text-mid max-w-xl">
              Engineered to make luggage management as effortless and reassuring as German automotive engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Step 01: Unbox */}
            <article className="flex flex-col justify-between rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-divider pb-3 mb-4">
                  <span className="font-mono text-caption-m font-bold text-brand">STEP 01</span>
                  <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-[10px] font-bold text-navy uppercase">
                    Delivery
                  </span>
                </div>

                <h3 className="text-h3-m font-bold text-navy mb-2">Unbox & Claim Card</h3>
                <p className="text-caption text-mid leading-relaxed mb-6">
                  Every AMTRAV suitcase arrives with an engraved serialized aluminum claim card. Scratch the protective strip to reveal your single-use setup key.
                </p>
              </div>

              {/* Graphic Box */}
              <div className="flex h-52 items-center justify-center rounded-2xl bg-surface/60 p-4 border border-divider/60">
                <div className="flex aspect-[1.586] w-[210px] flex-col justify-between rounded-xl border border-white/20 bg-navy p-3 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-sky">ATELIER CARDS</span>
                    <QrCode className="size-3.5 text-white/70" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-light-white">One-Time Activation</span>
                    <span className="font-mono text-[10px] tracking-wider text-white">
                      AMT-C055-00F3A1
                    </span>
                    <div className="mt-1 h-3.5 rounded bg-[repeating-linear-gradient(135deg,#3A5899_0_5px,#1A2F60_5px_10px)]" />
                  </div>
                </div>
              </div>
            </article>

            {/* Step 02: Pair */}
            <article className="flex flex-col justify-between rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-divider pb-3 mb-4">
                  <span className="font-mono text-caption-m font-bold text-brand">STEP 02</span>
                  <span className="rounded-full bg-blue-pale px-2.5 py-0.5 text-[10px] font-bold text-brand uppercase">
                    Instant Binding
                  </span>
                </div>

                <h3 className="text-h3-m font-bold text-navy mb-2">Pair in Seconds</h3>
                <p className="text-caption text-mid leading-relaxed mb-6">
                  Sign in with Google. Enter your serial number and claim code. The case binds permanently to your identity, burning the claim code for zero theft vulnerability.
                </p>
              </div>

              {/* Graphic Box: Simulated Phone Pairing */}
              <div className="flex h-52 items-center justify-center rounded-2xl bg-surface/60 p-4 border border-divider/60">
                <div className="w-[190px] rounded-2xl border-2 border-navy bg-white p-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-divider pb-1.5 mb-2">
                    <span className="text-[11px] font-bold text-navy">Ownership Bond</span>
                    <Check className="size-3.5 text-success" />
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="rounded bg-surface px-2 py-1 font-mono text-navy truncate">
                      AMT-C055-00F3A1
                    </div>
                    <div className="rounded bg-success/10 px-2 py-1 font-medium text-success flex items-center gap-1">
                      <ShieldCheck className="size-3" />
                      <span>Paired to your ID</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Step 03: Fly with Interactive Flight-Safe Toggle */}
            <article className="flex flex-col justify-between rounded-3xl border border-divider bg-white p-6 shadow-card transition-all hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-divider pb-3 mb-4">
                  <span className="font-mono text-caption-m font-bold text-brand">STEP 03</span>
                  <span className="rounded-full bg-sky/30 px-2.5 py-0.5 text-[10px] font-bold text-navy uppercase">
                    Airline Certified
                  </span>
                </div>

                <h3 className="text-h3-m font-bold text-navy mb-2">Gate to Boarding</h3>
                <p className="text-caption text-mid leading-relaxed mb-6">
                  Switch to Flight-Safe at the gate with one tap. Cellular and GPS radios sleep automatically during transit and wake upon runway touchdown.
                </p>
              </div>

              {/* Graphic Box: Interactive Toggle Switch */}
              <div className="flex h-52 flex-col items-center justify-center rounded-2xl bg-surface/60 p-4 border border-divider/60">
                <div className="w-[210px] rounded-2xl border border-divider bg-navy p-3 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-white/10">
                        <Plane className="size-4 text-sky" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold">Flight-Safe Mode</span>
                        <span className="text-[9px] text-light-white">
                          {flightSafeActive ? "Radios sleeping in flight" : "Radios active & broadcasting"}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Clickable Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setFlightSafeActive(!flightSafeActive)}
                      aria-label="Toggle flight-safe mode"
                      className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                        flightSafeActive ? "bg-sky" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-navy shadow-sm transition-transform ${
                          flightSafeActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
                    <span className="text-blue-pale">Airborne Status:</span>
                    <span className={`font-mono font-bold ${flightSafeActive ? "text-sky" : "text-amber-400"}`}>
                      {flightSafeActive ? "SAFE · COMPLIANT" : "STANDBY"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* 3. Real-Time Tracking Itinerary Showcase */}
        <section className="my-10">
          <div className="flex flex-col gap-2 border-b border-divider pb-4 mb-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold">
              Global Milestones
            </span>
            <h2 className="text-h2-m font-bold text-navy xl:text-h2">
              Follow every leg of your journey.
            </h2>
            <p className="text-body-m text-mid max-w-xl">
              Live airport handover logs, cargo ramp temperature monitoring, and baggage carousel alerts.
            </p>
          </div>
          <Itinerary />
        </section>

        {/* 4. Under The Hood: Bento Grid Security Architecture */}
        <section className="border-t border-divider py-14 xl:py-20">
          <div className="flex flex-col gap-3 mb-10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold">
              Security Specifications
            </span>
            <h2 className="text-h1-m font-bold text-navy xl:text-h1">
              Built so your case belongs to you for life.
            </h2>
            <p className="text-body-m text-mid max-w-2xl">
              Our hardware security module (HSM) pairs cryptographic tokens with tamper-evident physical serial numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 01: Single-Use Claim */}
            <div className="flex flex-col justify-between rounded-3xl border border-divider bg-surface/50 p-6 shadow-xs hover:bg-white hover:shadow-card transition-all">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-navy/5 text-navy mb-4">
                  <Lock className="size-5" />
                </div>
                <h3 className="text-h3-m font-bold text-navy mb-2">One Code, One Owner</h3>
                <p className="text-caption text-mid leading-relaxed">
                  Every activation code works strictly once. Once claimed, the code is cryptographically invalidated on our global HSM servers.
                </p>
              </div>
              <span className="mt-4 font-mono text-[10px] text-brand font-semibold">
                01 / CRYPTO SECURITY
              </span>
            </div>

            {/* 02: Immutable Audit Log */}
            <div className="flex flex-col justify-between rounded-3xl border border-divider bg-surface/50 p-6 shadow-xs hover:bg-white hover:shadow-card transition-all">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-navy/5 text-navy mb-4">
                  <History className="size-5" />
                </div>
                <h3 className="text-h3-m font-bold text-navy mb-2">Immutable Audit Log</h3>
                <p className="text-caption text-mid leading-relaxed">
                  Every luggage registration, transfer, severe handling impact, and authorized repair hub visit is timestamped into an unalterable journey record.
                </p>
              </div>
              <span className="mt-4 font-mono text-[10px] text-brand font-semibold">
                02 / CUSTODY LOGGING
              </span>
            </div>

            {/* 03: Private Papers */}
            <div className="flex flex-col justify-between rounded-3xl border border-divider bg-surface/50 p-6 shadow-xs hover:bg-white hover:shadow-card transition-all">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-navy/5 text-navy mb-4">
                  <FileCheck className="size-5" />
                </div>
                <h3 className="text-h3-m font-bold text-navy mb-2">Zero-Knowledge Vault</h3>
                <p className="text-caption text-mid leading-relaxed">
                  Your purchase receipts, customs clearance papers, and insurance certificates belong exclusively to your account, client-side encrypted.
                </p>
              </div>
              <span className="mt-4 font-mono text-[10px] text-brand font-semibold">
                03 / DATA PRIVACY
              </span>
            </div>

            {/* 04: Remote Theft Lock */}
            <div className="flex flex-col justify-between rounded-3xl border border-divider bg-surface/50 p-6 shadow-xs hover:bg-white hover:shadow-card transition-all">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-navy/5 text-navy mb-4">
                  <Radio className="size-5" />
                </div>
                <h3 className="text-h3-m font-bold text-navy mb-2">Instant Theft Protocol</h3>
                <p className="text-caption text-mid leading-relaxed">
                  If your suitcase is taken or lost, toggle Theft Mode immediately. The smart core broadcasts encrypted distress beacons to airline hubs and disables pairing.
                </p>
              </div>
              <span className="mt-4 font-mono text-[10px] text-brand font-semibold">
                04 / THEFT DEFENSE
              </span>
            </div>
          </div>
        </section>

        {/* 5. Frequently Asked Questions */}
        <section className="border-t border-divider py-12 xl:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.8fr]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand font-bold">
                Client Questions
              </span>
              <h2 className="text-h1-m font-bold text-navy xl:text-h1 mt-2">
                Frequently asked questions
              </h2>
              <p className="text-small text-mid mt-3">
                Everything you need to know about ownership, airline compliance, and our Lifetime Guarantee.
              </p>
              <div className="mt-6">
                <Link
                  href="/services/stores"
                  className="inline-flex items-center gap-1.5 text-caption font-semibold text-brand hover:text-navy transition-colors underline underline-offset-4"
                >
                  <span>Need in-person support? Visit a Boutique Hub</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <FaqList items={FAQ} initialOpen={0} />
          </div>
        </section>
      </div>
    </>
  );
}
