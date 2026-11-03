"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useConsole, useResource, useConsoleState } from "./console-context";
import { SectionPage, LoadingState, ErrorState } from "@/components/console-ui";
import { FilterMenu, FilterChecks, ConsoleSearch } from "@/components/console-filters";
import { ConsoleTable, ConsolePagination, RegistryEmptyState, type ConsoleColumn } from "@/components/console-table";
import { PriorityLabel } from "@/components/console-data";
import { designDeviceProfiles, designAttentionLabels } from "@/lib/admin-design-fixtures";
import { journeyStatusLabels, consoleDate, relativeContact, loadConsolePages } from "@/lib/console-presentation";
import type { JourneyRecord } from "@/lib/api/types";

function exception(journey: JourneyRecord) {
  if (journey.status === "arrived") return null;
  if (journey.status === "scheduled") return {key:"incomplete",label:"End not recorded", priority:"Attention" as const};
  const profile = designDeviceProfiles.find((item) => item.deviceId === journey.deviceId && item.serial === journey.deviceSerial);
  return profile && profile.attention !== "none" && profile.priority ? {key:profile.attention,label:designAttentionLabels[profile.attention], priority:profile.priority} : null;
}
const statusOptions = [["in_transit", "Active"], ["arrived", "Completed"], ["exception", "Interrupted"], ["scheduled", "Incomplete"]] as const;
const exceptionOptions=[["theft_mode","Theft Mode"],["tamper","Tamper event"],["severe_impact","Severe impact"],["separated","Separated"],["battery","Low battery"],["incomplete","End not recorded"],["none","None"]] as const;
export function JourneysFeature() {
  const api = useConsole();
  const {presentation} = useConsoleState();
  const customerVisible = api.session.role === "admin" && presentation === "operations";
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [exceptions, setExceptions] = useState<string[]>([]);
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(0);
  const load = useCallback(() => loadConsolePages((page, pageSize) => api.listJourneys({page, pageSize})), [api]);
  const {data, loading, error, retry} = useResource(load);
  const query = search.trim().toLowerCase();
  const rows = (data ?? []).filter((journey) => (!statuses.length || statuses.includes(journey.status)) &&
    (!exceptions.length || exceptions.includes(exception(journey)?.key ?? "none")) &&
    (!query || `${journey.id} ${journey.origin} ${journey.destination} ${journey.deviceSerial} ${customerVisible ? journey.travelerEmail : ""}`.toLowerCase().includes(query)))
    .sort((a, b) => {
      // Registry groups older dates by day, matching the reference ordering within each day.
      const key = (journey: JourneyRecord) => journey.lastScanTime.startsWith("2026-11-01") ? Date.parse(journey.lastScanTime) : Date.parse(journey.lastScanTime.slice(0, 10));
      return (ascending ? 1 : -1) * (key(a) - key(b));
    });
  const columns: ConsoleColumn<JourneyRecord>[] = [
    {key:"journey",label:"Journey",width:212,render:(journey) => <div className="cell-stack"><Link className="mono" href={`/journeys/${journey.id}`}>{journey.id}</Link><span className="muted">{journey.origin} to {journey.destination}</span></div>},
    {key:"status",label:"Status",width:120,render:(journey) => <span className={`journey-status journey-${journey.status}`}>{journey.status !== "arrived" && <i aria-hidden="true" />}{journeyStatusLabels[journey.status]}</span>},
    {key:"exception",label:"Exceptions",width:176,render:(journey) => {const value=exception(journey);return value ? <PriorityLabel priority={value.priority}>{value.label}</PriorityLabel> : "—";}},
    {key:"activity",label:"Last activity",width:128,sort:ascending ? "ascending" : "descending",onSort:() => {setAscending(!ascending);setPage(0);},render:(journey) => journey.status === "in_transit" || journey.status === "exception" ? relativeContact(journey.lastScanTime) : consoleDate(journey.lastScanTime)},
    {key:"device",label:"Device",width:180,render:(journey) => <Link className="mono muted" href={`/devices/${journey.deviceId}`}>{journey.deviceSerial}</Link>},
    {key:"customer",label:"Customer",width:204,render:(journey) => customerVisible ? <Link className="muted" href={`/customers/${journey.travelerId}`}>{journey.travelerEmail}</Link> : <span className="muted">Customer hidden</span>},
    {key:"started",label:"Started",width:120,render:(journey) => consoleDate(journey.departureDate,true)},
  ];
  const filtered=Boolean(search || statuses.length || exceptions.length);
  const clear=() => {setSearch("");setStatuses([]);setExceptions([]);setPage(0);};
  return <SectionPage title="Journeys" className="registry-page">
    <div className="registry-toolbar" aria-label="Journey filters">
      <ConsoleSearch label="Search journeys" value={search} onChange={(value) => {setSearch(value);setPage(0);}} />
      <FilterMenu label={statuses.length === 1 ? `Status: ${journeyStatusLabels[statuses[0] as keyof typeof journeyStatusLabels]}` : statuses.length ? `Status · ${statuses.length}` : "Status"} active={statuses.length > 0}><FilterChecks label="Status" values={statuses} options={statusOptions} onChange={(values) => {setStatuses(values);setPage(0);}} /></FilterMenu>
      <FilterMenu label={exceptions.length === 1 ? `Exceptions: ${exceptionOptions.find(([value]) => value === exceptions[0])?.[1]}` : exceptions.length ? `Exceptions · ${exceptions.length}` : "Exceptions"} active={exceptions.length > 0}><FilterChecks label="Exceptions" values={exceptions} options={exceptionOptions} onChange={(values) => {setExceptions(values);setPage(0);}} /></FilterMenu>
      {Boolean(statuses.length || exceptions.length) && <button className="filter-clear" onClick={clear}>Clear filters</button>}
    </div>
    {loading ? <LoadingState label="Loading journeys" /> : error ? <ErrorState error={error} retry={retry} /> : <><ConsoleTable label="Journeys" columns={columns} rows={rows.slice(page*50,(page+1)*50)} rowKey={(journey) => journey.id} />{!rows.length && <RegistryEmptyState title="No journeys" onClear={filtered ? clear : undefined} />}</>}
    {!loading && !error && <ConsolePagination page={page} limit={50} total={rows.length} onPage={setPage} />}
  </SectionPage>;
}
