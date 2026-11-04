"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Device } from "@/lib/console/types";

export function RegistrationChart({ devices, now }: { devices: Device[]; now: Date }) {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const day = (end.getUTCDay() + 6) % 7;
  end.setUTCDate(end.getUTCDate() - day + 7);
  const week = 7 * 86400000;
  const start = end.getTime() - 12 * week;
  const registered = Array<number>(12).fill(0);
  const claimed = Array<number>(12).fill(0);
  for (const device of devices) {
    const r = Math.floor((Date.parse(device.created_at) - start) / week);
    const c = device.claimed_at
      ? Math.floor((Date.parse(device.claimed_at) - start) / week)
      : -1;
    if (r >= 0 && r < 12) registered[r]++;
    if (c >= 0 && c < 12) claimed[c]++;
  }
  const tick = (index: number) =>
    new Date(start + index * week).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  const data = registered.map((count, index) => ({
    week: tick(index),
    registered: count,
    claimed: claimed[index],
  }));

  return (
    <section className="console-card registry-chart">
      <div className="card-heading">
        <h2>Registered vs claimed</h2>
        <span className="subtle-pill">Last 12 weeks</span>
      </div>
      <div className="chart-legend">
        <span>
          <i />
          Registered
        </span>
        <span>
          <i className="orange" />
          Claimed
        </span>
      </div>
      <div className="registration-chart-plot">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={data}
            accessibilityLayer
            aria-label="Weekly registrations and claims over the last 12 weeks"
            margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--c-border)" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={36}
              tick={{ fill: "var(--c-muted)", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={32}
              domain={[0, (maximum: number) => Math.max(4, maximum)]}
              tick={{ fill: "var(--c-muted)", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(label) => `Week of ${label} · UTC`}
              contentStyle={{
                border: "1px solid var(--c-border)",
                background: "var(--c-surface)",
                color: "var(--c-ink)",
                borderRadius: 14,
                padding: "12px 16px",
                boxShadow: "0 8px 24px #001f4d14",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--c-muted)", marginBottom: 6 }}
              cursor={{ stroke: "#a9ccff", strokeDasharray: "4 4" }}
            />
            <Area
              type="linear"
              dataKey="registered"
              name="Registered"
              stroke="var(--c-accent)"
              strokeWidth={3}
              fill="var(--c-accent)"
              fillOpacity={0.06}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--c-surface)" }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="claimed"
              name="Claimed"
              stroke="#e07a2e"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--c-surface)" }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ClaimsCalendar({ devices, now }: { devices: Device[]; now: Date }) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const claimed = new Set(
    devices
      .filter(
        (d) =>
          d.claimed_at &&
          new Date(d.claimed_at).getUTCMonth() === month &&
          new Date(d.claimed_at).getUTCFullYear() === year,
      )
      .map((d) => new Date(d.claimed_at!).getUTCDate()),
  );
  return (
    <section className="console-card claims-calendar">
      <div className="card-heading">
        <h2>Claims this month</h2>
        <span>{now.toLocaleDateString("en", { month: "long", timeZone: "UTC" })}</span>
      </div>
      <div className="calendar-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <small key={i}>{day}</small>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: total }, (_, i) => i + 1).map((day) => (
          <span
            key={day}
            aria-label={`${day}${claimed.has(day) ? ", bag claimed" : ""}${day === now.getUTCDate() ? ", today" : ""}`}
            className={`${claimed.has(day) ? "has-claims" : ""} ${day === now.getUTCDate() ? "today" : ""}`}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="calendar-key">
        <span>● Bag claimed</span>
        <span>○ Today · UTC</span>
      </div>
    </section>
  );
}

export function InventoryDonut({ devices }: { devices: Device[] }) {
  const claimed = devices.filter((d) => d.status === "claimed").length;
  const available = devices.filter((d) => d.status === "unclaimed").length;
  const p = devices.length ? (claimed / devices.length) * 100 : 0;
  const q = devices.length ? (available / devices.length) * 100 : 0;
  return (
    <section className="console-card">
      <div className="card-heading">
        <h2>Ownership overview</h2>
        <span className="subtle-pill">Your inventory</span>
      </div>
      <div className="donut-content">
        <div
          className="inventory-donut"
          role="img"
          aria-label={`${claimed} claimed, ${available} unclaimed, ${devices.length - claimed - available} revoked`}
          style={{
            background: `conic-gradient(#0047ad 0 ${p}%, #a9ccff ${p}% ${p + q}%, var(--c-bg) ${p + q}% 100%)`,
          }}
        >
          <div>
            <strong>{devices.length}</strong>
            <span>registered bags</span>
          </div>
        </div>
        <div className="donut-legend">
          {["claimed", "unclaimed", "revoked"].map((status) => (
            <div key={status}>
              <span className={`status-dot ${status}`} />
              <span>{status}</span>
              <b>{devices.filter((d) => d.status === status).length}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
