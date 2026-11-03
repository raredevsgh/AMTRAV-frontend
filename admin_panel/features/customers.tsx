"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useConsole, useResource, useConsoleState } from "./console-context";
import { SectionPage, LoadingState, ErrorState } from "@/components/console-ui";
import { FilterMenu, FilterOptions, ConsoleSearch } from "@/components/console-filters";
import { ConsoleTable, ConsolePagination, RegistryEmptyState, type ConsoleColumn } from "@/components/console-table";
import { PriorityLabel } from "@/components/console-data";
import { designDeviceProfiles } from "@/lib/admin-design-fixtures";
import { alertPriority, consoleDate, relativeContact, loadConsolePages, maskedName, maskedEmail } from "@/lib/console-presentation";
import type { CustomerRecord } from "@/lib/api/types";

export function CustomersFeature() {
  const api = useConsole();
  const {presentation} = useConsoleState();
  const masked = presentation === "engineering";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState("all");
  const [ownership, setOwnership] = useState("all");
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(0);
  const load = useCallback(async () => {
    // The customer endpoint enforces administrator access before any directory is returned.
    const customers = await loadConsolePages((page, pageSize) => api.listCustomers({page, pageSize}));
    const [devices, alerts] = await Promise.all([
      loadConsolePages((page, limit) => api.listDevices({offset:(page-1)*limit,limit})),
      loadConsolePages((page, pageSize) => api.listAlerts({page,pageSize})),
    ]);
    return customers.map((customer) => {
      const linked = devices.filter((device) => device.owner_id === customer.id);
      const incidents = alerts.filter((alert) => alert.status !== "resolved" && linked.some((device) => device.id === alert.deviceId));
      const severity = {critical:0,high:1,medium:2,low:3};
      incidents.sort((a,b) => severity[a.severity]-severity[b.severity]);
      const reported = linked.map((device) => designDeviceProfiles.find((profile) => profile.deviceId === device.id && profile.serial === device.serial_number)?.lastContactAt)
        .filter((value):value is string => Boolean(value)).sort().at(-1);
      return {customer,linked,incidents,reported};
    });
  },[api]);
  const {data,loading,error,retry} = useResource(load);
  type Row = {customer:CustomerRecord} & NonNullable<typeof data>[number];
  const query = search.trim().toLowerCase();
  const rows = (data ?? []).filter((row) => (!query || `${masked ? maskedName(row.customer.name) : row.customer.name} ${masked ? maskedEmail(row.customer.email) : row.customer.email} ${row.linked.map((device) => device.serial_number).join(" ")}`.toLowerCase().includes(query)) &&
    (open === "all" || (open === "with" ? row.incidents.length > 0 : !row.incidents.length)) &&
    (ownership === "all" || (ownership === "claimed" ? row.linked.some((device) => device.status === "claimed") : row.linked.some((device) => device.status === "revoked"))))
    .sort((a,b) => (ascending ? 1 : -1) * a.customer.name.localeCompare(b.customer.name));
  const columns:ConsoleColumn<Row>[] = [
    {key:"customer",label:"Customer",width:224,sort:ascending ? "ascending" : "descending",onSort:() => {setAscending(!ascending);setPage(0);},render:(row) => <Link className="cell-ink" href={`/customers/${row.customer.id}`}>{masked ? maskedName(row.customer.name) : row.customer.name}</Link>},
    {key:"email",label:"Email",width:260,render:(row) => <Link className="muted" href={`/customers/${row.customer.id}`}>{masked ? maskedEmail(row.customer.email) : row.customer.email}</Link>},
    {key:"device",label:"Device",width:200,render:(row) => row.linked.length ? row.linked.map((device) => <Link key={device.id} className="mono muted" href={`/devices/${device.id}`}>{device.serial_number}</Link>) : "—"},
    {key:"alerts",label:"Open alerts",width:168,render:(row) => row.incidents.length ? <Link href={`/customers/${row.customer.id}`}><PriorityLabel priority={alertPriority(row.incidents[0])}>{row.incidents.length} open</PriorityLabel></Link> : "—"},
    {key:"contact",label:"Last contact",width:150,render:(row) => relativeContact(row.reported)},
    {key:"joined",label:"Joined",width:138,render:(row) => consoleDate(row.customer.joinedDate,false,true)},
  ];
  const filtered=Boolean(search || open !== "all" || ownership !== "all");
  const clear=() => {setSearch("");setOpen("all");setOwnership("all");setPage(0);};
  return <SectionPage title="Customers" className="registry-page">
    <div className="registry-toolbar" aria-label="Customer filters">
      <ConsoleSearch label="Search customers" value={search} onChange={(value) => {setSearch(value);setPage(0);}} />
      <FilterMenu label={open === "with" ? "Has open alerts" : open === "without" ? "No open alerts" : "Open alerts"} active={open !== "all"}><FilterOptions label="Open alerts" name="customer-alerts" value={open} options={[["all","All customers"],["with","With open alerts"],["without","No open alerts"]]} onChange={(value) => {setOpen(value);setPage(0);}} /></FilterMenu>
      <FilterMenu label={ownership === "all" ? "Ownership" : ownership === "claimed" ? "Claimed" : "Revoked"} active={ownership !== "all"}><FilterOptions label="Ownership" name="customer-ownership" value={ownership} options={[["all","All ownership"],["claimed","Claimed"],["revoked","Revoked"]]} onChange={(value) => {setOwnership(value);setPage(0);}} /></FilterMenu>
      {(open !== "all" || ownership !== "all") && <button className="filter-clear" onClick={clear}>Clear filters</button>}
    </div>
    {loading ? <LoadingState label="Loading customers" /> : error ? <ErrorState error={error} retry={retry} /> : <><ConsoleTable label="Customers" columns={columns} rows={rows.slice(page*50,(page+1)*50)} rowKey={(row) => row.customer.id} />{!rows.length && <RegistryEmptyState title="No customers" onClear={filtered ? clear : undefined} />}</>}
    {!loading && !error && <ConsolePagination page={page} limit={50} total={rows.length} onPage={setPage} />}
  </SectionPage>;
}
