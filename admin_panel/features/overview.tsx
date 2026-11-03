"use client";

import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import { useCallback } from "react";
import { useConsole, useResource } from "./console-context";
import { SectionPage, LoadingState, ErrorState, EmptyState, ButtonLink } from "@/components/console-ui";
import { ConsoleTable } from "@/components/console-table";
import { alertColumns } from "@/components/alert-columns";
import { ADMIN_PREVIEW_TIME, designDeviceProfiles } from "@/lib/admin-design-fixtures";
import { consoleDate, relativeContact, journeyStatusLabels, loadConsolePages } from "@/lib/console-presentation";

export function Overview() {
  const api = useConsole();
  const load = useCallback(async () => {
    const [devices, alerts, journeys] = await Promise.all([
      loadConsolePages((page,limit) => api.listDevices({offset:(page-1)*limit,limit})),
      loadConsolePages((page,pageSize) => api.listAlerts({page,pageSize})),
      loadConsolePages((page,pageSize) => api.listJourneys({page,pageSize})),
    ]);
    const profiles = devices.flatMap((device) => {
      const profile = designDeviceProfiles.find((candidate) => candidate.deviceId === device.id && candidate.serial === device.serial_number);
      return profile ? [profile] : [];
    });
    return {devices,profiles,alerts:alerts.filter((alert) => alert.status !== "resolved"),journeys};
  },[api]);
  const {data,loading,error,retry} = useResource(load);
  const profiles = data?.profiles ?? [];
  const devices = data?.devices ?? [];
  const count = (key:"connectivity"|"priority",value:string) => profiles.filter((profile) => profile[key] === value).length;
  const unclaimed = devices.filter((device) => !device.owner_id).length;
  const revoked = devices.filter((device) => device.status === "revoked").length;
  const recent = count("connectivity","online"), stale = count("connectivity","stale"), offline = count("connectivity","offline");
  const critical = count("priority","Critical"), warning = count("priority","Warning"), attention = count("priority","Attention");
  const cards = [
    {label:"Registered devices",value:devices.length,detail:`${unclaimed} unclaimed, ${revoked} revoked`,theme:"registered",href:"/devices",segments:[devices.length-unclaimed-revoked,unclaimed,revoked]},
    {label:"Recently communicating",value:recent,detail:`Last 15 min, of ${devices.length} devices`,theme:"recent",href:"/devices?connectivity=recent",segments:[recent,devices.length-recent]},
    {label:"Offline or stale",value:stale+offline,detail:`${stale} stale, ${offline} offline`,theme:"offline",href:"/devices?connectivity=offline_stale",segments:[stale,offline,devices.length-stale-offline]},
    {label:"Need attention",value:critical+warning+attention,detail:`${critical} critical, ${warning} warning, ${attention} attention`,theme:"attention",href:"/devices?attention=any",segments:[critical,warning,attention,devices.length-critical-warning-attention]},
  ];
  const months = Array.from({length:10},(_,index) => {
    const month = index+1;
    const date = new Date(Date.UTC(2026,month,1));
    return {label:date.toLocaleDateString("en-US",{month:"short",timeZone:"UTC"}),count:devices.filter((device) => device.claimed_at?.startsWith(`2026-${String(month+1).padStart(2,"0")}`)).length};
  });
  const significant = (data?.alerts ?? []).filter((alert) => alert.severity === "critical" || alert.severity === "high")
    .sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp)).slice(0,5);
  // The source dropdown presents ongoing/incomplete journeys, ahead of completed history.
  const recentJourneys=(data?.journeys ?? []).filter((journey) => journey.status !== "arrived")
    .sort((a,b) => Date.parse(b.lastScanTime)-Date.parse(a.lastScanTime)).slice(0,5);
  return <SectionPage title="Overview" className="figma-overview">
    {loading ? <LoadingState label="Loading overview" /> : error ? <ErrorState error={error} retry={retry} /> : !devices.length ? <EmptyState title="No fleet inventory found"><p>Register a device to start your fleet inventory.</p><ButtonLink href="/devices/new">Register device</ButtonLink></EmptyState> : <>
      <div className="fleet-cards">{cards.map((card) => <Link key={card.label} className={`fleet-card fleet-card-${card.theme}`} href={card.href}>
        <span className="fleet-card-title">{card.label}<i aria-hidden="true"><FigmaIcon name={card.theme === "registered" ? "firmware" : card.theme === "attention" ? "warning" : card.theme === "offline" ? "offline" : "signal"} /></i></span>
        <strong>{card.value}</strong>
        <span className="fleet-segments" aria-hidden="true">{card.segments.map((segment,index) => <i key={index} style={{flex:segment || undefined,display:segment ? undefined:"none"}} />)}</span>
        <span className="fleet-card-detail">{card.detail}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></span>
      </Link>)}</div>
      <section className="significant-alerts" aria-labelledby="significant-heading">
        <div className="dashboard-section-title"><h2 id="significant-heading">Recent significant alerts <span>{data?.alerts.length} open</span></h2><Link href="/alerts">View all</Link></div>
        {significant.length ? <ConsoleTable label="Recent significant alerts" columns={alertColumns()} rows={significant} rowKey={(alert) => alert.id} /> : <p className="dashboard-empty">No open significant alerts.</p>}
      </section>
      <section className="claims-bars" aria-labelledby="claims-heading">
        <div><h2 id="claims-heading">Device claims</h2><strong>{months.reduce((sum,month) => sum+month.count,0)}</strong><p>Feb to Nov {new Date(ADMIN_PREVIEW_TIME).getUTCFullYear()}</p></div>
        <div className="claims-series" tabIndex={0} role="img" aria-label={`Device claims: ${months.map((month) => `${month.label} ${month.count}`).join(", ")}`}>
          {months.map((month) => <div key={month.label} className={month.count === Math.max(...months.map((item) => item.count)) ? "peak" : ""}><span className="claim-bar-value">{month.count === 0 || month.count === 3 ? month.count : ""}</span><i style={{height:Math.max(1,month.count*20)}} /><span>{month.label}</span></div>)}
        </div>
      </section>
      <details className="journey-activity"><summary><span aria-hidden="true"><FigmaIcon name="flag" /></span>Recent journey activity</summary>
        {recentJourneys.length ? <ul>{recentJourneys.map((journey) => <li key={journey.id}><Link className="journey-activity-row" href={`/journeys/${journey.id}`}>
          <span><strong>{journey.origin} to {journey.destination}</strong><span className="journey-activity-meta">{journey.id}, {journeyStatusLabels[journey.status]}</span></span>
          <time dateTime={journey.lastScanTime} title="Timestamp (UTC)">{Date.parse(ADMIN_PREVIEW_TIME)-Date.parse(journey.lastScanTime)>=86_400_000 ? consoleDate(journey.lastScanTime) : relativeContact(journey.lastScanTime).toLowerCase()}</time><FigmaIcon name="chevronRight" />
        </Link></li>)}</ul> : <p className="journey-activity-empty muted">No recent journey activity.</p>}
      </details>
    </>}
  </SectionPage>;
}
