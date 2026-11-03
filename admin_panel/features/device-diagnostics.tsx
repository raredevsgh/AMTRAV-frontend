"use client";
import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {useState,type ReactNode} from "react";
import {Modal} from "@/components/console-ui";
import {DetailRows} from "@/components/record-detail";
import {ConsoleTable,type ConsoleColumn} from "@/components/console-table";
import {SourceLabel,PriorityLabel} from "@/components/console-data";
import {serviceProfiles,recentImpacts} from "@/lib/operations-design-fixtures";
import {alertPriority,consoleDate} from "@/lib/console-presentation";
import {ServiceRecord} from "./device-service-record";
import type {DeviceDetailView} from "./device-detail-model";

type DiagnosticGroup={title:string;icon:ReactNode;rows:{label:string;value:ReactNode}[]};
export function DeviceDiagnostics({view}:{view:DeviceDetailView}) {
  const [all,setAll]=useState(false),[serviceOpen,setServiceOpen]=useState(false),[rawOpen,setRawOpen]=useState(false);
  const service=serviceProfiles[view.device.serial_number];
  const primary=view.device.serial_number === "AMT-ES55-5A06B3";
  const impacts=recentImpacts.filter((impact) => impact.serial === view.device.serial_number);
  const peak=impacts.length ? Math.max(...impacts.map((impact) => impact.force)) : null;
  const alerts=view.alerts.filter((alert) => alert.status !== "resolved" && (!primary || alert.category === "tamper"));
  const reportExists=Boolean(view.profile?.lastContactAt || view.telemetry?.lastPing);
  const groups:DiagnosticGroup[]=[
    {title:"Power",icon:<FigmaIcon name="battery" />,rows:[{label:"Battery",value:view.profile?.battery != null ? `${view.profile.battery}%` : view.telemetry ? `${view.telemetry.batteryLevel}%` : "—"},{label:"Temperature",value:service?.temperature != null ? `${service.temperature} °C` : "Not recorded"},{label:"Charging",value:primary ? "Not charging" : "Not recorded"},{label:"Fuel gauge",value:primary ? "OK" : "Not recorded"}]},
    {title:"Firmware",icon:<FigmaIcon name="firmware" />,rows:[{label:"Installed",value:<span className="mono">{reportExists ? view.profile?.firmware ?? view.telemetry?.firmwareVersion ?? "—" : "—"}</span>},{label:"Latest",value:<span className="mono">1.4.2</span>},{label:"Signature",value:"Not verified"},{label:"Update",value:reportExists && view.profile?.firmware !== "1.4.2" ? "Not started" : reportExists ? "None due" : "Not recorded"}]},
    {title:"Weight calibration",icon:<FigmaIcon name="weight" />,rows:[{label:"Last calibrated",value:consoleDate(service?.calibrated,false,true)},{label:"Zero offset",value:service?.zeroOffset != null ? `${service.zeroOffset.toFixed(2)} kg` : "—"},{label:"Stable reading",value:service?.reading === "Stable" ? "Yes" : service?.reading === "Unstable" ? "No" : "Not recorded"},{label:"History",value:service?.historyCount ? <button className="detail-value-link" onClick={() => setServiceOpen(true)}>{service.historyCount} {service.historyCount === 1 ? "record" : "records"}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></button> : "None"}]},
    {title:"Connectivity",icon:<FigmaIcon name="signal" />,rows:[{label:"Last connection",value:view.snapshot?.connection ?? "Not recorded"},{label:"Signal",value:service?.rssi != null ? `${service.rssi} dBm` : "Not recorded"},{label:"Bluetooth",value:primary ? "Not connected" : "Not recorded"},{label:"Offline queue",value:"Unknown"}]},
    {title:"Sensors",icon:<FigmaIcon name="sensors" />,rows:[{label:"Load cell",value:primary ? "OK" : service?.sensors === "Load cell drift" ? "Drift" : "Not recorded"},{label:"High-g accelerometer",value:primary ? "OK" : "Not recorded"},{label:"Motion sensor",value:primary ? "OK" : "Not recorded"},{label:"Tamper switch",value:primary ? "Triggered" : service?.sensors === "Tamper switch triggered" ? "Triggered" : "Not recorded"},{label:"Lock sensor",value:primary ? "OK" : "Not recorded"}]},
    {title:"Impact detection",icon:<FigmaIcon name="impact" />,rows:[{label:"Moderate from",value:"8 g"},{label:"Severe from",value:"15 g"},{label:"Peak on this journey",value:peak != null ? `${peak} g` : "Not recorded"},{label:"Raw impact data",value:impacts.length ? <button className="detail-value-link" onClick={() => setRawOpen(true)}>Open<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></button> : "Not recorded"}]},
  ];
  const tableColumns:ConsoleColumn<typeof recentImpacts[number]>[]=[{key:"force",label:"Force",width:130,render:(impact) => `${impact.force} g`},{key:"class",label:"Sensor severity",width:160,render:(impact) => impact.name},{key:"priority",label:"Priority",width:140,render:(impact) => impact.priority},{key:"alert",label:"Alert",width:170,render:(impact) => impact.alertId ? <Link href={`/alerts/${impact.alertId}`}>{impact.alertId}</Link> : "—"}];
  return <div className="device-diagnostics"><div className="diagnostic-report-line"><span>Last reported {view.profile?.lastContactAt ? `${consoleDate(view.profile.lastContactAt,true)} UTC` : "not recorded"}</span><SourceLabel source={view.profile?.source ?? "simulated"} />{all && <button className="detail-value-link" onClick={() => setAll(false)}>Show less</button>}</div>
    {!all && <><section className="diagnostic-investigation"><h2>Needs investigation</h2>{alerts.map((alert) => <Link className="context-alert" key={alert.id} href={`/alerts/${alert.id}`}><div><PriorityLabel priority={alertPriority(alert)}>{alert.title}</PriorityLabel><p>{consoleDate(alert.timestamp,true)} UTC. Current state unknown</p></div><span className={alertPriority(alert) === "Critical" ? "danger-text" : ""}>{alertPriority(alert)}</span><span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>)}{reportExists && view.profile?.firmware !== "1.4.2" && <Link className="context-alert" href="/operations?tab=firmware"><div><PriorityLabel priority="Attention">Firmware update</PriorityLabel><p>{view.profile?.firmware ?? view.device.firmware_version} to 1.4.2</p></div><span>Review</span><span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>}{!alerts.length && (!reportExists || view.profile?.firmware === "1.4.2") && <p className="muted">No open investigation items.</p>}</section>
      <div className="diagnostic-heading"><h2>Technical details</h2><button className="detail-value-link" onClick={() => setAll(true)}>View all</button></div>
    </>}
    {all ? <div className="diagnostic-all">{groups.map((group) => <DetailRows key={group.title} title={group.title} rows={group.rows} />)}</div> : <div className="diagnostic-disclosures record-disclosures">{[groups[0],groups[3],groups[1],groups[4],groups[2],groups[5]].map((group) => <details key={group.title}><summary><span aria-hidden="true">{group.icon}</span>{group.title}</summary><DetailRows title="" rows={group.rows} /></details>)}</div>}
    {serviceOpen && <ServiceRecord device={view.device} onClose={() => setServiceOpen(false)} />}
    {rawOpen && <Modal drawer side="right" showCloseButton={false} title="Raw impact data" onClose={() => setRawOpen(false)}><p className="muted">Recorded impact observations. Damage is not confirmed.</p><ConsoleTable label="Impact observations" columns={tableColumns} rows={impacts} rowKey={(impact) => impact.id} /><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setRawOpen(false)}>Close</button></div></Modal>}
  </div>;
}
