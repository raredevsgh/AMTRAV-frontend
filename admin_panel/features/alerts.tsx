"use client";

import { useCallback, useState } from "react";
import { useConsole, useResource } from "./console-context";
import { SectionPage, LoadingState, ErrorState } from "@/components/console-ui";
import { FilterMenu, FilterChecks, ConsoleSearch } from "@/components/console-filters";
import { ConsoleTable, ConsolePagination, RegistryEmptyState } from "@/components/console-table";
import { alertColumns } from "@/components/alert-columns";
import { alertPriority, alertStatusLabels, loadConsolePages } from "@/lib/console-presentation";

const statuses = Object.entries(alertStatusLabels);
const priorities = [["Critical", "Critical"], ["Warning", "Warning"], ["Attention", "Attention"]] as const;
export function AlertsFeature() {
  const api = useConsole();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string[]>(["active", "acknowledged"]);
  const [priority, setPriority] = useState<string[]>([]);
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(0);
  const load = useCallback(() => loadConsolePages((page, pageSize) => api.listAlerts({ page, pageSize })), [api]);
  const { data, loading, error, retry } = useResource(load);
  const query = search.trim().toLowerCase();
  const rows = (data ?? []).filter((alert) =>
    (!status.length || status.includes(alert.status)) && (!priority.length || priority.includes(alertPriority(alert))) &&
    (!query || `${alert.id} ${alert.title} ${alert.deviceSerial} ${alert.journeyId ?? ""}`.toLowerCase().includes(query)))
    .sort((a, b) => (ascending ? 1 : -1) * (Date.parse(a.timestamp) - Date.parse(b.timestamp)));
  const statusLabel = status.length === 2 && status.includes("active") && status.includes("acknowledged") ? "Open"
    : status.length === 1 ? alertStatusLabels[status[0] as keyof typeof alertStatusLabels] : "Status";
  const columns = alertColumns({ascending, onSort:() => {setAscending(!ascending);setPage(0);}});
  const filtered = search || priority.length || statusLabel !== "Open";
  const clear=() => {setSearch("");setStatus(["active", "acknowledged"]);setPriority([]);setPage(0);};
  return <SectionPage title="Alerts" className="registry-page">
    <div className="registry-toolbar" aria-label="Alert filters">
      <ConsoleSearch label="Search alerts" value={search} onChange={(value) => {setSearch(value);setPage(0);}} />
      <FilterMenu label={statusLabel} active={statusLabel !== "Open"}><FilterChecks label="Status" values={status} options={statuses} onChange={(values) => {setStatus(values);setPage(0);}} /></FilterMenu>
      <FilterMenu label={priority.length === 1 ? priority[0] : "Priority"} active={priority.length > 0}><FilterChecks label="Priority" values={priority} options={priorities} onChange={(values) => {setPriority(values);setPage(0);}} /></FilterMenu>
      {Boolean(priority.length || statusLabel !== "Open") && <button className="filter-clear" onClick={clear}>Clear filters</button>}
    </div>
    {loading ? <LoadingState label="Loading alerts" /> : error ? <ErrorState error={error} retry={retry} /> : <><ConsoleTable label="Alerts" columns={columns} rows={rows.slice(page * 50, (page + 1) * 50)} rowKey={(alert) => alert.id} />{!rows.length && <RegistryEmptyState title="No alerts" onClear={filtered ? clear : undefined} />}</>}
    {!loading && !error && <ConsolePagination page={page} limit={50} total={rows.length} onPage={setPage} />}
  </SectionPage>;
}
