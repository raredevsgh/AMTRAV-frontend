"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Plus, ArrowUpRight, Radio, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useConsole, useDevices } from "./provider";
import { DeviceSearch, Inventory } from "./inventory";
import { PageHeading, LoadingState, ErrorState } from "./shared";
import { RegistrationChart, ClaimsCalendar, InventoryDonut } from "./registry-charts";
import { useConsoleStore } from "@/stores/console-store";

export function Dashboard({ inventoryOnly = false }: { inventoryOnly?: boolean }) {
  const { user, base, preview } = useConsole();
  const query = useDevices();
  const setStatus = useConsoleStore((s) => s.setStatus);
  const [now] = useState(() => (preview ? new Date("2026-10-20T12:00:00Z") : new Date()));
  const maker = user.role === "manufacturer";
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const devices = query.data;
  const weekStart = now.getTime() - 7 * 86400000;
  const stats = [
    {
      label: "Registered",
      value: devices.length,
      detail: `${devices.filter((d) => Date.parse(d.created_at) >= weekStart).length} added in the last 7 days`,
      status: "all",
    },
    {
      label: "Unclaimed",
      value: devices.filter((d) => d.status === "unclaimed").length,
      detail: "Ready for their first journey",
      status: "unclaimed",
    },
    {
      label: "Claimed",
      value: devices.filter((d) => d.status === "claimed").length,
      detail: "Paired to their owners",
      status: "claimed",
    },
    {
      label: "Revoked",
      value: devices.filter((d) => d.status === "revoked").length,
      detail: "Removed from active service",
      status: "revoked",
    },
  ];
  return (
    <>
      <PageHeading
        title={
          inventoryOnly ? "Devices" : maker ? "Your fleet, at a glance." : "Hey, ops team"
        }
        description={
          maker
            ? "Every bag you’ve registered, all in one place."
            : "Here is every bag in the registry right now."
        }
      >
        <DeviceSearch />
        <Link className="console-button" href={`${base}/register`}>
          <Plus size={17} /> Register device
        </Link>
      </PageHeading>
      {!inventoryOnly && (
        <>
          <section className="stat-grid" aria-label="Fleet totals">
            {stats.map((stat, index) => (
              <button
                className="stat-card"
                key={stat.label}
                onClick={() => {
                  setStatus(stat.status);
                  document
                    .getElementById("inventory")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div>
                  <span className={`stat-icon stat-${index}`} />
                  <span>{stat.label}</span>
                  <ArrowUpRight size={17} />
                </div>
                <strong>
                  <NumberFlow value={stat.value} locales="en" />
                </strong>
                <small>{stat.detail}</small>
              </button>
            ))}
          </section>
          {maker ? (
            <div className="dashboard-two-col">
              <InventoryDonut devices={devices} />
              <section className="console-card maker-readiness">
                <ShieldCheck size={30} />
                <span className="eyebrow">BUILT FOR THE HANDOFF</span>
                <h2>
                  From your factory
                  <br />
                  to their next flight.
                </h2>
                <p>
                  Register a serial, save the claim code, and ship the bag. Your customer
                  pairs it in the app.
                </p>
                <Link href={`${base}/register`}>
                  Register your next bag <ArrowUpRight size={17} />
                </Link>
              </section>
            </div>
          ) : (
            <div className="dashboard-chart-row">
              <RegistrationChart devices={devices} now={now} />
              <ClaimsCalendar devices={devices} now={now} />
            </div>
          )}
          {maker && (
            <div className="telemetry-notice">
              <span className="telemetry-icon">
                <Radio size={22} />
              </span>
              <div>
                <strong>More of your fleet, coming into view.</strong>
                <p>
                  Live location, power states, connectivity and device alerts will appear
                  once telemetry is available.
                </p>
              </div>
              <span className="subtle-pill">Coming soon</span>
            </div>
          )}
        </>
      )}
      <div id="inventory">
        <Inventory devices={devices} />
      </div>
    </>
  );
}
