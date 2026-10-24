"use client";

import { useEffect, useState } from "react";

type TabKey = "bags" | "updates" | "batch" | "files";

type Device = {
  id: string;
  model: string;
  status: "Paired" | "In stock" | "Disabled";
  battery: string;
  firmware: string;
  claimCode: string;
};

const SAMPLE_DEVICES: Device[] = [
  {
    id: "AMT-C055-00F3A1",
    model: "AMTRAV Carry-on Pro",
    status: "Paired",
    battery: "94%",
    firmware: "v2.4.1",
    claimCode: "CLM-9042-X",
  },
  {
    id: "AMT-CI70-0012B7",
    model: "AMTRAV Check-In 70L",
    status: "In stock",
    battery: "100%",
    firmware: "v2.4.1",
    claimCode: "CLM-1184-K",
  },
  {
    id: "AMT-WK40-1A09C3",
    model: "AMTRAV Weekender 40L",
    status: "Disabled",
    battery: "18%",
    firmware: "v2.3.9",
    claimCode: "REVOKED",
  },
];

const TABS: { id: TabKey; label: string; count?: string }[] = [
  { id: "bags", label: "Bags", count: "8" },
  { id: "updates", label: "Updates", count: "v2.4.1" },
  { id: "batch", label: "New batch", count: "50" },
  { id: "files", label: "Files", count: "4" },
];

export default function BrandDashboardInteractive() {
  const [activeTab, setActiveTab] = useState<TabKey>("bags");
  const [filter, setFilter] = useState<"All" | "Paired" | "In stock" | "Disabled">("All");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [autoDemo, setAutoDemo] = useState(true);
  const [chartHover, setChartHover] = useState<{ point: string; value: string } | null>(null);
  const [generatedBatch, setGeneratedBatch] = useState(false);

  // Auto-demo rotation: cycles tabs every 5 seconds until the user interacts
  useEffect(() => {
    if (!autoDemo) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const order: TabKey[] = ["bags", "updates", "batch", "files"];
        const nextIdx = (order.indexOf(prev) + 1) % order.length;
        return order[nextIdx];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [autoDemo]);

  const handleTabClick = (tab: TabKey) => {
    setAutoDemo(false);
    setActiveTab(tab);
  };

  const filteredDevices = SAMPLE_DEVICES.filter((d) => {
    if (filter === "All") return true;
    return d.status === filter;
  });

  return (
    <div
      role="region"
      aria-label="Interactive Amortrav brand dashboard preview"
      className="w-full max-w-[580px] justify-self-center xl:justify-self-end"
      onPointerDown={() => setAutoDemo(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-[#DCE1EA] bg-white shadow-[0_30px_70px_-30px_rgba(11,27,61,0.25)] transition-all duration-300">
        {/* Window Top Bar */}
        <div className="flex items-center justify-between border-b border-[#EEF0F4] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#FF5F56] transition-opacity hover:opacity-80" />
            <span className="size-2.5 rounded-full bg-[#FFBD2E] transition-opacity hover:opacity-80" />
            <span className="size-2.5 rounded-full bg-[#27C93F] transition-opacity hover:opacity-80" />
            <span className="ml-2 text-xs font-semibold text-[#0B1B3D] tracking-tight">
              Brand dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoDemo((v) => !v)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                autoDemo
                  ? "bg-[#EAF0FF] text-[#1F3FBF] hover:bg-[#D9E5FF]"
                  : "bg-surface text-[#5A6377] hover:bg-[#EEF1F7]"
              }`}
              title="Toggle automatic walkthrough preview"
            >
              {autoDemo ? "Auto-demo: ON" : "Interactive"}
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF1F7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
              <span className="size-1.5 rounded-full bg-brand animate-pulse" />
              Live preview
            </span>
          </div>
        </div>

        {/* Mobile Horizontal Tab Navigation */}
        <div className="flex sm:hidden border-b border-[#EEF0F4] bg-[#FAFBFD] px-2 py-1.5 overflow-x-auto gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#0B1B3D] text-white shadow-sm"
                    : "text-[#4A5266] hover:bg-[#EEF1F7]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-[#E4E7EE] text-[#0B1B3D]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Window Body: Sidebar + Main Content */}
        <div className="flex min-h-[380px]">
          {/* Desktop Left Sidebar */}
          <aside className="hidden w-28 flex-col gap-1 border-r border-[#EEF0F4] p-3 sm:flex sm:w-32 bg-white">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex h-8 items-center justify-between rounded-lg px-2.5 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-[#EEF1F7] font-bold text-[#0B1B3D]"
                      : "font-normal text-[#4A5266] hover:bg-[#FAFBFD] hover:text-[#0B1B3D]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span
                      className={`rounded px-1 text-[10px] ${
                        isActive
                          ? "bg-white text-[#0B1B3D] font-semibold"
                          : "text-[#8A94A6]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="mt-auto border-t border-[#EEF0F4] pt-3 text-[11px] text-[#8A94A6]">
              <span className="block font-medium text-[#0B1B3D]">API v1</span>
              <span>Connected</span>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <main className="flex flex-1 flex-col gap-3.5 bg-[#F6F7F9] p-3.5 sm:gap-4 sm:p-5">
            {/* ── TAB 1: BAGS / DEVICES OVERVIEW ── */}
            {activeTab === "bags" && (
              <div className="flex flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_200ms_ease-out]">
                {/* 3 Top Stat Boxes */}
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoDemo(false);
                      setFilter("All");
                    }}
                    className="p-3 text-left border-r border-[#E4E7EE] sm:p-3.5 hover:bg-[#FAFBFD] transition-colors"
                  >
                    <span className="text-[11px] font-normal text-[#4A5266]">Made</span>
                    <div className="text-xl font-bold text-[#0B1B3D] sm:text-2xl">8</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoDemo(false);
                      setFilter("Paired");
                    }}
                    className="p-3 text-left border-r border-[#E4E7EE] sm:p-3.5 hover:bg-[#FAFBFD] transition-colors"
                  >
                    <span className="text-[11px] font-normal text-[#4A5266]">Paired</span>
                    <div className="text-xl font-bold text-[#1F3FBF] sm:text-2xl">4</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoDemo(false);
                      setFilter("In stock");
                    }}
                    className="p-3 text-left sm:p-3.5 hover:bg-[#FAFBFD] transition-colors"
                  >
                    <span className="text-[11px] font-normal text-[#4A5266]">In stock</span>
                    <div className="text-xl font-bold text-[#4A5266] sm:text-2xl">3</div>
                  </button>
                </div>

                {/* Interactive Wave Chart */}
                <div className="relative overflow-hidden rounded-xl border border-[#E4E7EE] bg-white p-3 sm:p-3.5">
                  <div className="flex items-center justify-between pb-2 text-[11px] text-[#4A5266]">
                    <span className="font-semibold text-[#0B1B3D]">Fleet activation curve</span>
                    <span className="text-[#8A94A6]">
                      {chartHover ? `${chartHover.point}: ${chartHover.value}` : "Hover to inspect"}
                    </span>
                  </div>

                  <div className="relative">
                    <svg
                      viewBox="0 0 300 80"
                      aria-label="Bag activation trend"
                      className="block h-auto w-full cursor-crosshair"
                    >
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#F1F2F5" strokeDasharray="2 2" />
                      <line x1="0" y1="45" x2="300" y2="45" stroke="#F1F2F5" strokeDasharray="2 2" />
                      <line x1="0" y1="70" x2="300" y2="70" stroke="#F1F2F5" strokeDasharray="2 2" />

                      {/* Primary Curve (Registered/Total) */}
                      <path
                        d="M4 66 L30 58 L56 60 L82 46 L108 52 L134 34 L160 42 L186 26 L212 36 L238 18 L264 26 L296 8"
                        fill="none"
                        stroke="#0B1B3D"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />

                      {/* Secondary Curve (Paired) */}
                      <path
                        d="M4 74 L30 70 L56 68 L82 62 L108 66 L134 54 L160 56 L186 46 L212 50 L238 42 L264 38 L296 34"
                        fill="none"
                        stroke="#2A4BD7"
                        strokeOpacity="0.65"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Hoverable Interactive Anchor Points */}
                      {[
                        { x: 30, y: 58, date: "Wk 1", val: "2 bags" },
                        { x: 82, y: 46, date: "Wk 2", val: "4 bags" },
                        { x: 134, y: 34, date: "Wk 3", val: "5 bags" },
                        { x: 186, y: 26, date: "Wk 4", val: "6 bags" },
                        { x: 238, y: 18, date: "Wk 5", val: "7 bags" },
                        { x: 296, y: 8, date: "Today", val: "8 bags (4 paired)" },
                      ].map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          className="fill-[#0B1B3D] transition-transform hover:scale-150 cursor-pointer"
                          onMouseEnter={() => setChartHover({ point: pt.date, value: pt.val })}
                          onMouseLeave={() => setChartHover(null)}
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Serials Status Table with Filter Bar */}
                <div className="overflow-hidden rounded-xl border border-[#E4E7EE] bg-white text-xs">
                  {/* Filter Pills Header */}
                  <div className="flex items-center justify-between border-b border-[#F1F2F5] px-3.5 py-2 bg-[#FAFBFD]">
                    <span className="font-semibold text-[#0B1B3D]">Hardware Registry</span>
                    <div className="flex items-center gap-1">
                      {(["All", "Paired", "In stock", "Disabled"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setAutoDemo(false);
                            setFilter(st);
                          }}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                            filter === st
                              ? "bg-[#0B1B3D] text-white"
                              : "text-[#5A6377] hover:bg-[#EEF1F7]"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Device Rows */}
                  <div className="divide-y divide-[#F1F2F5]">
                    {filteredDevices.map((device) => {
                      const isSelected = selectedDevice === device.id;
                      return (
                        <div key={device.id} className="transition-colors hover:bg-[#FAFBFD]">
                          <button
                            type="button"
                            onClick={() => {
                              setAutoDemo(false);
                              setSelectedDevice(isSelected ? null : device.id);
                            }}
                            className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
                          >
                            <div className="flex flex-col">
                              <span className="font-mono font-medium text-[#0B1B3D]">
                                {device.id}
                              </span>
                              <span className="text-[10px] text-[#8A94A6]">{device.model}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {device.status === "Paired" && (
                                <span className="rounded-full bg-[#EAF0FF] px-2.5 py-0.5 font-semibold text-[#1F3FBF]">
                                  Paired
                                </span>
                              )}
                              {device.status === "In stock" && (
                                <span className="rounded-full bg-[#F1F2F5] px-2.5 py-0.5 font-semibold text-[#4A5266]">
                                  In stock
                                </span>
                              )}
                              {device.status === "Disabled" && (
                                <span className="rounded-full bg-[#FFF1E3] px-2.5 py-0.5 font-semibold text-[#9A4A07]">
                                  Disabled
                                </span>
                              )}
                              <span className="text-[#8A94A6] text-xs">
                                {isSelected ? "▲" : "▼"}
                              </span>
                            </div>
                          </button>

                          {/* Expanded Detail Panel */}
                          {isSelected && (
                            <div className="border-t border-dashed border-[#E4E7EE] bg-[#FAFBFD] px-3.5 py-2 text-[11px] text-[#4A5266] motion-safe:animate-[fade-in_150ms_ease-out]">
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                <div>
                                  <span className="text-[#8A94A6]">Battery:</span>{" "}
                                  <span className="font-semibold text-[#0B1B3D]">
                                    {device.battery}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#8A94A6]">Firmware:</span>{" "}
                                  <span className="font-semibold text-[#0B1B3D]">
                                    {device.firmware}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#8A94A6]">Claim code:</span>{" "}
                                  <span className="font-mono font-semibold text-[#1F3FBF]">
                                    {device.claimCode}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: FIRMWARE UPDATES ── */}
            {activeTab === "updates" && (
              <div className="flex flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_200ms_ease-out]">
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white p-3.5">
                  <div>
                    <span className="text-[11px] text-[#4A5266]">Active release</span>
                    <div className="text-xl font-bold text-[#0B1B3D]">v2.4.1</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#4A5266]">Deployed</span>
                    <div className="text-xl font-bold text-[#1F3FBF]">89%</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#4A5266]">Pending</span>
                    <div className="text-xl font-bold text-[#4A5266]">11%</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E4E7EE] bg-white p-3.5">
                  <div className="flex items-center justify-between pb-2 text-xs font-semibold text-[#0B1B3D]">
                    <span>OTA Channels</span>
                    <span className="text-[10px] text-brand">Staged rollout</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-[#FAFBFD] p-2.5 border border-[#EEF0F4]">
                      <div>
                        <div className="font-medium text-[#0B1B3D]">v2.4.1 (Stable)</div>
                        <div className="text-[11px] text-[#8A94A6]">
                          BLE battery optimization & fix latency
                        </div>
                      </div>
                      <span className="rounded-full bg-[#EAF0FF] px-2 py-0.5 text-[10px] font-semibold text-[#1F3FBF]">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-[#EEF0F4]">
                      <div>
                        <div className="font-medium text-[#0B1B3D]">v2.5.0-rc1 (Staging)</div>
                        <div className="text-[11px] text-[#8A94A6]">
                          Cellular fallback telemetry test
                        </div>
                      </div>
                      <span className="rounded-full bg-[#FAFBFD] px-2 py-0.5 text-[10px] font-semibold text-[#4A5266]">
                        Testing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: NEW BATCH / REGISTRATION ── */}
            {activeTab === "batch" && (
              <div className="flex flex-col gap-3.5 sm:gap-4 motion-safe:animate-[fade-in_200ms_ease-out]">
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#E4E7EE] bg-white p-3.5">
                  <div>
                    <span className="text-[11px] text-[#4A5266]">Batch ID</span>
                    <div className="text-base font-bold text-[#0B1B3D] sm:text-xl">#B-2026-04</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#4A5266]">Allocation</span>
                    <div className="text-base font-bold text-[#1F3FBF] sm:text-xl">50 bags</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#4A5266]">QC Status</span>
                    <div className="text-base font-bold text-[#27C93F] sm:text-xl">100% Pass</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E4E7EE] bg-white p-4">
                  <div className="text-xs font-semibold text-[#0B1B3D]">
                    One-time Claim Code Generator
                  </div>
                  <p className="mt-1 text-[11px] text-[#4A5266]">
                    Generate cryptographically signed card codes to insert into the box before sealing.
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGeneratedBatch(true)}
                      className="rounded-lg bg-[#0B1B3D] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1F3FBF]"
                    >
                      {generatedBatch ? "Codes generated ✓" : "Generate 50 claim codes"}
                    </button>
                    {generatedBatch && (
                      <span className="text-[11px] font-medium text-[#27C93F]">
                        Ready to export CSV
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: PRIVATE SPEC SHEETS & FILES ── */}
            {activeTab === "files" && (
              <div className="flex flex-col gap-2.5 motion-safe:animate-[fade-in_200ms_ease-out]">
                <div className="rounded-xl border border-[#E4E7EE] bg-white p-3.5">
                  <div className="flex items-center justify-between pb-2 text-xs font-semibold text-[#0B1B3D]">
                    <span>Manufacturer Assets & Specs</span>
                    <span className="text-[11px] text-[#8A94A6]">4 files &bull; 4.8 MB</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    {[
                      { name: "AMTRAV_Pro_SpecSheet.pdf", size: "2.4 MB", type: "PDF" },
                      { name: "EU_CE_Declaration_Conformity.pdf", size: "1.1 MB", type: "PDF" },
                      { name: "Assembly_QC_Checklist_v2.xlsx", size: "620 KB", type: "XLSX" },
                      { name: "Firmware_OTA_v2.4.1.bin", size: "640 KB", type: "BIN" },
                    ].map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between rounded-lg border border-[#F1F2F5] bg-[#FAFBFD] px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0B1B3D] shadow-xs">
                            {f.type}
                          </span>
                          <span className="font-medium text-[#0B1B3D]">{f.name}</span>
                        </div>
                        <span className="text-[10px] text-[#8A94A6]">{f.size}</span>
                      </div>
                    ))}
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
