"use client";

import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {SortIndicator} from "@/components/console-table";
import { useCallback, useState } from "react";
import { useConsole, useResource, useConsoleState } from "./console-context";
import {
  SectionPage,
  ButtonLink,
  ErrorState,
  errorText,
} from "@/components/console-ui";
import { ADMIN_PREVIEW_TIME, designCustomers, designDeviceProfiles, designAttentionLabels, type DesignAttention, type DesignConnectivity } from "@/lib/admin-design-fixtures";
import {SourceLabel} from "@/components/console-data";
import { FilterMenu, FilterChecks, ConsoleSearch } from "@/components/console-filters";
import type { AlertRecord, Device, DeviceTelemetry } from "@/lib/api/types";
import {MockApiError} from "@/lib/api";
import {maskedEmail} from "@/lib/console-presentation";

type Connectivity = DesignConnectivity;
type Attention = DesignAttention;
type Sort = "attention" | "contact";
const attentionLabels = designAttentionLabels;
const fixtureTime = Date.parse(ADMIN_PREVIEW_TIME);

// Presentation state is derived only from the isolated mock service, never a live fleet.
function reporting(device: Device, telemetry?: DeviceTelemetry, alert?: AlertRecord) {
  const profile = designDeviceProfiles.find((item) => item.deviceId === device.id && item.serial === device.serial_number);
  const reportedAt = profile?.lastContactAt ?? telemetry?.lastPing;
  const contact = reportedAt ? Date.parse(reportedAt) : null;
  const connectivity: Connectivity = profile?.connectivity ?? (!telemetry ? "unknown"
    : telemetry.connectionType === "offline" ? "offline"
      : contact !== null && fixtureTime - contact > 15 * 60_000 ? "stale" : "online");
  const attention: Attention = profile?.attention
    ?? (alert?.category === "tamper" || telemetry?.tamperStatus === "breached" ? "tamper"
      : telemetry && telemetry.batteryLevel < 20 ? "battery" : "none");
  const customer = designCustomers.find((candidate) =>
    candidate.devices.some((linked) => linked.id === device.id));
  const age = contact === null ? null : Math.max(0, Math.floor((fixtureTime - contact) / 60_000));
  const contactLabel = age === null ? "Never" : age === 0 ? "Just now"
    : age < 60 ? `${age} min ago` : age < 1440 ? `${Math.floor(age / 60)} hr ago` : `${Math.floor(age / 1440)} days ago`;
  return { device, telemetry, customer, connectivity, attention, contact, contactLabel, source: profile?.source ?? "simulated", reportedAt };
}

export function Devices({initialConnectivity="all",initialAttention="all"}:{initialConnectivity?:string;initialAttention?:string}) {
  const api = useConsole();
  const {presentation} = useConsoleState();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [attention, setAttention] = useState<string[]>(initialAttention === "any" ? Object.keys(attentionLabels).filter((value) => value !== "none") : []);
  const [connectivity, setConnectivity] = useState<string[]>(initialConnectivity === "offline_stale" ? ["offline","stale"] : initialConnectivity === "recent" ? ["online"] : initialConnectivity === "all" ? [] : [initialConnectivity]);
  const [status, setStatus] = useState<string[]>([]);
  const [source, setSource] = useState<string[]>([]);
  const [model, setModel] = useState<string[]>([]);
  const [firmware, setFirmware] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("attention");
  const [ascending, setAscending] = useState(false);
  const load = useCallback(async () => {
    const [devices, telemetry, alerts] = await Promise.all([
      api.listDevices({ limit: 100 }),
      api.listTelemetry(),
      api.listAlerts({ pageSize: 100 }),
    ]);
    const severity = { critical: 0, high: 1, medium: 2, low: 3 };
    const openAlerts = alerts.items.filter((alert) => alert.status !== "resolved")
      .sort((a, b) => severity[a.severity] - severity[b.severity]);
    const inventory = [...devices.items];
    let loadedCount = devices.items.length;
    while (loadedCount === 100) {
      const next = await api.listDevices({ limit: 100, offset: inventory.length });
      inventory.push(...next.items);
      loadedCount = next.items.length;
    }
    return inventory.map((device) => reporting(device,
      telemetry.find((item) => item.deviceId === device.id),
      openAlerts.find((alert) => alert.deviceId === device.id)));
  }, [api]);
  const { data, error, loading, retry } = useResource(load);
  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((row) =>
    (!query || `${row.device.serial_number} ${row.device.model}`.toLowerCase().includes(query)) &&
    (!attention.length || attention.includes(row.attention)) &&
    (!connectivity.length || connectivity.includes(row.connectivity)) &&
    (!status.length || status.includes(row.device.status === "revoked" ? "revoked" : "active")) &&
    (!source.length || source.includes(row.source)) &&
    (!model.length || model.includes(row.device.model)) &&
    (!firmware.length || firmware.includes(row.device.firmware_version)));
  const order: Record<Attention, number> = { theft_mode: 6, tamper: 6, severe_impact: 5, separated: 4, battery: 3, calibration: 2, none: 0 };
  filtered.sort((a, b) => {
    const delta = sort === "attention" ? order[a.attention] - order[b.attention]
      : (a.contact ?? -Infinity) - (b.contact ?? -Infinity);
    return (ascending ? delta : -delta) || ((b.contact ?? -Infinity) - (a.contact ?? -Infinity)) || a.device.serial_number.localeCompare(b.device.serial_number);
  });
  const rows = filtered.slice(page * limit, (page + 1) * limit);
  const extraCount=status.length+source.length+model.length+firmware.length;
  const hasFilters = Boolean(search || attention.length || connectivity.length || extraCount);
  const change = (setter: (value: string) => void, value: string) => { setter(value); setPage(0); };
  const changeChecks = (setter:(values:string[])=>void) => (values:string[]) => {setter(values);setPage(0);};
  const clear = () => { setSearch(""); setAttention([]); setConnectivity([]); setStatus([]); setSource([]); setModel([]); setFirmware([]); setPage(0); };
  const sortBy = (value: Sort) => {
    setAscending(sort === value ? !ascending : false);
    setSort(value);
  };
  const customersVisible = api.session.role === "admin" && presentation === "operations";
  const anyAttention=attention.length === 6 && !attention.includes("none");
  const attentionTitle=!attention.length ? "Attention" : anyAttention ? "Attention: Any" : attention.length === 1 ? `Attention: ${attentionLabels[attention[0] as Attention]}` : `Attention · ${attention.length}`;
  const connectionNames=["online","stale","offline","unknown"].filter((value) => connectivity.includes(value)).map((value) => value[0].toUpperCase()+value.slice(1));
  const connectivityTitle=!connectivity.length ? "Connectivity" : connectivity.length <= 2 ? `Connectivity: ${connectionNames.join(", ")}` : `Connectivity · ${connectivity.length}`;
  return (
    <SectionPage title="Devices" className="registry-page"
      actions={presentation === "engineering" ? <><span className="muted">Operations or Admin only</span><button className="btn" disabled><FigmaIcon name="plus" />Register device</button></> : <ButtonLink href="/devices/new"><FigmaIcon name="plus" /> Register device</ButtonLink>}>
      <div className="registry-toolbar" aria-label="Device filters">
        <ConsoleSearch label="Search devices" value={search} onChange={(value) => change(setSearch,value)} />
        <FilterMenu label={attentionTitle} active={Boolean(attention.length)} className="device-attention-filter">
          <FilterChecks label="Attention" values={attention} options={[["tamper","Tamper event"],["theft_mode","Theft Mode"],["severe_impact","Severe impact"],["separated","Separated"],["battery","Low battery"],["calibration","Calibration due"],["none","None"]]} onChange={changeChecks(setAttention)} />
        </FilterMenu>
        <FilterMenu label={connectivityTitle} active={Boolean(connectivity.length)} className="device-connectivity-filter">
          <FilterChecks label="Connectivity" values={connectivity} options={[["online","Online"],["stale","Stale"],["offline","Offline"],["unknown","Unknown"]]} onChange={changeChecks(setConnectivity)} />
        </FilterMenu>
        <FilterMenu label={extraCount ? `All filters · ${extraCount}` : "All filters"} active={Boolean(extraCount)} className="device-all-filters">
          <div className="device-filter-columns"><div>
            <FilterChecks showLegend label="State" values={status} options={[["active","Active"],["revoked","Revoked"]]} onChange={changeChecks(setStatus)} />
            <FilterChecks showLegend label="Data" values={source} options={[["simulated","Sample"],["verified_example","Reference"]]} onChange={changeChecks(setSource)} />
          </div><div>
            <FilterChecks showLegend label="Model" values={model} options={["Essential","Flagship","Pro","Executive"].map((value) => [value,value] as const)} onChange={changeChecks(setModel)} />
            <FilterChecks showLegend label="Firmware" values={firmware} options={[...new Set(["1.4.2","1.4.1","1.3.9",...(data ?? []).map((row) => row.device.firmware_version)])].map((value) => [value,value] as const)} onChange={changeChecks(setFirmware)} />
          </div></div>
        </FilterMenu>
        {Boolean(attention.length || connectivity.length || extraCount) && <button className="filter-clear" onClick={clear}>Clear filters</button>}
      </div>
      {loading && <div className="loading-state sr-only" role="status">Loading devices</div>}
        <div className="table-scroll registry-table-wrap" role="region" aria-label="Devices" tabIndex={0}>
          <table className={`registry-table device-registry-table ${loading ? "device-skeleton-table" : ""}`} aria-busy={loading}>
            <colgroup>{[156, 116, 176, 130, 216, 72, 96, 88, 90].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
            <thead><tr>
              <th scope="col">Device</th><th scope="col">Connectivity</th>
              <th scope="col" aria-sort={sort === "attention" ? ascending ? "ascending" : "descending" : "none"}><button type="button" onClick={() => sortBy("attention")}>Attention<SortIndicator direction={sort === "attention" ? ascending ? "ascending" : "descending" : "none"} /></button></th>
              <th scope="col" aria-sort={sort === "contact" ? ascending ? "ascending" : "descending" : "none"}><button type="button" onClick={() => sortBy("contact")}>Last contact<SortIndicator direction={sort === "contact" ? ascending ? "ascending" : "descending" : "none"} /></button></th>
              <th scope="col">Customer</th><th scope="col" className="numeric">Battery</th><th scope="col">Firmware</th><th scope="col">State</th><th scope="col">Data</th>
            </tr></thead>
            <tbody>{loading ? Array.from({length:13},(_,row) => <tr key={row} aria-hidden="true">{[92,56,98,66,118,34,42,36,46].map((width,column) => <td key={column}><span style={{width}} /></td>)}</tr>) : !error && rows.map((row) => <tr key={row.device.id}>
              <td><Link className="device-serial" href={`/devices/${row.device.id}`} aria-label={`View ${row.device.serial_number}`}>{row.device.serial_number}</Link></td>
              <td><span className={`connectivity connectivity-${row.connectivity}`}><i aria-hidden="true" />{row.connectivity[0].toUpperCase() + row.connectivity.slice(1)}</span></td>
              <td>{row.attention === "none" ? <span className="muted">—</span> : <span className={`attention attention-${row.attention}`}><i aria-hidden="true" />{attentionLabels[row.attention]}</span>}</td>
              <td className="muted"><time dateTime={row.reportedAt} title={row.reportedAt ? `${row.reportedAt} (UTC)` : undefined}>{row.contactLabel}</time></td>
              <td className="muted">{!row.device.owner_id ? "Unclaimed" : !customersVisible ? api.session.role === "admin" && row.customer ? maskedEmail(row.customer.email) : "Customer masked" : row.customer ? <Link href={`/customers/${row.customer.id}`}>{row.customer.email}</Link> : "—"}</td>
              <td className="numeric muted">{row.telemetry ? `${row.telemetry.batteryLevel}%` : "—"}</td>
              <td className="mono muted">{row.device.firmware_version}</td>
              <td>{row.device.status === "revoked" ? "Revoked" : <span className="muted">—</span>}</td>
              <td><SourceLabel source={row.source} /></td>
            </tr>)}</tbody>
          </table>
        </div>
      {!loading && (error ? <div className="device-list-status"><DeviceLoadError error={error} retry={retry} /></div> : !rows.length ? <div className="device-list-status empty-state"><h2>{hasFilters ? "No devices match these filters" : "No devices yet"}</h2>{hasFilters ? <button className="btn btn-secondary" onClick={clear}>Clear filters</button> : <><p>Register a device to start your inventory.</p><ButtonLink href="/devices/new">Register device</ButtonLink></>}</div> : null)}
      <div className="console-pagination">
        <p>{loading ? "Loading" : error ? "" : `${rows.length} on this page`}</p>
        {!loading && !error && <label className="page-size">Rows per page<select aria-label="Page size" value={limit} onChange={(event) => {setLimit(Number(event.target.value));setPage(0);}}><option value={5}>5</option><option value={50}>50</option></select></label>}
        <div><button aria-label="Previous page" disabled={loading || Boolean(error) || page === 0} onClick={() => setPage((current) => current - 1)}><FigmaIcon name="chevronLeft" /></button>
          <button aria-label="Next page" disabled={loading || Boolean(error) || (page + 1) * limit >= filtered.length} onClick={() => setPage((current) => current + 1)}><FigmaIcon name="chevronRight" /></button></div>
      </div>
    </SectionPage>
  );
}

function DeviceLoadError({error,retry}:{error:unknown;retry:()=>void}) {
  if(!(error instanceof MockApiError) || error.status !== 503)return <ErrorState error={error} retry={retry} />;
  return <div className="device-load-error" role="alert"><span className="danger-text" aria-hidden="true"><FigmaIcon name="info" /></span><h2>Couldn’t load devices</h2><span className="sr-only">{errorText(error)}</span><button className="btn btn-secondary" onClick={retry}><FigmaIcon name="refresh" /> Try again</button></div>;
}
