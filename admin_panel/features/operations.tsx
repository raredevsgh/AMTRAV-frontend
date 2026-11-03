"use client";

import Link from "next/link";
import {useCallback,useState} from "react";
import {useConsole,useResource,useConsoleState} from "./console-context";
import {SectionPage,LoadingState,ErrorState,EmptyState} from "@/components/console-ui";
import {ConsoleTable,type ConsoleColumn} from "@/components/console-table";
import {ConsoleTabs} from "@/components/console-tabs";
import {FilterMenu,FilterOptions} from "@/components/console-filters";
import {DetailRows} from "@/components/record-detail";
import {PriorityLabel,SourceLabel} from "@/components/console-data";
import {designDeviceProfiles} from "@/lib/admin-design-fixtures";
import {serviceProfiles,impactClassifications,recentImpacts,firmwareVersions,firmwareHistory} from "@/lib/operations-design-fixtures";
import {useConsoleTab} from "@/lib/use-console-tab";
import {loadConsolePages,consoleDate} from "@/lib/console-presentation";
import type {Device} from "@/lib/api/types";
import {ServiceRecord} from "./device-service-record";
import {DeviceAdminActions} from "./operations-admin-actions";

const tabs=[{id:"weight",label:"Weight and sensors"},{id:"impact",label:"Impact rules"},{id:"firmware",label:"Firmware"},{id:"maintenance",label:"Maintenance"},{id:"admin",label:"Admin actions"}] as const;
type Tab=typeof tabs[number]["id"];
export function Operations() {
  const api=useConsole();
  const {presentation}=useConsoleState();
  const [tab,setTab]=useConsoleTab<Tab>(tabs.map((tab) => tab.id),"weight");
  const [reading,setReading]=useState("all"),[selected,setSelected]=useState<Device|null>(null);
  const load=useCallback(() => loadConsolePages((page,limit) => api.listDevices({limit,offset:(page-1)*limit})),[api]);
  const {data,loading,error,retry}=useResource(load);
  const devices=data ?? [];
  const rows=devices.filter((device) => reading === "all" || serviceProfiles[device.serial_number]?.reading.toLowerCase().replace(" ","_") === reading);
  const deviceLink=(device:Device) => <Link className="mono cell-ink" href={`/devices/${device.id}`}>{device.serial_number}</Link>;
  const columns:ConsoleColumn<Device>[] = tab === "maintenance" ? [
    {key:"device",label:"Device",width:198,render:deviceLink},
    {key:"condition",label:"Condition",width:150,render:(device) => serviceProfiles[device.serial_number]?.condition === "Check" ? <PriorityLabel priority="Attention">Check</PriorityLabel> : serviceProfiles[device.serial_number]?.condition ?? "Not recorded"},
    {key:"test",label:"Last self-test",width:170,render:(device) => consoleDate(serviceProfiles[device.serial_number]?.selfTest,false,true)},
    {key:"battery",label:"Battery",width:130,render:(device) => {const profile=designDeviceProfiles.find((profile) => profile.serial === device.serial_number && profile.deviceId === device.id);return profile?.battery != null ? `${profile.battery}%` : "—";}},
    {key:"step",label:"Next step",width:260,render:(device) => {const profile=serviceProfiles[device.serial_number];return profile && !["None","Nothing due"].includes(profile.nextStep) ? <PriorityLabel priority={profile.nextStep.startsWith("Update") || profile.nextStep.startsWith("Repeat") ? "Warning" : "Attention"}>{profile.nextStep}</PriorityLabel> : profile?.nextStep ?? "Not recorded";}},
    {key:"temp",label:"Temp",width:120,render:(device) => serviceProfiles[device.serial_number]?.temperature != null ? `${serviceProfiles[device.serial_number].temperature} °C` : "—"},
    {key:"signal",label:"Signal",width:112,render:(device) => serviceProfiles[device.serial_number]?.rssi != null ? `${serviceProfiles[device.serial_number].rssi} dBm` : "—"},
  ] : [
    {key:"device",label:"Device",width:198,render:deviceLink},
    {key:"reading",label:"Reading",width:150,render:(device) => serviceProfiles[device.serial_number]?.reading === "Unstable" ? <PriorityLabel priority="Warning">Unstable</PriorityLabel> : serviceProfiles[device.serial_number]?.reading ?? "No reading"},
    {key:"calibrated",label:"Last calibrated",width:170,render:(device) => serviceProfiles[device.serial_number]?.calibrated ? consoleDate(serviceProfiles[device.serial_number].calibrated,false,true) : "Never"},
    {key:"offset",label:"Zero offset",width:130,render:(device) => serviceProfiles[device.serial_number]?.zeroOffset != null ? `${serviceProfiles[device.serial_number].zeroOffset?.toFixed(2)} kg` : "—"},
    {key:"sensors",label:"Sensors",width:260,render:(device) => {const sensors=serviceProfiles[device.serial_number]?.sensors;return sensors === "Tamper switch triggered" || sensors === "Load cell drift" ? <PriorityLabel priority={sensors === "Load cell drift" ? "Attention" : "Critical"}>{sensors}</PriorityLabel> : sensors ?? "Not tested";}},
    {key:"history",label:"History",width:120,render:(device) => {const count=serviceProfiles[device.serial_number]?.historyCount;return count ? <button className="table-record-button" aria-label={`View service record for ${device.serial_number}`} onClick={() => setSelected(device)}>{count} {count === 1 ? "record" : "records"}</button> : "None";}},
    {key:"source",label:"Data",width:112,render:(device) => <SourceLabel source={designDeviceProfiles.find((profile) => profile.serial === device.serial_number)?.source ?? "simulated"} />},
  ];
  return <SectionPage title="Device Operations" className="operations-page">
    <div className="operations-toolbar"><ConsoleTabs label="Device operations" idPrefix="operations" items={tabs} value={tab} onChange={setTab} separateLast /><span className="muted">{tab === "admin" ? presentation === "engineering" ? "Read only for your role" : "Administrator actions" : "Read only"}</span>
      {tab === "weight" && <FilterMenu label={reading === "all" ? "Reading" : `Reading: ${reading === "no_reading" ? "No reading" : reading[0].toUpperCase()+reading.slice(1)}`} active={reading !== "all"}><FilterOptions label="Reading" name="reading" value={reading} options={[["all","All readings"],["stable","Stable"],["unstable","Unstable"],["no_reading","No reading"]]} onChange={setReading} /></FilterMenu>}
    </div>
    <div role="tabpanel" id={`operations-${tab}`} aria-labelledby={`operations-tab-${tab}`}>
      {loading ? <LoadingState label="Loading device operations" /> : error ? <ErrorState error={error} retry={retry} /> : !devices.length ? <EmptyState title="No devices found" /> : tab === "admin" ? <DeviceAdminActions devices={devices} /> : tab === "impact" ? <ImpactRules devices={devices} /> : tab === "firmware" ? <FirmwareReference devices={devices} /> : (tab === "maintenance" ? devices : rows).length ? <ConsoleTable label={tab === "maintenance" ? "Device maintenance" : "Weight and sensors"} columns={columns} rows={tab === "maintenance" ? devices : rows} rowKey={(device) => device.id} /> : <EmptyState title="No matching readings"><p>Choose another reading filter.</p></EmptyState>}
    </div>
    {selected && <ServiceRecord device={selected} onClose={() => setSelected(null)} />}
  </SectionPage>;
}

function ImpactRules({devices}:{devices:Device[]}) {
  type Classification=typeof impactClassifications[number];type Impact=typeof recentImpacts[number];
  const classColumns:ConsoleColumn<Classification>[]=[{key:"class",label:"Class",width:162,className:"cell-ink",render:(row) => row.name},{key:"force",label:"Force",width:120,className:"cell-ink",render:(row) => row.force},{key:"sensor",label:"Sensor severity",width:118,render:(row) => row.sensor},{key:"priority",label:"Priority",width:112,render:(row) => row.priority},{key:"note",label:"Note",width:160,render:(row) => row.note}];
  const impactColumns:ConsoleColumn<Impact>[]=[{key:"device",label:"Device",width:162,render:(row) => <Link className="mono muted" href={`/devices/${devices.find((device) => device.serial_number === row.serial)?.id}`}>{row.serial}</Link>},{key:"force",label:"Force",width:120,className:"cell-ink",render:(row) => `${row.force} g`},{key:"class",label:"Class",width:118,render:(row) => row.name},{key:"priority",label:"Priority",width:112,render:(row) => row.priority},{key:"alert",label:"Alert",width:160,render:(row) => row.alertId ? <Link className="muted" href={`/alerts/${row.alertId}`}>{row.alertId}</Link> : "—"}];
  return <div className="operations-columns record-columns"><div className="record-primary"><section className="detail-table"><h2>Classifications</h2><ConsoleTable label="Impact classifications" columns={classColumns} rows={impactClassifications} rowKey={(row) => row.id} /></section><section className="detail-table"><h2>Recently classified</h2><ConsoleTable label="Recently classified impacts" columns={impactColumns} rows={recentImpacts.filter((row) => devices.some((device) => device.serial_number === row.serial))} rowKey={(row) => row.id} /></section></div>
    <DetailRows title="How priority works" rows={[{label:"Isolated severe impact",value:"Warning"},{label:"Related tamper event",value:"Critical"},{label:"Repeated significant impacts",value:"Critical"},{label:"Other high-risk condition",value:"Critical"},{label:"What an impact means",value:"Force recorded"},{label:"Damage",value:"Not confirmed"}]} />
  </div>;
}
function FirmwareReference({devices}:{devices:Device[]}) {
  type Version=typeof firmwareVersions[number];type History=typeof firmwareHistory[number];
  const versionColumns:ConsoleColumn<Version>[]=[{key:"version",label:"Version",width:162,render:(row) => <span className="mono">{row.id}</span>},{key:"released",label:"Released",width:120,className:"cell-ink",render:(row) => consoleDate(row.released,false,true)},{key:"devices",label:"Devices",width:118,render:(row) => devices.filter((device) => device.firmware_version === row.id).length},{key:"state",label:"State",width:112,render:(row) => row.state},{key:"signature",label:"Signature",width:160,render:() => "Not verified"}];
  const historyColumns:ConsoleColumn<History>[]=[{key:"device",label:"Device",width:162,render:(row) => <Link className="mono muted" href={`/devices/${devices.find((device) => device.serial_number === row.serial)?.id}`}>{row.serial}</Link>},{key:"change",label:"Change",width:120,className:"cell-ink",render:(row) => row.change},{key:"date",label:"Date",width:118,render:(row) => consoleDate(row.date,false,true)},{key:"connection",label:"Connection",width:112,render:(row) => row.connection},{key:"result",label:"Result",width:160,render:(row) => row.result}];
  return <div className="operations-columns record-columns"><div className="record-primary"><section className="detail-table"><h2>Versions</h2><ConsoleTable label="Firmware versions" columns={versionColumns} rows={firmwareVersions} rowKey={(row) => row.id} /></section><section className="detail-table"><h2>Update history</h2><ConsoleTable label="Firmware update history" columns={historyColumns} rows={firmwareHistory.filter((row) => devices.some((device) => device.serial_number === row.serial))} rowKey={(row) => row.id} /></section></div>
    <DetailRows title="Latest firmware file" rows={[{label:"File",value:"amortrav-core-1.4.2.bin"},{label:"Size",value:"1.8 MB"},{label:"Checksum",value:"a41f…9c02"},{label:"Signature",value:"Not verified"},{label:"Data",value:"Sample"}]} />
  </div>;
}
