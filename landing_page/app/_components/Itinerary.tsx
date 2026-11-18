"use client";

import { useState } from "react";
import { Scale, Lock, PlaneTakeoff, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

interface Step {
  id: string;
  stage: string;
  title: string;
  detail: string;
  telemetry: string;
  status: "completed" | "active" | "flight-safe";
  icon: typeof Scale;
}

const JOURNEY_STEPS: Step[] = [
  {
    id: "weighing",
    stage: "01 · Check-in Hall",
    title: "Instant Self-Weighing",
    detail: "Bags weigh themselves the moment you lift them by the handle. No airport scale surprises.",
    telemetry: "Weight: 18.2 kg (Under 23 kg allowance)",
    status: "completed",
    icon: Scale,
  },
  {
    id: "security",
    stage: "02 · TSA & Gate Access",
    title: "Biometric Fingerprint Unlock",
    detail: "Your biometric print never touches the cloud. Unlock occurs directly on the bag's hardware lock.",
    telemetry: "Hardware Lock: Verified & Armed",
    status: "completed",
    icon: Lock,
  },
  {
    id: "flight-safe",
    stage: "03 · Tarmac & Takeoff",
    title: "One-Touch Flight-Safe Mode",
    detail: "Cellular and Bluetooth radios shut down automatically for takeoff compliance.",
    telemetry: "Radios: OFF · Safe Flight Active",
    status: "flight-safe",
    icon: PlaneTakeoff,
  },
  {
    id: "transit",
    stage: "04 · Cargo Hold & Transfer",
    title: "Cargo Drop & Impact Detection",
    detail: "Onboard 3-axis accelerometer logs impacts, vibration, and tilt during aircraft baggage transfers.",
    telemetry: "0 Heavy Impacts · Flight G-force Normal",
    status: "completed",
    icon: ShieldAlert,
  },
  {
    id: "carousel",
    stage: "05 · Destination Carousel",
    title: "Baggage Claim Alert",
    detail: "Radios power back up upon landing and notify your phone as your suitcase hits the carousel.",
    telemetry: "Proximity: 3.4m away · Carousel 04",
    status: "completed",
    icon: CheckCircle2,
  },
];

export default function Itinerary({ className = "" }: { className?: string }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = JOURNEY_STEPS[activeStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <div className={`overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card transition-all sm:p-8 ${className}`}>
      <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-caption font-mono uppercase tracking-wider text-brand">Live Journey Simulation</span>
          <h3 className="text-h3 font-semibold text-navy">Flight Leg: JFK → LHR (London Heathrow)</h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveStepIndex((prev) => (prev + 1) % JOURNEY_STEPS.length)}
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-brand/20 bg-white px-3.5 py-1.5 text-caption font-medium text-brand transition-colors hover:bg-blue-pale sm:self-auto"
        >
          <RefreshCw className="size-3.5" />
          <span>Next Stage</span>
        </button>
      </div>

      {/* Progress Track */}
      <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {JOURNEY_STEPS.map((step, idx) => {
          const isCurrent = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStepIndex(idx)}
              className={`flex flex-col gap-1 rounded-2xl border p-3 text-left transition-all ${
                isCurrent
                  ? "border-sky bg-navy text-white shadow-md ring-2 ring-sky/20"
                  : isPassed
                  ? "border-line bg-white text-navy hover:border-brand/40"
                  : "border-line/40 bg-surface/50 text-mid opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-medium ${isCurrent ? "text-sky" : "text-mid"}`}>
                  0{idx + 1}
                </span>
                {isPassed && <CheckCircle2 className="size-3.5 text-success" />}
              </div>
              <span className="truncate text-caption font-semibold">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Callout */}
      <div className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-pale text-brand">
            <StepIcon className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption font-mono uppercase tracking-wide text-mid">{activeStep.stage}</span>
            <h4 className="text-h4 font-bold text-navy">{activeStep.title}</h4>
            <p className="max-w-xl text-body-m text-mid">{activeStep.detail}</p>
          </div>
        </div>

        {/* Telemetry Pill */}
        <div className="shrink-0 rounded-2xl border border-sky/30 bg-blue-pale/50 px-4 py-3">
          <span className="block text-[11px] font-mono uppercase text-mid">Onboard Telemetry</span>
          <span className="font-mono text-caption font-semibold text-navy">{activeStep.telemetry}</span>
        </div>
      </div>
    </div>
  );
}
