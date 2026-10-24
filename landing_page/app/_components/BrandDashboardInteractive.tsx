"use client";

import { useEffect, useRef, useState } from "react";

type TabKey = "bags" | "updates" | "batch" | "files";

const TABS: { id: TabKey; label: string }[] = [
  { id: "bags", label: "Bags" },
  { id: "updates", label: "Updates" },
  { id: "batch", label: "New batch" },
  { id: "files", label: "Files" },
];

export default function BrandDashboardInteractive() {
  const [activeTab, setActiveTab] = useState<TabKey>("bags");
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play demo loop: plays continuously on its own like a product video
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((current) => {
        const order: TabKey[] = ["bags", "updates", "batch", "files"];
        const nextIndex = (order.indexOf(current) + 1) % order.length;
        return order[nextIndex];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  // When user interacts, pause briefly then gently resume auto-play
  const handleUserSelect = (tab: TabKey) => {
    setActiveTab(tab);
    setIsPaused(true);

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 8000);
  };

  return (
    <div
      role="region"
      aria-label="Amortrav brand dashboard preview"
      className="w-full max-w-[560px] justify-self-center font-sans xl:justify-self-end select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => setIsPaused(false), 2000);
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-[#DCE1EA] bg-white shadow-[0_30px_70px_-30px_rgba(11,27,61,0.25)]">
        {/* Window Top Bar - clean & authentic matching Figma */}
        <div className="flex items-center justify-between border-b border-[#EEF0F4] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#DCE1EA]" />
            <span className="size-2 rounded-full bg-[#DCE1EA]" />
            <span className="size-2 rounded-full bg-[#DCE1EA]" />
            <span className="ml-2 text-xs font-medium text-[#5A6377]">
              Brand dashboard
            </span>
          </div>
          <span className="rounded-full bg-blue-pale/80 px-2.5 py-0.5 text-[10px] font-semibold text-brand uppercase tracking-wider">
            Preview
          </span>
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
          <main className="flex flex-1 flex-col gap-3.5 bg-[#F6F7F9] p-3.5 sm:gap-4 sm:p-5">
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
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white p-3 sm:p-3.5">
                  <svg viewBox="0 0 300 80" aria-hidden="true" className="block h-auto w-full">
                    <defs>
                      <path
                        id="mainWavePath"
                        d="M4 66 L30 58 L56 60 L82 46 L108 52 L134 34 L160 42 L186 26 L212 36 L238 18 L264 26 L296 8"
                      />
                    </defs>

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
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A1
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Paired
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-CI70-0012B7
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      In stock
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
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

                {/* Firmware Progress Graph */}
                <div className="flex flex-col justify-center rounded-xl border border-[#E4E7EE] bg-white p-4">
                  <div className="flex items-center justify-between text-[11px] text-[#4A5266]">
                    <span>OTA Rollout progress</span>
                    <span className="font-semibold text-[#0B1B3D]">7 of 8 completed</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div className="h-full w-[89%] rounded-full bg-[#0B1B3D] transition-all duration-500" />
                  </div>
                </div>

                {/* Release List */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      Firmware v2.4.1
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      Firmware v2.4.0
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      Deployed
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
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

                {/* Batch Status Card */}
                <div className="flex flex-col justify-center rounded-xl border border-[#E4E7EE] bg-white p-4">
                  <div className="flex items-center justify-between text-[11px] text-[#4A5266]">
                    <span>Card insertion readiness</span>
                    <span className="font-semibold text-[#0B1B3D]">50 of 50 printed</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div className="h-full w-full rounded-full bg-[#0B1B3D]" />
                  </div>
                </div>

                {/* Serials in Batch */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A2
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D] tabular-nums">
                      AMT-C055-00F3A3
                    </span>
                    <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-medium text-[#1F3FBF]">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
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

                {/* Storage Card */}
                <div className="flex flex-col justify-center rounded-xl border border-[#E4E7EE] bg-white p-4">
                  <div className="flex items-center justify-between text-[11px] text-[#4A5266]">
                    <span>Vault storage</span>
                    <span className="font-semibold text-[#0B1B3D]">4.8 MB of 1 GB</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div className="h-full w-[12%] rounded-full bg-[#0B1B3D]" />
                  </div>
                </div>

                {/* Files List */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      spec-sheet-carryon.pdf
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      2.4 MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2.5">
                    <span className="font-semibold tracking-wide text-[#0B1B3D]">
                      declaration-conformity.pdf
                    </span>
                    <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-medium text-[#4A5266]">
                      1.1 MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
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
          </main>
        </div>
      </div>
    </div>
  );
}
