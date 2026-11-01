"use client";

import { useId, useMemo, useState } from "react";
import type { Device, DeviceStatus } from "@/lib/api/types";

type Range = "4" | "8" | "12";

const series: Record<Range, { registered: number[]; claimed: number[] }> = {
  "4": { registered: [9, 10, 11, 12], claimed: [6, 7, 7, 9] },
  "8": {
    registered: [5, 6, 7, 7, 9, 10, 11, 12],
    claimed: [3, 4, 4, 5, 6, 6, 7, 9],
  },
  "12": {
    registered: [3, 4, 5, 7, 6, 9, 9, 11, 10, 12, 13, 14],
    claimed: [2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
  },
};

function points(values: number[], width = 560, height = 172) {
  const maximum = Math.max(...values, 1);
  const minimum = Math.min(...values, 0);
  const range = Math.max(maximum - minimum, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - minimum) / range) * (height - 28) - 14;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function MetricCard({
  label,
  value,
  status,
  note,
}: {
  label: string;
  value: number;
  status: DeviceStatus | "total";
  note: string;
}) {
  return (
    <article className={`metric-card metric-${status}`}>
      <div className="metric-label">
        <span className="metric-dot" aria-hidden="true" />
        {label}
      </div>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function ClaimsCalendar({ devices }: { devices: Device[] }) {
  const claims = useMemo(
    () =>
      new Set(
        devices
          .map((device) => device.claimed_at?.slice(0, 10))
          .filter((date): date is string => Boolean(date)),
      ),
    [devices],
  );
  const days: Array<number | null> = [
    null,
    null,
    null,
    ...Array.from({ length: 31 }, (_, index) => index + 1),
  ];
  return (
    <section className="overview-panel claims-calendar" aria-labelledby="claims-heading">
      <div className="overview-heading">
        <div>
          <h2 id="claims-heading">Claims this month</h2>
          <p>Fictional October 2026 records</p>
        </div>
        <span className="small muted">October</span>
      </div>
      <div className="calendar-grid calendar-weekdays" aria-hidden="true">
        {"MTWTFSS".split("").map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid" aria-label="Claim dates in October 2026">
        {days.map((day, index) => {
          if (day == null)
            return <span key={`empty-${index}`} aria-hidden="true" />;
          const iso = `2026-10-${String(day).padStart(2, "0")}`;
          const claimed = claims.has(iso);
          return (
            <span
              key={day}
              className={claimed ? "calendar-claimed" : undefined}
              aria-current={day === 20 ? "date" : undefined}
              aria-label={claimed ? `October ${day}, bag claimed` : `October ${day}`}
            >
              {day}
            </span>
          );
        })}
      </div>
      <div className="calendar-legend small muted">
        <span><i className="legend-claimed" />Bag claimed</span>
        <span><i className="legend-today" />Preview date</span>
      </div>
    </section>
  );
}

export function DeviceOverview({ devices }: { devices: Device[] }) {
  const [range, setRange] = useState<Range>("12");
  const titleId = useId();
  const totals = useMemo(
    () => ({
      total: devices.length,
      registered: devices.filter((device) => device.status === "registered").length,
      claimed: devices.filter((device) => device.status === "claimed").length,
      revoked: devices.filter((device) => device.status === "revoked").length,
    }),
    [devices],
  );
  const activeSeries = series[range];
  return (
    <div className="device-overview">
      <section className="metrics-grid" aria-label="Device registry summary">
        <MetricCard label="Registered" value={totals.total} status="total" note="Visible demo page" />
        <MetricCard label="Unclaimed" value={totals.registered} status="registered" note="Awaiting ownership" />
        <MetricCard label="Claimed" value={totals.claimed} status="claimed" note="Ownership recorded" />
        <MetricCard label="Revoked" value={totals.revoked} status="revoked" note="Registry access ended" />
      </section>
      <div className="overview-grid">
        <section className="overview-panel trend-panel" aria-labelledby={titleId}>
          <div className="overview-heading">
            <div>
              <h2 id={titleId}>Registered vs claimed</h2>
              <p>Example trend for presentation only—not live telemetry</p>
            </div>
            <label className="range-select">
              <span className="sr-only">Trend range</span>
              <select
                aria-label="Trend range"
                value={range}
                onChange={(event) => setRange(event.target.value as Range)}
              >
                <option value="4">Last 4 weeks</option>
                <option value="8">Last 8 weeks</option>
                <option value="12">Last 12 weeks</option>
              </select>
            </label>
          </div>
          <div className="chart-legend small muted" aria-hidden="true">
            <span><i className="legend-registered" />Registered</span>
            <span><i className="legend-claimed" />Claimed</span>
          </div>
          <svg
            className="registry-chart"
            viewBox="0 0 560 200"
            role="img"
            aria-label={`Example ${range}-week registry trend: registered rises to ${activeSeries.registered.at(-1)}, claimed rises to ${activeSeries.claimed.at(-1)}.`}
          >
            {[34, 82, 130, 178].map((y) => (
              <line key={y} x1="0" y1={y} x2="560" y2={y} className="chart-gridline" />
            ))}
            <polyline points={points(activeSeries.registered)} className="chart-line chart-line-registered" />
            <polyline points={points(activeSeries.claimed)} className="chart-line chart-line-claimed" />
          </svg>
          <div className="chart-axis small muted" aria-hidden="true">
            <span>{range === "12" ? "Aug 3" : `${range} weeks ago`}</span>
            <span>Today</span>
          </div>
        </section>
        <ClaimsCalendar devices={devices} />
      </div>
    </div>
  );
}
