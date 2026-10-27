"use client";

import { useEffect, useRef, useState } from "react";
import useReducedMotion from "./useReducedMotion";

type TabKey = "bags" | "updates" | "batch" | "files";

type TourStep = {
  tab: TabKey;
  x: number; // percentage
  y: number; // percentage
  action: "click" | "hover";
  delay: number; // ms to dwell
};

const TABS: { id: TabKey; label: string }[] = [
  { id: "bags", label: "Bags" },
  { id: "updates", label: "Updates" },
  { id: "batch", label: "New batch" },
  { id: "files", label: "Files" },
];

const TOUR_STEPS: TourStep[] = [
  // 1. Move to "Bags" tab and click
  { tab: "bags", x: 12, y: 22, action: "click", delay: 2200 },
  // 2. Move into the live wave chart to inspect telemetry
  { tab: "bags", x: 58, y: 48, action: "hover", delay: 2800 },
  // 3. Move to "Updates" tab and click
  { tab: "updates", x: 12, y: 31, action: "click", delay: 2200 },
  // 4. Inspect the OTA rollout progress card
  { tab: "updates", x: 60, y: 52, action: "hover", delay: 2800 },
  // 5. Move to "New batch" tab and click
  { tab: "batch", x: 12, y: 40, action: "click", delay: 2200 },
  // 6. Inspect Card insertion readiness
  { tab: "batch", x: 58, y: 52, action: "hover", delay: 2800 },
  // 7. Move to "Files" tab and click
  { tab: "files", x: 12, y: 49, action: "click", delay: 2200 },
  // 8. Inspect Vault storage quota
  { tab: "files", x: 58, y: 52, action: "hover", delay: 2800 },
];

export default function BrandDashboardInteractive() {
  const [activeTab, setActiveTab] = useState<TabKey>("bags");
  const [stepIndex, setStepIndex] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const [isRealUserHovering, setIsRealUserHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = TOUR_STEPS[stepIndex];

  // Autonomous walkthrough loop: glides the virtual cursor and clicks tabs
  useEffect(() => {
    if (isRealUserHovering || focused || reducedMotion) return;

    let clickTimeout: NodeJS.Timeout | null = null;
    let nextTimeout: NodeJS.Timeout | null = null;
    let releaseTimeout: NodeJS.Timeout | null = null;

    if (currentStep.action === "click") {
      clickTimeout = setTimeout(() => {
        setIsClicking(true);
        setActiveTab(currentStep.tab);
        releaseTimeout = setTimeout(() => setIsClicking(false), 240);
      }, 500);
    }

    nextTimeout = setTimeout(() => {
      setStepIndex((prev) => (prev + 1) % TOUR_STEPS.length);
    }, currentStep.delay);

    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
      if (nextTimeout) clearTimeout(nextTimeout);
      if (releaseTimeout) clearTimeout(releaseTimeout);
    };
  }, [stepIndex, isRealUserHovering, currentStep, focused, reducedMotion]);

  useEffect(() => () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  }, []);

  // When real user interacts, smoothly hide virtual cursor and yield control
  const handleUserSelect = (tab: TabKey) => {
    setActiveTab(tab);
    setIsRealUserHovering(true);

    const matchIdx = TOUR_STEPS.findIndex((s) => s.tab === tab && s.action === "click");
    if (matchIdx !== -1) setStepIndex(matchIdx);

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsRealUserHovering(false);
    }, 6000);
  };

  const isVirtualHovering = !isRealUserHovering && !focused && !reducedMotion && currentStep.action === "hover";

  return (
    <div
      role="region"
      aria-label="Amortrav brand dashboard preview"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className="relative w-full max-w-[560px] justify-self-center font-sans xl:justify-self-end select-none"
      onMouseEnter={() => {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        setIsRealUserHovering(true);
      }}
      onMouseLeave={() => {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => setIsRealUserHovering(false), 2000);
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#DCE1EA] bg-white shadow-[0_30px_70px_-30px_rgba(11,27,61,0.25)]">
        {/* Virtual Animated Mouse Cursor (Autonomous Video Mode) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hidden sm:block"
          style={{
            left: `${currentStep.x}%`,
            top: `${currentStep.y}%`,
            opacity: isRealUserHovering || focused || reducedMotion ? 0 : 1,
            transform: `translate(-3px, -2px) scale(${isClicking ? 0.86 : 1})`,
          }}
        >
          {/* Subtle Click Ripple */}
          {isClicking && !reducedMotion && !focused && (
            <span className="absolute -left-2.5 -top-2.5 size-7 rounded-full bg-[#0B1B3D]/25 animate-ping" />
          )}

          {/* Crisp Dark Pointer with White Border */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-[0_2px_5px_rgba(0,15,40,0.35)]"
          >
            <path
              d="M4 3L11 21L14.5 13.5L22 10L4 3Z"
              fill="#0B1B3D"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Window Top Bar */}
        <div className="flex items-center border-b border-[#EEF0F4] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#FF5F56]" />
            <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="size-2.5 rounded-full bg-[#27C93F]" />
            <span className="ml-2 text-xs font-medium text-[#5A6377]">
              Brand dashboard
            </span>
          </div>
        </div>

        {/* Window Body */}
        <div className="flex min-h-[350px]">
          {/* Sidebar */}
          <aside className="w-28 flex-col gap-1 border-r border-[#EEF0F4] p-3 sm:flex sm:w-32 bg-white">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleUserSelect(tab.id)}
                  className={`flex h-8 w-full items-center rounded-lg px-3 text-left text-xs transition-colors duration-200 cursor-pointer ${
                    active
                      ? "bg-[#EEF1F7] font-semibold text-[#0B1B3D]"
                      : "font-normal text-[#4A5266] hover:bg-[#FAFBFD] hover:text-[#0B1B3D]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Main Dashboard Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-3.5 bg-[#F6F7F9] p-3.5 sm:gap-4 sm:p-5">
            {/* ── TAB 1: BAGS ── */}
            {activeTab === "bags" && (
              <div className="flex flex-1 flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_250ms_ease-out]">
                {/* 3 Stats Boxes */}
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white">
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Made</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      8
                    </div>
                  </div>
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Paired</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      4
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">In stock</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      3
                    </div>
                  </div>
                </div>

                {/* Animated Wave Chart with Live Gliding Telemetry Pulse */}
                <div
                  className={`group relative overflow-hidden rounded-xl border bg-white p-3 sm:p-3.5 transition-all duration-300 ${
                    isVirtualHovering && currentStep.tab === "bags"
                      ? "border-[#0B1B3D]/30 shadow-xs bg-[#FAFBFD]"
                      : "border-[#E4E7EE] hover:border-[#0B1B3D]/30 hover:bg-[#FAFBFD]"
                  }`}
                >
                  {/* Floating Inspection Pill */}
                  <div
                    className={`flex items-center justify-between pb-1 text-[10px] transition-all duration-300 ${
                      isVirtualHovering && currentStep.tab === "bags"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <span className="rounded bg-[#EAF0FF] px-2 py-0.5 font-semibold text-[#1F3FBF]">
                      Live telemetry
                    </span>
                    <span className="font-medium text-[#5A6377]">Today: 8 made, 4 paired</span>
                  </div>

                  <svg viewBox="0 0 300 80" aria-hidden="true" className="block h-auto w-full">
                    {/* Primary Dark Navy Curve */}
                    <path
                      d="M4 66 L30 58 L56 60 L82 46 L108 52 L134 34 L160 42 L186 26 L212 36 L238 18 L264 26 L296 8"
                      fill="none"
                      stroke="#0B1B3D"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Secondary Blue Curve */}
                    <path
                      d="M4 74 L30 70 L56 68 L82 62 L108 66 L134 54 L160 56 L186 46 L212 50 L238 42 L264 38 L296 34"
                      fill="none"
                      stroke="#2A4BD7"
                      strokeOpacity="0.55"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Live Telemetry Pulse traveling smoothly along the line */}
                    <g>
                      <circle r="4" fill="#2A4BD7" opacity="0.35">
                        <animate
                          attributeName="r"
                          values="3;7;3"
                          dur="2.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="2.5" fill="#0B1B3D">
                        <animateMotion
                          dur="4.5s"
                          repeatCount="indefinite"
                          path="M4 66 L30 58 L56 60 L82 46 L108 52 L134 34 L160 42 L186 26 L212 36 L238 18 L264 26 L296 8"
                        />
                      </circle>
                    </g>
                  </svg>
                </div>

                {/* Clean Serials Status Table */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A1
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Paired
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-CI70-0012B7
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      In stock
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-WK40-1A09C3
                    </span>
                    <span className="rounded-full bg-[#FFF1E3] px-2.5 py-0.5 font-medium text-[#9A4A07]">
                      Disabled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: UPDATES ── */}
            {activeTab === "updates" && (
              <div className="flex flex-1 flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_250ms_ease-out]">
                {/* 3 Stats Boxes */}
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white">
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Version</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      v2.4
                    </div>
                  </div>
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Deployed</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      89%
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Pending</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      11%
                    </div>
                  </div>
                </div>

                {/* Firmware Progress Graph with Live Hover Pill */}
                <div
                  className={`group relative flex flex-col justify-center rounded-xl border bg-white p-4 transition-all duration-300 ${
                    isVirtualHovering && currentStep.tab === "updates"
                      ? "border-[#0B1B3D]/30 shadow-xs bg-[#FAFBFD]"
                      : "border-[#E4E7EE] hover:border-[#0B1B3D]/30 hover:bg-[#FAFBFD]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#4A5266]">
                    <span className="font-medium">OTA Rollout progress</span>
                    <span className="font-semibold text-[#0B1B3D] tabular-nums">7 of 8 completed</span>
                  </div>

                  {/* Inspection Pill */}
                  <div
                    className={`mt-1.5 flex items-center justify-between text-[10px] transition-all duration-300 ${
                      isVirtualHovering && currentStep.tab === "updates"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <span className="rounded bg-[#EAF0FF] px-2 py-0.5 font-semibold text-[#1F3FBF]">
                      Stage 3 active • 0 error reports
                    </span>
                    <span className="font-medium text-[#5A6377]">89% deployed</span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div
                      className={`h-full w-[89%] rounded-full transition-colors duration-300 ${
                        isVirtualHovering && currentStep.tab === "updates"
                          ? "bg-[#2A4BD7]"
                          : "bg-[#0B1B3D] group-hover:bg-[#2A4BD7]"
                      }`}
                    />
                  </div>
                </div>

                {/* Release List */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      Firmware v2.4.1
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      Firmware v2.4.0
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      Deployed
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      Firmware v2.3.9
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      Archived
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: NEW BATCH ── */}
            {activeTab === "batch" && (
              <div className="flex flex-1 flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_250ms_ease-out]">
                {/* 3 Stats Boxes */}
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white">
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Batch</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      #04
                    </div>
                  </div>
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Allocated</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      50
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">QC Pass</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      100%
                    </div>
                  </div>
                </div>

                {/* Batch Status Card with Live Hover Reaction */}
                <div
                  className={`group relative flex flex-col justify-center rounded-xl border bg-white p-4 transition-all duration-300 ${
                    isVirtualHovering && currentStep.tab === "batch"
                      ? "border-[#0B1B3D]/30 shadow-xs bg-[#FAFBFD]"
                      : "border-[#E4E7EE] hover:border-[#0B1B3D]/30 hover:bg-[#FAFBFD]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#4A5266]">
                    <span className="font-medium">Card insertion readiness</span>
                    <span className="font-semibold text-[#0B1B3D] tabular-nums">50 of 50 printed</span>
                  </div>

                  {/* Inspection Pill */}
                  <div
                    className={`mt-1.5 flex items-center justify-between text-[10px] transition-all duration-300 ${
                      isVirtualHovering && currentStep.tab === "batch"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <span className="rounded bg-[#EAF0FF] px-2 py-0.5 font-semibold text-[#1F3FBF]">
                      Ready for box sealing ✓
                    </span>
                    <span className="font-medium text-[#5A6377]">50 QR codes signed</span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div
                      className={`h-full w-full rounded-full transition-colors duration-300 ${
                        isVirtualHovering && currentStep.tab === "batch"
                          ? "bg-[#2A4BD7]"
                          : "bg-[#0B1B3D] group-hover:bg-[#2A4BD7]"
                      }`}
                    />
                  </div>
                </div>

                {/* Serials in Batch */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A2
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A3
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A4
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: FILES ── */}
            {activeTab === "files" && (
              <div className="flex flex-1 flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_250ms_ease-out]">
                {/* 3 Stats Boxes */}
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white">
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Manuals</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      3
                    </div>
                  </div>
                  <div className="p-3 border-r border-[#E4E7EE] sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Specs</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      2
                    </div>
                  </div>
                  <div className="p-3 sm:p-3.5">
                    <span className="text-[11px] font-normal text-[#4A5266]">Certs</span>
                    <div className="text-xl font-semibold text-[#0B1B3D] sm:text-2xl tabular-nums">
                      1
                    </div>
                  </div>
                </div>

                {/* Storage Card with Live Hover Reaction */}
                <div
                  className={`group relative flex flex-col justify-center rounded-xl border bg-white p-4 transition-all duration-300 ${
                    isVirtualHovering && currentStep.tab === "files"
                      ? "border-[#0B1B3D]/30 shadow-xs bg-[#FAFBFD]"
                      : "border-[#E4E7EE] hover:border-[#0B1B3D]/30 hover:bg-[#FAFBFD]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#4A5266]">
                    <span className="font-medium">Vault storage</span>
                    <span className="font-semibold text-[#0B1B3D] tabular-nums">4.8 MB of 1 GB</span>
                  </div>

                  {/* Inspection Pill */}
                  <div
                    className={`mt-1.5 flex items-center justify-between text-[10px] transition-all duration-300 ${
                      isVirtualHovering && currentStep.tab === "files"
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <span className="rounded bg-[#EAF0FF] px-2 py-0.5 font-semibold text-[#1F3FBF]">
                      995.2 MB free space (99.5% available)
                    </span>
                    <span className="font-medium text-[#5A6377]">Encrypted & synced</span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div
                      className={`h-full w-[12%] rounded-full transition-colors duration-300 ${
                        isVirtualHovering && currentStep.tab === "files"
                          ? "bg-[#2A4BD7]"
                          : "bg-[#0B1B3D] group-hover:bg-[#2A4BD7]"
                      }`}
                    />
                  </div>
                </div>

                {/* Files List */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      spec-sheet-carryon.pdf
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      2.4 MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      declaration-conformity.pdf
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      1.1 MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-[#FAFBFD]">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      firmware-v2.4.1.bin
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      640 KB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
