"use client";

// AMTRAV TRACE for staff: fleet health, impact review, the alerts travellers received,
// landing-page leads, and one bag's live state, thresholds and calibration history.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BatteryLow,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Download,
  Gauge,
  Inbox,
  Radio,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { api, ApiError } from "@/lib/console/api";
import {
  previewAlerts,
  previewFleetHealth,
  previewImpacts,
  previewLeads,
} from "@/lib/console/trace-demo";
import type {
  AlertCategory,
  AlertRecord,
  BagActivity,
  BagStatus,
  Device,
  DeviceConfig,
  FleetHealth,
  ImpactOutcome,
  ImpactReading,
  ImpactReview,
  Lead,
  Severity,
} from "@/lib/console/types";
import { useConsole } from "./provider";
import { AdminOnly, dateLabel, ErrorState, LoadingState, PageHeading, Tabs, timeLabel } from "./shared";
import { ConsoleSelect } from "./select";

const PAGE = 50;

/** "4 min ago", "3 h ago", "2 days ago". */
export function agoLabel(value: string | null, now: number) {
  if (!value) return "Never";
  const minutes = Math.round((now - Date.parse(value)) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

const severityLabel: Record<Severity, string> = { light: "Light", moderate: "Moderate", severe: "Severe" };
const restingLabel: Record<string, string> = {
  upright: "Upright",
  on_side: "On its side",
  upside_down: "Upside down",
};
const categoryLabel: Record<AlertCategory, string> = {
  impact: "Impact",
  tamper: "Opened",
  separation: "Left behind",
  battery: "Battery",
  theft: "Theft Mode",
  geofence: "Safe zone",
  weight: "Weight",
  journey: "Journey",
  transfer: "New owner",
  tracker: "Tracker",
};
const viaLabel = { cellular: "Cellular", wifi: "Wi-Fi", phone: "Owner’s phone" };


function bagLabel(row: { nickname: string | null; serial_number: string }) {
  return row.nickname ? `${row.nickname} · ${row.serial_number}` : row.serial_number;
}

function LoadMore({
  hasMore,
  loading,
  onLoad,
  count,
  noun,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoad: () => void;
  count: number;
  noun: string;
}) {
  return (
    <div className="table-footer">
      <p>
        {count} {noun} shown
      </p>
      <div>
        {hasMore ? (
          <button className="console-secondary" disabled={loading} onClick={onLoad}>
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : (
          <span>That’s everything.</span>
        )}
      </div>
    </div>
  );
}

const healthFilters = [
  { value: "all", label: "All bags" },
  { value: "stale", label: "Not reporting" },
  { value: "low_battery", label: "Low battery" },
  { value: "uncalibrated", label: "Uncalibrated" },
  { value: "theft_mode", label: "Theft Mode" },
] as const;
type HealthFilter = (typeof healthFilters)[number]["value"];

/** Battery, last communication, calibration and firmware for every bag. */
export function FleetHealthPage() {
  const { user, base, preview } = useConsole();
  const [filter, setFilter] = useState<HealthFilter>("all");
  const [page, setPage] = useState(0);
  const health = useQuery({
    queryKey: ["fleet-health", filter, page, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve(previewFleetHealth)
        : api<FleetHealth>(`admin/fleet/health?filter=${filter}&limit=${PAGE}&offset=${page * PAGE}`, { signal }),
    enabled: user.role === "admin",
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
  if (user.role !== "admin") return <AdminOnly what="Fleet health" />;
  const counts = health.data?.counts;
  const tiles: { label: string; value: number | undefined; detail: string; filter: HealthFilter }[] = [
    { label: "Reporting", value: counts?.reporting, detail: `of ${counts?.total ?? "—"} bags in the last 24 h`, filter: "all" },
    { label: "Not reporting", value: counts?.stale, detail: "Claimed, silent for 24 h", filter: "stale" },
    { label: "Low battery", value: counts?.low_battery, detail: "At or below their alert level", filter: "low_battery" },
    { label: "Uncalibrated", value: counts?.uncalibrated, detail: "Scale not zeroed in 6 months", filter: "uncalibrated" },
  ];
  const choose = (next: HealthFilter) => {
    setFilter(next);
    setPage(0);
  };
  return (
    <>
      <PageHeading
        title="Fleet health"
        description="Battery, last communication, calibration and firmware across every bag, refreshed every minute."
      >
        {counts ? (
          <span className="subtle-pill">
            {counts.on_journey} on a journey · {counts.theft_mode} in Theft Mode
          </span>
        ) : null}
      </PageHeading>
      <section className="stat-grid" aria-label="Fleet health totals">
        {tiles.map((tile, index) => (
          <button className="stat-card" key={tile.label} onClick={() => choose(tile.filter)}>
            <div>
              <span className={`stat-icon stat-${index}`} />
              <span>{tile.label}</span>
            </div>
            <strong>{tile.value?.toLocaleString() ?? "—"}</strong>
            <small>{tile.detail}</small>
          </button>
        ))}
      </section>
      <section className="console-card inventory-card">
        <div className="card-heading">
          <h2>Bags</h2>
          <Tabs value={filter} options={[...healthFilters]} onChange={choose} label="Filter bags" />
        </div>
        {health.isPending ? (
          <LoadingState />
        ) : health.isError ? (
          <ErrorState message={health.error.message} retry={() => health.refetch()} />
        ) : !health.data.devices.length ? (
          <div className="console-empty">
            <Gauge size={30} />
            <p>No bags match this view.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Bag</th>
                  <th>Owner</th>
                  <th>Battery</th>
                  <th>Last heard</th>
                  <th>Link</th>
                  <th>Firmware</th>
                  <th>Calibrated</th>
                  <th>Now</th>
                </tr>
              </thead>
              <tbody>
                {health.data.devices.map((row) => (
                  <tr key={row.device_id}>
                    <td>
                      <Link className="serial-link" href={`${base}/devices/${row.device_id}`}>
                        {bagLabel(row)}
                      </Link>
                      <div className="cell-sub">{row.model}</div>
                    </td>
                    <td className="maker-cell">{row.owner_email ?? "Unclaimed"}</td>
                    <td>
                      {row.battery_pct == null ? (
                        "—"
                      ) : (
                        <span className={`battery-meter ${row.battery_pct <= 20 && !row.charging ? "low" : ""}`}>
                          <i style={{ width: `${row.battery_pct}%` }} />
                          {row.battery_pct}%{row.charging ? " ⚡" : ""}
                        </span>
                      )}
                    </td>
                    <td title={row.last_seen_at ? timeLabel(row.last_seen_at) : undefined}>
                      {agoLabel(row.last_seen_at, health.dataUpdatedAt)}
                    </td>
                    <td>{row.via ? viaLabel[row.via] : "—"}</td>
                    <td>
                      <span className="mono">{row.firmware ?? row.registry_firmware}</span>
                      {row.firmware && row.firmware !== row.registry_firmware ? (
                        <div className="cell-sub">registered {row.registry_firmware}</div>
                      ) : null}
                    </td>
                    <td>{row.calibrated_at ? dateLabel(row.calibrated_at) : <span className="trace-badge warn">Never</span>}</td>
                    <td className="trace-flags">
                      {row.journey_active ? <span className="trace-badge lime">On a journey</span> : null}
                      {row.theft_mode ? <span className="trace-badge severe">Theft Mode</span> : null}
                      {!row.journey_active && !row.theft_mode ? <span className="cell-sub">—</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <p>Revoked bags are not listed.</p>
          <div>
            <span>Page {page + 1}</span>
            <button aria-label="Previous page" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft size={16} />
            </button>
            <button
              aria-label="Next page"
              disabled={(health.data?.devices.length ?? 0) < PAGE}
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/** Impacts across the fleet, worst first if filtered: for claims and handling reviews. */
export function ImpactsPage() {
  const { user, base, preview } = useConsole();
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const impacts = useInfiniteQuery({
    queryKey: ["impacts", severity, preview],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => {
      if (preview)
        return Promise.resolve(previewImpacts.filter((row) => severity === "all" || row.severity === severity));
      const params = new URLSearchParams({ limit: String(PAGE) });
      if (severity !== "all") params.set("severity", severity);
      if (pageParam) params.set("before", String(pageParam));
      return api<ImpactReview[]>(`admin/impacts?${params}`, { signal });
    },
    getNextPageParam: (last) => (last.length === PAGE ? last[last.length - 1].id : undefined),
    enabled: user.role === "admin",
  });
  if (user.role !== "admin") return <AdminOnly what="Impacts" />;
  const rows = impacts.data?.pages.flat() ?? [];
  return (
    <>
      <PageHeading
        title="Impact review"
        description="Every knock and drop the fleet recorded, graded by each bag’s thresholds. Use it for damage claims and to spot rough handling."
      />
      <section className="console-card inventory-card">
        <div className="card-heading">
          <h2>Impacts</h2>
          <Tabs
            label="Filter by severity"
            value={severity}
            onChange={setSeverity}
            options={[
              { value: "all", label: "All" },
              { value: "severe", label: "Severe" },
              { value: "moderate", label: "Moderate" },
              { value: "light", label: "Light" },
            ]}
          />
        </div>
        {impacts.isPending ? (
          <LoadingState />
        ) : impacts.isError ? (
          <ErrorState message={impacts.error.message} retry={() => impacts.refetch()} />
        ) : !rows.length ? (
          <div className="console-empty">
            <Zap size={30} />
            <p>No impacts recorded{severity === "all" ? "" : ` at ${severity} severity`}.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Bag</th>
                  <th>Owner</th>
                  <th>Peak</th>
                  <th>Severity</th>
                  <th>Came to rest</th>
                  <th>Where</th>
                  <th>Journey</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{timeLabel(row.occurred_at)}</td>
                    <td>
                      <Link className="serial-link" href={`${base}/devices/${row.device_id}`}>
                        {bagLabel(row)}
                      </Link>
                    </td>
                    <td className="maker-cell">{row.owner_email ?? "Unclaimed"}</td>
                    <td className="mono">{row.impact_g != null ? `${row.impact_g.toFixed(1)} g` : "—"}</td>
                    <td>
                      {row.severity ? <span className={`trace-badge ${row.severity}`}>{severityLabel[row.severity]}</span> : "—"}
                    </td>
                    <td>{row.orientation ? restingLabel[row.orientation] ?? row.orientation : "—"}</td>
                    <td>
                      {row.latitude != null && row.longitude != null ? (
                        <a
                          className="serial-link"
                          href={`https://www.openstreetmap.org/?mlat=${row.latitude}&mlon=${row.longitude}#map=15/${row.latitude}/${row.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.journey_id ? <span className="trace-badge lime">During a journey</span> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <LoadMore
          hasMore={!!impacts.hasNextPage}
          loading={impacts.isFetchingNextPage}
          onLoad={() => impacts.fetchNextPage()}
          count={rows.length}
          noun="impacts"
        />
      </section>
    </>
  );
}

const categories = Object.keys(categoryLabel) as AlertCategory[];

/** What travellers were told about their bags, for support and investigation. */
export function AlertsPage() {
  const { user, base, preview } = useConsole();
  const [category, setCategory] = useState<AlertCategory | "all">("all");
  const alerts = useInfiniteQuery({
    queryKey: ["fleet-alerts", category, preview],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => {
      if (preview)
        return Promise.resolve(previewAlerts.filter((row) => category === "all" || row.category === category));
      const params = new URLSearchParams({ limit: String(PAGE) });
      if (category !== "all") params.set("category", category);
      if (pageParam) params.set("before", String(pageParam));
      return api<AlertRecord[]>(`admin/alerts?${params}`, { signal });
    },
    getNextPageParam: (last) => (last.length === PAGE ? last[last.length - 1].id : undefined),
    enabled: user.role === "admin",
  });
  if (user.role !== "admin") return <AdminOnly what="Alerts" />;
  const rows = alerts.data?.pages.flat() ?? [];
  return (
    <>
      <PageHeading
        title="Alerts"
        description="Every alert travellers received about their bags, with whether they’ve seen it. Emails go out unless the traveller turned them off."
      />
      <section className="console-card inventory-card">
        <div className="card-heading">
          <h2>Sent alerts</h2>
          <Tabs
            label="Filter by kind"
            value={category}
            onChange={setCategory}
            options={[{ value: "all" as const, label: "All" }, ...categories.map((value) => ({ value, label: categoryLabel[value] }))]}
          />
        </div>
        {alerts.isPending ? (
          <LoadingState />
        ) : alerts.isError ? (
          <ErrorState message={alerts.error.message} retry={() => alerts.refetch()} />
        ) : !rows.length ? (
          <div className="console-empty">
            <BellRing size={30} />
            <p>No alerts sent{category === "all" ? "" : ` of this kind`} yet.</p>
          </div>
        ) : (
          <ul className="alert-list">
            {rows.map((row) => (
              <li key={row.id}>
                <span className={`trace-badge cat-${row.category ?? "journey"}`}>
                  {row.category ? categoryLabel[row.category] : "Alert"}
                </span>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.body}</p>
                  <small>
                    {timeLabel(row.created_at)} · {row.owner_email}
                    {row.device_id && row.serial_number ? (
                      <>
                        {" · "}
                        <Link className="serial-link" href={`${base}/devices/${row.device_id}`}>
                          {row.serial_number}
                        </Link>
                      </>
                    ) : null}
                  </small>
                </div>
                <span className={`read-state ${row.read_at ? "read" : ""}`}>{row.read_at ? "Seen" : "Unread"}</span>
              </li>
            ))}
          </ul>
        )}
        <LoadMore
          hasMore={!!alerts.hasNextPage}
          loading={alerts.isFetchingNextPage}
          onLoad={() => alerts.fetchNextPage()}
          count={rows.length}
          noun="alerts"
        />
      </section>
    </>
  );
}

const leadKinds = {
  founding_traveller: "Founding Traveller",
  investor: "Investor",
  partner: "Partner",
};

function csv(rows: Lead[]) {
  const cell = (value: string | null) => `"${(value ?? "").replaceAll('"', '""')}"`;
  const header = ["received", "type", "name", "email", "company", "country", "product", "message"];
  return [
    header.join(","),
    ...rows.map((row) =>
      [row.created_at, row.kind, row.name, row.email, row.company, row.country, row.product, row.message].map(cell).join(","),
    ),
  ].join("\n");
}

/** Founding Traveller sign-ups and investor or partnership enquiries from the website. */
export function LeadsPage() {
  const { user, preview } = useConsole();
  const [kind, setKind] = useState<Lead["kind"] | "all">("all");
  const leads = useInfiniteQuery({
    queryKey: ["leads", kind, preview],
    initialPageParam: "",
    queryFn: ({ pageParam, signal }) => {
      if (preview) return Promise.resolve(previewLeads.filter((row) => kind === "all" || row.kind === kind));
      const params = new URLSearchParams({ limit: String(PAGE) });
      if (kind !== "all") params.set("kind", kind);
      if (pageParam) params.set("before", pageParam);
      return api<Lead[]>(`admin/leads?${params}`, { signal });
    },
    getNextPageParam: (last) => (last.length === PAGE ? last[last.length - 1].created_at : undefined),
    enabled: user.role === "admin",
  });
  if (user.role !== "admin") return <AdminOnly what="Leads" />;
  const rows = leads.data?.pages.flat() ?? [];
  function download() {
    const blob = new Blob([csv(rows)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `amortrav-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  return (
    <>
      <PageHeading
        title="Leads"
        description="Founding Traveller sign-ups and investor or partnership enquiries from the website. Sending the form again updates the same lead."
      >
        <button className="console-secondary" onClick={download} disabled={!rows.length}>
          <Download size={16} /> Export CSV
        </button>
      </PageHeading>
      <section className="console-card inventory-card">
        <div className="card-heading">
          <h2>Enquiries</h2>
          <Tabs
            label="Filter by type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All" },
              { value: "founding_traveller", label: "Founding Travellers" },
              { value: "investor", label: "Investors" },
              { value: "partner", label: "Partners" },
            ]}
          />
        </div>
        {leads.isPending ? (
          <LoadingState />
        ) : leads.isError ? (
          <ErrorState message={leads.error.message} retry={() => leads.refetch()} />
        ) : !rows.length ? (
          <div className="console-empty">
            <Inbox size={30} />
            <p>No sign-ups or enquiries yet.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Country</th>
                  <th>Interested in</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{timeLabel(row.created_at)}</td>
                    <td>
                      <span className={`trace-badge ${row.kind === "founding_traveller" ? "lime" : "info"}`}>
                        {leadKinds[row.kind]}
                      </span>
                    </td>
                    <td>{row.name}</td>
                    <td>
                      <a className="serial-link" href={`mailto:${row.email}`}>
                        {row.email}
                      </a>
                    </td>
                    <td>{row.company ?? "—"}</td>
                    <td>{row.country ?? "—"}</td>
                    <td>{row.product ? row.product[0].toUpperCase() + row.product.slice(1) : "—"}</td>
                    <td className="message-cell" title={row.message ?? undefined}>
                      {row.message ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <LoadMore
          hasMore={!!leads.hasNextPage}
          loading={leads.isFetchingNextPage}
          onLoad={() => leads.fetchNextPage()}
          count={rows.length}
          noun="leads"
        />
      </section>
    </>
  );
}

function Fact({ label, children, warn }: { label: string; children: ReactNode; warn?: boolean }) {
  return (
    <div className={`trace-fact ${warn ? "warn" : ""}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const thresholdFields: { key: keyof Omit<DeviceConfig, "updated_at">; label: string; unit: string; step: string }[] = [
  { key: "impact_light_g", label: "Light impact from", unit: "g", step: "0.5" },
  { key: "impact_moderate_g", label: "Moderate from", unit: "g", step: "0.5" },
  { key: "impact_severe_g", label: "Severe from", unit: "g", step: "0.5" },
  { key: "report_interval_s", label: "Report every", unit: "s", step: "30" },
  { key: "separation_delay_s", label: "Left behind after", unit: "s", step: "5" },
  { key: "low_battery_pct", label: "Low battery at", unit: "%", step: "1" },
  { key: "impact_merge_ms", label: "Merge knocks within", unit: "ms", step: "100" },
  { key: "impact_max_duration_ms", label: "Longest impact pulse", unit: "ms", step: "10" },
  { key: "impact_min_samples", label: "Samples over light", unit: "", step: "1" },
];

function ThresholdsForm({ id, config }: { id: string; config: DeviceConfig }) {
  const queryClient = useQueryClient();
  const { preview } = useConsole();
  const [values, setValues] = useState(() =>
    Object.fromEntries(thresholdFields.map((field) => [field.key, String(config[field.key])])),
  );
  const save = useMutation({
    mutationFn: () =>
      api<DeviceConfig>(`admin/devices/${id}/config`, {
        method: "PATCH",
        body: JSON.stringify(Object.fromEntries(thresholdFields.map((field) => [field.key, Number(values[field.key])]))),
      }),
    onSuccess: (saved) => queryClient.setQueryData(["device-config", id], saved),
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!preview) save.mutate();
  }
  return (
    <form className="console-form thresholds" onSubmit={submit}>
      <div className="threshold-grid">
        {thresholdFields.map((field) => (
          <label key={field.key} className="field">
            <span>{field.label}</span>
            <div className="unit-input">
              <input
                className="console-input"
                type="number"
                step={field.step}
                value={values[field.key]}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              />
              <i>{field.unit}</i>
            </div>
          </label>
        ))}
      </div>
      {save.isError ? (
        <p role="alert" className="console-alert error">
          {save.error instanceof ApiError ? save.error.message : "Couldn’t save the thresholds."}
        </p>
      ) : save.isSuccess ? (
        <p role="status" className="console-alert">
          Saved. The bag picks up the new values with its next upload.
        </p>
      ) : null}
      <div className="form-actions">
        <small>{config.updated_at ? `Last changed ${timeLabel(config.updated_at)}` : "Using the fleet defaults"}</small>
        <button className="console-button" disabled={save.isPending || preview}>
          {save.isPending ? "Saving…" : "Save thresholds"}
        </button>
      </div>
    </form>
  );
}

function useAdminView() {
  const { user, preview } = useConsole();
  return user.role === "admin" && !preview;
}

/** One bag's live state and Travel-Ready checks (admins). */
export function DeviceLiveState({ id }: { id: string }) {
  const admin = useAdminView();
  const status = useQuery({
    queryKey: ["device-status", id],
    queryFn: ({ signal }) => api<BagStatus>(`devices/${id}/status`, { signal }),
    enabled: admin,
    refetchInterval: 30_000,
  });

  if (!admin)
    return (
      <section className="console-card live-state">
        <Radio size={25} />
        <h2>Live state</h2>
        <p>Battery, last communication, impacts and calibration for this bag are visible to Amortrav administrators.</p>
      </section>
    );

  const state = status.data?.state;
  // Relative times are measured from when this was fetched, so renders stay pure.
  const now = status.dataUpdatedAt;
  return (
    <section className="console-card trace-live">
      <div className="card-heading">
        <h2>
          <Radio size={18} /> Live state
        </h2>
        {status.data ? (
          <span className={`trace-badge ${status.data.ready ? "lime" : "warn"}`}>
            {status.data.ready ? "Travel-Ready" : "Not travel-ready"}
          </span>
        ) : null}
      </div>
      {status.isPending ? (
        <LoadingState />
      ) : status.isError ? (
        <ErrorState message={status.error.message} retry={() => status.refetch()} />
      ) : !state ? (
        <p className="cell-sub">This bag hasn’t sent any telemetry yet.</p>
      ) : (
        <>
          <dl className="trace-facts">
            <Fact label="Battery" warn={state.battery_pct != null && state.battery_pct <= 20 && !state.charging}>
              {state.battery_pct != null ? `${state.battery_pct}%${state.charging ? ", charging" : ""}` : "—"}
            </Fact>
            <Fact label="Last heard" warn={!state.last_seen_at || now - Date.parse(state.last_seen_at) > 86_400_000}>
              {agoLabel(state.last_seen_at, now)}
            </Fact>
            <Fact label="Link">{state.via ? viaLabel[state.via] : "—"}</Fact>
            <Fact label="Firmware">{state.firmware ?? "—"}</Fact>
            <Fact label="Lock">{state.locked == null ? "—" : state.locked ? "Locked" : "Unlocked"}</Fact>
            <Fact label="Owner’s phone">{state.owner_nearby == null ? "—" : state.owner_nearby ? "Nearby" : "Out of range"}</Fact>
            <Fact label="Weight">
              {state.weight_g != null ? `${(state.weight_g / 1000).toFixed(1)} kg` : "—"}
              {status.data.settings.weight_limit_g ? ` of ${(status.data.settings.weight_limit_g / 1000).toFixed(0)} kg` : ""}
            </Fact>
            {state.weight_error ? (
              <Fact label="Last lift" warn>
                {liftLabel[state.weight_error]} {agoLabel(state.weight_error_at ?? null, now)}
              </Fact>
            ) : null}
            <Fact label="Calibrated" warn={!state.calibrated_at}>
              {state.calibrated_at ? dateLabel(state.calibrated_at) : "Never"}
            </Fact>
            <Fact label="Theft Mode" warn={status.data.settings.theft_mode}>
              {status.data.settings.theft_mode ? "On" : "Off"}
            </Fact>
            <Fact label="Journey">{status.data.journey ? status.data.journey.name ?? "Under way" : "None"}</Fact>
            <Fact label="Last impact">{agoLabel(state.last_impact_at, now)}</Fact>
            <Fact label="Last opened">{agoLabel(state.last_tamper_at, now)}</Fact>
          </dl>
          {status.data.checks.some((check) => !check.ok) ? (
            <ul className="trace-checks">
              {status.data.checks
                .filter((check) => !check.ok)
                .map((check) => (
                  <li key={check.key}>
                    <BatteryLow size={14} /> {check.label}
                  </li>
                ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}

/** One bag's thresholds, calibration history and recent impacts (admins). */
export function DeviceTraceDetails({ id }: { id: string }) {
  const admin = useAdminView();
  const config = useQuery({
    queryKey: ["device-config", id],
    queryFn: ({ signal }) => api<DeviceConfig>(`admin/devices/${id}/config`, { signal }),
    enabled: admin,
  });
  const calibrations = useQuery({
    queryKey: ["device-timeline", id, "calibrated"],
    queryFn: ({ signal }) => api<BagActivity[]>(`admin/devices/${id}/timeline?kind=calibrated&limit=10`, { signal }),
    enabled: admin,
  });
  const impacts = useQuery({
    queryKey: ["device-timeline", id, "impact"],
    queryFn: ({ signal }) => api<BagActivity[]>(`admin/devices/${id}/timeline?kind=impact&limit=10`, { signal }),
    enabled: admin,
  });
  if (!admin) return null;
  return (
    <>
      <section className="console-card">
        <div className="card-heading">
          <h2>
            <SlidersHorizontal size={18} /> Thresholds
          </h2>
        </div>
        <p className="cell-sub">
          How this bag grades and filters impacts, and how often it reports. Light must be below moderate, and
          moderate below severe. Knocks within the merge window count as one impact; longer pulses and single-sample
          spikes are filtered out but kept below for review.
        </p>
        {config.isPending ? (
          <LoadingState />
        ) : config.isError ? (
          <ErrorState message={config.error.message} retry={() => config.refetch()} />
        ) : (
          <ThresholdsForm key={config.data.updated_at ?? "defaults"} id={id} config={config.data} />
        )}
      </section>

      <div className="dashboard-two-col">
        <section className="console-card">
          <h2>Calibration history</h2>
          {calibrations.data?.length ? (
            <ul className="trace-history">
              {calibrations.data.map((entry) => (
                <li key={entry.id}>
                  <strong>{timeLabel(entry.occurred_at)}</strong>
                  <span>{entry.weight_g ? `Checked against ${(entry.weight_g / 1000).toFixed(1)} kg` : "Zeroed"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cell-sub">{calibrations.isPending ? "Loading…" : "Never calibrated."}</p>
          )}
        </section>
        <section className="console-card">
          <h2>Recent impacts</h2>
          {impacts.data?.length ? (
            <ul className="trace-history">
              {impacts.data.map((entry) => (
                <li key={entry.id}>
                  <strong>{timeLabel(entry.occurred_at)}</strong>
                  <span>
                    {entry.impact_g != null ? `${entry.impact_g.toFixed(1)} g` : ""}{" "}
                    {entry.severity ? <span className={`trace-badge ${entry.severity}`}>{severityLabel[entry.severity]}</span> : null}
                  </span>
                  <small className="cell-sub">
                    {[
                      entry.via ? viaLabel[entry.via] : null,
                      entry.firmware,
                      entry.locked == null ? null : entry.locked ? "locked" : "unlocked",
                      entry.tampered ? "opened since locked" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cell-sub">{impacts.isPending ? "Loading…" : "No impacts recorded."}</p>
          )}
        </section>
      </div>

      <ImpactReadings id={id} />
      <ReplaceTracker id={id} />
    </>
  );
}

const liftLabel = {
  unsettled: "Didn’t settle",
  too_short: "Put down too soon",
  out_of_range: "Too heavy",
} as const;

const outcomeLabel: Record<ImpactOutcome, string> = {
  recorded: "Recorded",
  merged: "Merged",
  below_threshold: "Below threshold",
  filtered_glitch: "Glitch",
  filtered_sustained: "Too long",
};

/** The resultant acceleration of a trace as an SVG line, with the light threshold for scale. */
function Waveform({ reading, threshold }: { reading: ImpactReading; threshold: number | null }) {
  const trace = reading.trace;
  if (!trace) return <p className="cell-sub">No raw samples were sent with this impact.</p>;
  const magnitudes = trace.x_g.map((x, i) => Math.hypot(x, trace.y_g[i] ?? 0, trace.z_g[i] ?? 0));
  const top = Math.max(...magnitudes, threshold ?? 0, 1) * 1.1;
  const width = 600;
  const height = 160;
  const x = (i: number) => (i / Math.max(1, magnitudes.length - 1)) * width;
  const y = (g: number) => height - (g / top) * height;
  const points = magnitudes.map((g, i) => `${x(i).toFixed(1)},${y(g).toFixed(1)}`).join(" ");
  const span = ((magnitudes.length / trace.sample_rate_hz) * 1000).toFixed(0);
  return (
    <figure className="impact-wave">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Acceleration over ${span} ms, peaking at ${reading.peak_g.toFixed(1)} g`}>
        {threshold != null ? (
          <line x1={0} x2={width} y1={y(threshold)} y2={y(threshold)} className="impact-wave-threshold" />
        ) : null}
        <polyline points={points} className="impact-wave-line" />
      </svg>
      <figcaption>
        {magnitudes.length} samples at {trace.sample_rate_hz.toLocaleString()} Hz ({span} ms) · peak{" "}
        {Math.max(...magnitudes).toFixed(1)} g{threshold != null ? ` · dashed line: light threshold ${threshold} g` : ""}
      </figcaption>
    </figure>
  );
}

/** Every impact the bag reported, with its raw trace, including those filtered or merged (admins). */
function ImpactReadings({ id }: { id: string }) {
  const [outcome, setOutcome] = useState<ImpactOutcome | "all">("all");
  const [selected, setSelected] = useState<number | null>(null);
  const readings = useQuery({
    queryKey: ["impact-readings", id, outcome],
    queryFn: ({ signal }) =>
      api<ImpactReading[]>(
        `admin/devices/${id}/impact-readings?limit=50${outcome === "all" ? "" : `&outcome=${outcome}`}`,
        { signal },
      ),
  });
  const config = useQuery({
    queryKey: ["device-config", id],
    queryFn: ({ signal }) => api<DeviceConfig>(`admin/devices/${id}/config`, { signal }),
  });
  const shown = readings.data?.find((reading) => reading.id === selected) ?? readings.data?.[0] ?? null;
  return (
    <section className="console-card">
      <div className="card-heading">
        <h2>
          <Zap size={18} /> Raw impact data
        </h2>
        <ConsoleSelect
          compact
          label="Outcome"
          value={outcome}
          onValueChange={(value) => setOutcome(value as ImpactOutcome | "all")}
          options={[
            { value: "all", label: "Every reading" },
            ...Object.entries(outcomeLabel).map(([value, label]) => ({ value, label })),
          ]}
        />
      </div>
      <p className="cell-sub">
        What the accelerometer reported, before filtering and merging. Use it to tune the thresholds above or to
        look into a damage claim.
      </p>
      {readings.isPending ? (
        <LoadingState />
      ) : readings.isError ? (
        <ErrorState message={readings.error.message} retry={() => readings.refetch()} />
      ) : !readings.data.length ? (
        <p className="cell-sub">No impacts reported{outcome === "all" ? "" : " with this outcome"}.</p>
      ) : (
        <>
          {shown ? <Waveform reading={shown} threshold={config.data?.impact_light_g ?? null} /> : null}
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Peak</th>
                  <th>Duration</th>
                  <th>Outcome</th>
                  <th>Resting</th>
                  <th>Firmware</th>
                </tr>
              </thead>
              <tbody>
                {readings.data.map((reading) => (
                  <tr
                    key={reading.id}
                    className={reading.id === shown?.id ? "selected" : undefined}
                    onClick={() => setSelected(reading.id)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === "Enter" && setSelected(reading.id)}
                    aria-selected={reading.id === shown?.id}
                  >
                    <td>{timeLabel(reading.occurred_at)}</td>
                    <td>
                      {reading.peak_g.toFixed(1)} g{" "}
                      {reading.severity ? (
                        <span className={`trace-badge ${reading.severity}`}>{severityLabel[reading.severity]}</span>
                      ) : null}
                    </td>
                    <td>{reading.duration_ms != null ? `${reading.duration_ms} ms` : "—"}</td>
                    <td>
                      <span className={`trace-badge ${reading.outcome === "recorded" || reading.outcome === "merged" ? "lime" : "warn"}`}>
                        {outcomeLabel[reading.outcome]}
                      </span>
                    </td>
                    <td>{reading.orientation?.replace("_", " ") ?? "—"}</td>
                    <td>{reading.firmware ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

/** Moves a claimed bag onto a replacement tracker under warranty (admins). */
function ReplaceTracker({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serial, setSerial] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const replace = useMutation({
    mutationFn: () =>
      api<Device>(`admin/devices/${id}/replace`, {
        method: "POST",
        body: JSON.stringify({ serial_number: serial.trim(), reason: reason.trim() || undefined }),
      }),
    onSuccess: (device) => {
      queryClient.invalidateQueries();
      router.push(`/console/devices/${device.id}`);
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirming) setConfirming(true);
    else replace.mutate();
  }
  return (
    <section className="console-card">
      <h2>Replace tracker</h2>
      <p className="cell-sub">
        For a faulty Smart Core under warranty. The owner, nickname, settings, thresholds, timeline, journeys, share
        links and paired phones move to the replacement, this tracker is revoked, and the owner is told. The
        replacement must be registered, unclaimed and have its device key.
      </p>
      <form className="console-form" onSubmit={submit}>
        <label className="field">
          <span>Replacement serial number</span>
          <input
            className="console-input"
            value={serial}
            onChange={(event) => {
              setSerial(event.target.value);
              setConfirming(false);
            }}
            placeholder="TRC-…"
            autoComplete="off"
            required
          />
        </label>
        <label className="field">
          <span>Reason (for the audit trail)</span>
          <input
            className="console-input"
            value={reason}
            maxLength={120}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Load cell fault"
          />
        </label>
        {replace.isError ? (
          <p role="alert" className="console-alert error">
            {replace.error instanceof ApiError ? replace.error.message : "Couldn’t replace the tracker."}
          </p>
        ) : confirming ? (
          <p role="alert" className="console-alert">
            This revokes the current tracker permanently. Press again to replace it with {serial.trim().toUpperCase()}.
          </p>
        ) : null}
        <div className="form-actions">
          <span />
          <button className={confirming ? "console-danger" : "console-button"} disabled={replace.isPending || !serial.trim()}>
            {replace.isPending ? "Replacing…" : confirming ? "Replace and revoke" : "Replace tracker"}
          </button>
        </div>
      </form>
    </section>
  );
}
