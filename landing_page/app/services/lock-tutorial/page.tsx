"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronUp, ChevronDown, RefreshCw, AlertCircle } from "lucide-react";

export default function LockTutorialPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [dials, setDials] = useState<[number, number, number]>([0, 0, 0]);
  const [resetPressed, setResetPressed] = useState(false);
  const [lockStatus, setLockStatus] = useState<"locked" | "open" | "setting">("open");
  const [savedCombination, setSavedCombination] = useState<[number, number, number]>([0, 0, 0]);

  const changeDial = (index: 0 | 1 | 2, direction: 1 | -1) => {
    setDials((prev) => {
      const next = [...prev] as [number, number, number];
      next[index] = (next[index] + direction + 10) % 10;
      return next;
    });
  };

  const handlePressReset = () => {
    if (dials[0] === savedCombination[0] && dials[1] === savedCombination[1] && dials[2] === savedCombination[2]) {
      setResetPressed(true);
      setCurrentStep(3);
    }
  };

  const handleSlideLatch = () => {
    if (resetPressed) {
      setResetPressed(false);
      setSavedCombination([...dials]);
      setCurrentStep(5);
    } else {
      // Check if current dials match saved combination
      const matches = dials[0] === savedCombination[0] && dials[1] === savedCombination[1] && dials[2] === savedCombination[2];
      setLockStatus(matches ? "open" : "locked");
    }
  };

  return (
    <div className="min-h-screen bg-surface/30 pt-6 sm:pt-8 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-caption text-mid">
          <Link href="/" className="hover:text-navy">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-navy">Services</Link>
          <span>/</span>
          <span className="font-semibold text-navy">TSA Lock Setup</span>
        </div>

        {/* Header */}
        <div className="border-b border-divider pb-8 text-center sm:text-left">
          <h1 className="text-display-m font-bold text-navy md:text-h1">
            Setting Your TSA Combination Lock
          </h1>
          <p className="mt-2 text-small text-mid max-w-2xl">
            Follow this interactive 5-step tutorial to set or reset your personalized 3-digit combination on AMTRAV dual TSA-approved combination locks.
          </p>
        </div>

        {/* Step Progression Pills */}
        <div className="my-8 flex items-center justify-between overflow-x-auto pb-2">
          {[
            { num: 1, label: "Set to 0-0-0" },
            { num: 2, label: "Press Reset Button" },
            { num: 3, label: "Choose New Code" },
            { num: 4, label: "Slide Release Latch" },
            { num: 5, label: "Test Combination" },
          ].map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => setCurrentStep(st.num as typeof currentStep)}
              className="flex flex-col items-center gap-1.5 shrink-0 px-3"
            >
              <div
                className={`flex size-8 items-center justify-center rounded-full text-caption font-bold transition-all ${
                  currentStep === st.num
                    ? "bg-navy text-white ring-2 ring-sky shadow-md"
                    : currentStep > st.num
                    ? "bg-emerald-600 text-white"
                    : "bg-surface border border-divider text-mid"
                }`}
              >
                {currentStep > st.num ? <Check className="size-3.5" /> : st.num}
              </div>
              <span className={`text-[11px] font-semibold ${currentStep === st.num ? "text-navy" : "text-mid"}`}>
                {st.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Simulator & Tutorial Card */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Lock Visual Simulator (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-divider bg-navy p-6 sm:p-8 text-white shadow-hero space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-caption font-mono uppercase text-sky">AMTRAV AEROSPACE TSA 007</span>
              <span
                className={`rounded-full px-3 py-0.5 text-caption font-bold uppercase tracking-wider ${
                  lockStatus === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {lockStatus === "open" ? "Unlocked (Open)" : "Secured (Locked)"}
              </span>
            </div>

            {/* Lock Realistic Chassis */}
            <div className="relative mx-auto max-w-sm rounded-2xl bg-gradient-to-b from-[#222730] to-[#12151b] border-2 border-white/10 p-6 shadow-2xl">
              {/* Reset Pin Button */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-mid uppercase">Reset Button (A)</span>
                <button
                  type="button"
                  onClick={handlePressReset}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-bold transition-all ${
                    resetPressed
                      ? "bg-emerald-500 text-navy ring-2 ring-emerald-300"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <RefreshCw className={`size-3 ${resetPressed ? "animate-spin" : ""}`} />
                  <span>{resetPressed ? "Reset Engaged" : "Press with Pen"}</span>
                </button>
              </div>

              {/* 3 Interactive Dials */}
              <div className="flex items-center justify-center gap-4 py-4 bg-black/40 rounded-xl border border-white/5 my-2">
                {([0, 1, 2] as const).map((idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeDial(idx, 1)}
                      className="rounded-full p-1 text-sky hover:bg-white/10 active:scale-95"
                      aria-label="Increase number"
                    >
                      <ChevronUp className="size-5" />
                    </button>
                    <div className="flex size-14 items-center justify-center rounded-lg bg-gradient-to-b from-[#1a1c22] to-[#0c0d10] border border-white/20 text-2xl font-mono font-bold text-white shadow-inner">
                      {dials[idx]}
                    </div>
                    <button
                      type="button"
                      onClick={() => changeDial(idx, -1)}
                      className="rounded-full p-1 text-sky hover:bg-white/10 active:scale-95"
                      aria-label="Decrease number"
                    >
                      <ChevronDown className="size-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Slide Latch Trigger */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-mid uppercase">TSA Release Slider (B)</span>
                  <p className="text-[10px] text-blue-pale">Slide left to unlock or complete setup</p>
                </div>
                <button
                  type="button"
                  onClick={handleSlideLatch}
                  className="rounded-xl bg-sky px-4 py-2 text-caption font-bold text-navy hover:bg-sky-light active:scale-95 transition-all shadow-md"
                >
                  Slide Latch ◀
                </button>
              </div>
            </div>

            <div className="text-center text-caption text-blue-pale">
              Current Active Passcode: <strong className="font-mono text-white text-small">{savedCombination.join(" - ")}</strong>
            </div>
          </div>

          {/* Tutorial Step Instructions (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-divider bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <span className="text-caption font-mono uppercase text-sky font-bold">Step {currentStep} Guide</span>
              <h3 className="text-h3-m font-bold text-navy">
                {currentStep === 1 && "Align to Factory Setting (0-0-0)"}
                {currentStep === 2 && "Engage the Reset Button"}
                {currentStep === 3 && "Dial Your Secret Combination"}
                {currentStep === 4 && "Slide the TSA Release Latch"}
                {currentStep === 5 && "Verify & Travel Securely"}
              </h3>
            </div>

            <p className="text-small text-mid leading-relaxed">
              {currentStep === 1 &&
                "All new AMTRAV suitcases leave our manufacturing atelier with factory default combination 0-0-0. Use the arrows on the dials to line up 0 - 0 - 0 against the alignment notch."}
              {currentStep === 2 &&
                "With the dials set to your existing combination, use the tip of a ballpoint pen to press down the small reset button (A) until you hear a distinct click."}
              {currentStep === 3 &&
                "Turn the 3 dials to your desired secret 3-digit combination. Make sure to remember this number, as the lock cannot be reset without knowing the current combination."}
              {currentStep === 4 &&
                "Firmly slide the rectangular TSA release latch (B) to the left. The reset button will pop back up with an audible click. Your new combination is now set."}
              {currentStep === 5 &&
                "Turn the dials to any random numbers to lock the case. To open, return the dials to your secret combination and slide the latch!"}
            </p>

            <div className="rounded-2xl bg-surface p-4 border border-divider space-y-2">
              <span className="flex items-center gap-1.5 text-caption font-semibold text-navy">
                <AlertCircle className="size-4 text-sky" /> Forgotten Your Combination?
              </span>
              <p className="text-[12px] text-mid leading-relaxed">
                If you ever forget your combination, visit any of our 100+ AMTRAV boutique stores or official repair centers with your registered luggage certificate. Our technicians can assist with certified reset keys.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/services/stores"
                className="inline-flex items-center gap-1.5 text-small font-semibold text-brand underline underline-offset-4 hover:text-navy"
              >
                Find nearest AMTRAV repair hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}