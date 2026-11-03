"use client";
import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {useState} from "react";
import {ConsoleTable,ConsolePagination,type ConsoleColumn} from "@/components/console-table";
import {PriorityLabel} from "@/components/console-data";
import {EmptyState} from "@/components/console-ui";
import {referenceLocationHistory,type DeviceLocationRecord} from "@/lib/device-design-fixtures";
import {alertPriority,consoleDate,maskedEmail} from "@/lib/console-presentation";
import type {AlertRecord} from "@/lib/api/types";
import type {DemoAdminAudit} from "@/lib/operations-design-fixtures";
import type {DeviceDetailView} from "./device-detail-model";

export function DeviceAlerts({view}:{view:DeviceDetailView}) {
  const open=view.alerts.filter((alert) => alert.status !== "resolved").sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp));
  const closed=view.alerts.filter((alert) => alert.status === "resolved").sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp));
  const columns:ConsoleColumn<AlertRecord>[]=[
    {key:"alert",label:"Alert",width:262,className:"cell-ink",render:(alert) => <Link href={`/alerts/${alert.id}`}>{alert.title}</Link>},
    {key:"sensor",label:"Sensor severity",width:170,className:"cell-ink",render:(alert) => alert.category === "impact" ? "Severe" : "—"},
    {key:"priority",label:"Priority",width:150,render:(alert) => <PriorityLabel priority={alertPriority(alert)}>{alertPriority(alert)}</PriorityLabel>},
    {key:"time",label:"Time (UTC)",width:190,render:(alert) => <span className="mono cell-ink">{consoleDate(alert.timestamp,true)}</span>},
    {key:"location",label:"Location",width:368,className:"cell-ink",render:(alert) => alert.location ?? "Not recorded"},
  ];
  return <><section className="device-wide-table"><h2>{open.length} open {open.length === 1 ? "alert" : "alerts"}</h2>{open.length ? <ConsoleTable label="Device open alerts" columns={columns} rows={open} rowKey={(alert) => alert.id} /> : <EmptyState title="No open alerts" />}</section>
    <div className="record-disclosures device-disclosures"><details><summary><span aria-hidden="true"><FigmaIcon name="clock" /></span>Logged and closed</summary>{closed.length ? <div className="device-wide-table"><ConsoleTable label="Device closed alerts" columns={columns} rows={closed} rowKey={(alert) => alert.id} /></div> : <p>No closed alerts found.</p>}</details>
    <details><summary><span aria-hidden="true"><FigmaIcon name="info" /></span>Why these priorities</summary><p>Sensor severity records the strength of an impact. Priority also considers related tamper events, repeated significant impacts and other high-risk conditions. An impact does not confirm damage.</p></details></div>
  </>;
}

export function DeviceLocation({view}:{view:DeviceDetailView}) {
  const snapshot=view.snapshot;
  const rows:DeviceLocationRecord[]=view.device.serial_number === "AMT-ES55-5A06B3" ? referenceLocationHistory : snapshot?.location && view.profile?.lastContactAt ? [{id:"last-report",timestamp:view.profile.lastContactAt,place:snapshot.location,source:snapshot.connection ?? "Not recorded",accuracy:null,event:"Last contact"}] : [];
  const latest=rows[0];
  const columns:ConsoleColumn<DeviceLocationRecord>[]=[
    {key:"time",label:"Time (UTC)",width:212,render:(row) => <span className="mono cell-ink">{consoleDate(row.timestamp,true)}</span>},
    {key:"place",label:"Place",width:290,className:"cell-ink",render:(row) => row.place},
    {key:"source",label:"Source",width:190,className:"cell-ink",render:(row) => row.source},
    {key:"accuracy",label:"Accuracy",width:170,className:"cell-ink",render:(row) => row.accuracy != null ? `${row.accuracy} m` : "Not recorded"},
    {key:"event",label:"Event",width:278,render:(row) => row.event},
  ];
  return <><section className="location-current"><span className="detail-row-icon" aria-hidden="true"><FigmaIcon name="location" /></span><div><h2>{snapshot?.location ?? "No location recorded"}</h2><p>{latest ? `${consoleDate(latest.timestamp,true)} UTC. ${latest.source}${latest.accuracy != null ? `, ${latest.accuracy} m` : ""}` : "No location report is available."}</p></div></section>
    <section className="device-wide-table device-location-history"><h3>Location history</h3>{rows.length ? <ConsoleTable label="Historical device locations" columns={columns} rows={rows} rowKey={(row) => row.id} /> : <EmptyState title="No recorded locations" />}</section>
    <div className="record-disclosures device-disclosures"><details><summary><span aria-hidden="true"><FigmaIcon name="settings" /></span>Tracking settings</summary><p>Tracking preferences will be available when the tracking service is connected.</p></details></div>
  </>;
}

export function DeviceAuditHistory({view}:{view:DeviceDetailView}) {
  const [page,setPage]=useState(0);
  const mask=(text:string) => view.customerVisible || !view.customer ? text : text.replaceAll(view.customer.email,maskedEmail(view.customer.email)).replaceAll(view.customer.name,"Customer masked");
  const columns:ConsoleColumn<DemoAdminAudit>[]=[
    {key:"action",label:"Action",width:252,render:(row) => <span className="mono cell-ink" title={row.action}>{row.action}</span>},
    {key:"who",label:"Who",width:300,className:"cell-ink",render:(row) => mask(row.who)},
    {key:"time",label:"Time (UTC)",width:240,render:(row) => <span className="mono cell-ink">{consoleDate(row.timestamp,true,true)}</span>},
    {key:"detail",label:"Detail",width:348,render:(row) => mask(row.detail)},
  ];
  return <section className="device-wide-table"><h2>Audit history</h2>{view.admin.audit.length ? <ConsoleTable label="Device audit history" columns={columns} rows={view.admin.audit.slice(page*50,(page+1)*50)} rowKey={(row) => row.id} /> : <EmptyState title="No audit records" />}{view.admin.audit.length > 50 && <ConsolePagination page={page} limit={50} total={view.admin.audit.length} onPage={setPage} />}</section>;
}
