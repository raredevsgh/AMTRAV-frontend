"use client";
import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {PriorityLabel,SourceLabel} from "@/components/console-data";
import {DetailRows} from "@/components/record-detail";
import {alertPriority,consoleDate,journeyStatusLabels,maskedEmail} from "@/lib/console-presentation";
import type {DeviceDetailView} from "./device-detail-model";

export function DeviceSummary({view,ownershipOpen}:{view:DeviceDetailView;ownershipOpen:boolean}) {
  const {device,profile,snapshot,customer,customerVisible}=view;
  const alerts=view.alerts.filter((alert) => alert.status !== "resolved").sort((a,b) => {
    const priority={critical:0,high:1,medium:2,low:3};return priority[a.severity]-priority[b.severity] || Date.parse(b.timestamp)-Date.parse(a.timestamp);
  });
  const latest=[...view.journeys].sort((a,b) => Date.parse(b.departureDate)-Date.parse(a.departureDate))[0];
  const first=alerts[0];
  return <div className="record-columns device-summary">
    <div className="record-primary"><h2>{alerts.length ? `${alerts.length} open ${alerts.length === 1 ? "alert" : "alerts"}` : "No open alerts"}</h2>
      {first && <div className="featured-alert"><div><PriorityLabel priority={alertPriority(first)}>{alertPriority(first)}</PriorityLabel><h3>{first.title}</h3><p>{first.location ? `${first.location}, ` : ""}{consoleDate(first.timestamp,true)} UTC</p></div><Link className="btn btn-primary" href={`/alerts/${first.id}`}>Investigate</Link></div>}
      {alerts.slice(1).map((alert) => <Link className="context-alert" key={alert.id} href={`/alerts/${alert.id}`}><div><PriorityLabel priority={alertPriority(alert)}>{alert.title}</PriorityLabel><p>{alert.location ? `${alert.location}, ` : ""}{new Date(alert.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"})} UTC</p></div><span className={alertPriority(alert) === "Critical" ? "danger-text" : ""}>{alertPriority(alert)}</span><span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>)}
      {latest ? <section className="device-latest-journey"><div><h3>Latest journey</h3><Link href={`/journeys/${latest.id}`}>View journey</Link></div><Link className="latest-journey-row" href={`/journeys/${latest.id}`}><span className="detail-row-icon" aria-hidden="true"><FigmaIcon name="location" /></span><span className="muted">{latest.id}, {latest.origin} to {latest.destination}</span><span>{journeyStatusLabels[latest.status]}</span></Link></section> : <p className="device-no-journeys muted">No journeys yet</p>}
    </div>
    <aside className="record-secondary" aria-label="Last reported device state"><section className="device-report-card">
      <div className="report-card-header"><h2>Last reported</h2><p><span>{profile?.lastContactAt ? `${consoleDate(profile.lastContactAt,true)} UTC` : view.telemetry?.lastPing ? `${consoleDate(view.telemetry.lastPing,true)} UTC` : "No report yet"}</span><SourceLabel source={profile?.source ?? "simulated"} /></p></div>
      <DetailRows title="" rows={[
        {label:"Battery",icon:<FigmaIcon name="battery" />,value:<span className="battery-report"><span className="battery-mini" role="progressbar" aria-label="Last reported battery" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profile?.battery ?? view.telemetry?.batteryLevel ?? undefined}><i style={{width:`${profile?.battery ?? view.telemetry?.batteryLevel ?? 0}%`}} /></span><span>{profile?.battery != null ? `${profile.battery}%` : view.telemetry ? `${view.telemetry.batteryLevel}%` : "—"}</span></span>},
        {label:"Lock",icon:<FigmaIcon name={snapshot?.lock === "Unlocked" ? "unlock" : "lock"} />,value:snapshot?.lock ?? (view.telemetry ? view.telemetry.lockState === "locked" ? "Locked" : "Unlocked" : "—")},
        {label:"Location",icon:<FigmaIcon name="location" />,value:snapshot?.location ?? (profile?.lastContactAt ? "Not recorded" : "—")},
        {label:"Weight",icon:<FigmaIcon name="weight" />,value:snapshot?.weightKg != null ? `${snapshot.weightKg.toFixed(1)} kg` : "—"},
        {label:"Connection",icon:<FigmaIcon name="signal" />,value:snapshot?.connection ?? "—"},
      ]} />
      <details className="report-ownership" open={ownershipOpen || undefined}><summary><span className="detail-row-icon" aria-hidden="true"><FigmaIcon name="customer" /></span>Ownership</summary><DetailRows title="" rows={[
        {label:"Customer",value:!device.owner_id ? "Unclaimed" : customer && customerVisible ? <Link href={`/customers/${customer.id}`}>{customer.email}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link> : customer ? maskedEmail(customer.email) : "Customer masked"},
        {label:"Claimed",value:device.claimed_at ? consoleDate(device.claimed_at,false,true) : "Not claimed"},
        {label:"Registry state",value:device.status === "revoked" ? "Revoked" : device.status === "claimed" ? "Claimed" : "Unclaimed"},
      ]} />
      <details className="registry-identity"><summary title="Show registry identity"><span>Manufacturer</span><span>{snapshot?.manufacturerLabel ?? device.manufacturer_id}</span></summary><dl><div><dt>Serial number · Immutable</dt><dd className="mono">{device.serial_number}</dd></div><div><dt>Device UUID</dt><dd className="mono">{device.id}</dd></div><div><dt>Manufacturer account</dt><dd className="mono">{device.manufacturer_id}</dd></div><div><dt>Owner ID</dt><dd className="mono">{customerVisible ? device.owner_id ?? "No owner assigned" : "Masked"}</dd></div><div><dt>Nickname</dt><dd>{device.nickname ?? "Not set"}</dd></div><div><dt>Created · UTC</dt><dd>{consoleDate(device.created_at,true,true)}</dd></div><div><dt>Updated · UTC</dt><dd>{consoleDate(device.updated_at,true,true)}</dd></div></dl></details>
      </details>
    </section></aside>
  </div>;
}
