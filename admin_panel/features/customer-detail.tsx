"use client";

import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {useCallback,useState,type FormEvent} from "react";
import {useConsole,useResource,useConsoleState} from "./console-context";
import {SectionPage,LoadingState,ErrorState,EmptyState,Modal} from "@/components/console-ui";
import {RecordHeader,DetailRows} from "@/components/record-detail";
import {PriorityLabel,ConnectivityLabel,SourceLabel} from "@/components/console-data";
import {ConsoleTable,type ConsoleColumn} from "@/components/console-table";
import {customerPresentation,type PairingRecord} from "@/lib/customer-design-fixtures";
import {designDeviceProfiles,designAttentionLabels} from "@/lib/admin-design-fixtures";
import {alertPriority,relativeContact,consoleDate,loadConsolePages,maskedName,maskedEmail} from "@/lib/console-presentation";
import type {Device} from "@/lib/api/types";

export function CustomerDetailFeature({id}:{id:string}) {
  const api=useConsole();
  const {presentation}=useConsoleState();
  const [selected,setSelected]=useState<PairingRecord|null>(null),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[actionError,setActionError]=useState<unknown>(null);
  const load=useCallback(async () => {
    const customer=await api.getCustomerById(id);
    const alerts=await loadConsolePages((page,pageSize) => api.listAlerts({page,pageSize}));
    return {customer,alerts:alerts.filter((alert) => alert.status !== "resolved" && customer.devices.some((device) => device.id === alert.deviceId)).sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp))};
  },[api,id]);
  const {data,loading,error,retry,updateData}=useResource(load);
  async function addNote(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setActionError(null);
    try {const updated=await api.updateCustomerNotes(id,note);updateData((current) => ({...current,customer:{...current.customer,supportNotes:updated.supportNotes}}));setNote("");}catch(error) {setActionError(error);}finally {setBusy(false);}
  }
  if(loading)return <SectionPage title="Customer"><LoadingState label="Loading customer" /></SectionPage>;
  if(error)return <SectionPage title="Customer"><ErrorState error={error} retry={retry} /></SectionPage>;
  if(!data)return <SectionPage title="Customer"><EmptyState title="Customer not found" /></SectionPage>;
  const {customer,alerts}=data;
  const masked=presentation === "engineering";
  const profile=(device:Device) => designDeviceProfiles.find((profile) => profile.deviceId === device.id && profile.serial === device.serial_number);
  const reported=customer.devices.map((device) => profile(device)?.lastContactAt).filter((value):value is string => Boolean(value)).sort().at(-1);
  const reference=customerPresentation[customer.devices[0]?.serial_number];
  const pairings=reference?.pairings ?? [];
  const latestJourney=[...customer.recentJourneys].sort((a,b) => Date.parse(b.departureDate)-Date.parse(a.departureDate))[0];
  const priority=alerts.length ? alerts.map(alertPriority).sort((a,b) => ({Critical:0,Warning:1,Attention:2}[a]-{Critical:0,Warning:1,Attention:2}[b]))[0] : null;
  const columns:ConsoleColumn<Device>[]=[
    {key:"device",label:"Device",width:192,render:(device) => <Link className="mono cell-ink" href={`/devices/${device.id}`}>{device.serial_number}</Link>},
    {key:"ownership",label:"Ownership",width:100,className:"cell-ink",render:(device) => device.status === "revoked" ? "Revoked" : device.owner_id ? "Claimed" : "Unclaimed"},
    {key:"connectivity",label:"Connectivity",width:108,render:(device) => <ConnectivityLabel value={profile(device)?.connectivity ?? "unknown"} />},
    {key:"attention",label:"Attention",width:150,render:(device) => {const value=profile(device);return value?.attention && value.attention !== "none" && value.priority ? <PriorityLabel priority={value.priority}>{designAttentionLabels[value.attention]}</PriorityLabel> : "—";}},
    {key:"contact",label:"Last contact",width:122,render:(device) => relativeContact(profile(device)?.lastContactAt)},
  ];
  const pairingColumns:ConsoleColumn<PairingRecord>[]=[
    {key:"device",label:"Device",width:162,render:(record) => <button className="table-record-button mono" onClick={() => setSelected(record)} aria-label={`View pairing record for ${record.serial}, ${record.event}, ${consoleDate(record.date,false,true)}`}>{record.serial}</button>},
    {key:"event",label:"Event",width:120,className:"cell-ink",render:(record) => record.event},
    {key:"date",label:"Date",width:118,render:(record) => consoleDate(record.date,false,true)},
    {key:"phone",label:"Phone",width:112,render:(record) => record.phone},
    {key:"result",label:"Result",width:160,render:(record) => record.result},
  ];
  return <div className="record-page customer-detail">
    <RecordHeader back="/customers" backLabel="Customers" title={masked ? maskedName(customer.name) : customer.name}
      status={<>{priority ? <PriorityLabel priority={priority}>{alerts.length} open {alerts.length === 1 ? "alert" : "alerts"}</PriorityLabel> : <strong>No open alerts</strong>}<span>Last contact {relativeContact(reported).toLowerCase()}</span></>}
      meta={<><span>{masked ? maskedEmail(customer.email) : customer.email}</span><SourceLabel source={customer.devices[0] ? profile(customer.devices[0])?.source ?? "simulated" : "simulated"} /><span>Times in UTC</span></>} />
    <div className="record-columns"><div className="record-primary">
      {alerts.length > 0 && <section className="customer-alerts"><h2>{alerts.length} open {alerts.length === 1 ? "alert" : "alerts"}</h2>{alerts.map((alert) => <Link className="context-alert" key={alert.id} href={`/alerts/${alert.id}`}><div><PriorityLabel priority={alertPriority(alert)}>{alert.title}</PriorityLabel><p>{alert.location ? `${alert.location}, ` : ""}{consoleDate(alert.timestamp,true)}</p></div><span>{alertPriority(alert)}</span><span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>)}</section>}
      <section className="detail-table"><h2>Devices</h2>{customer.devices.length ? <ConsoleTable label="Customer devices" columns={columns} rows={customer.devices} rowKey={(device) => device.id} /> : <EmptyState title="No linked devices" />}</section>
      <section className="detail-table"><h2>Pairing and ownership</h2>{pairings.length ? <ConsoleTable label="Pairing and ownership" columns={pairingColumns} rows={pairings} rowKey={(record) => `${record.serial}:${record.event}:${record.date}`} /> : <p className="muted">No pairing records found.</p>}</section>
    </div><aside className="record-secondary" aria-label="Customer context">
      <DetailRows title="Account" rows={[
        {label:"Phone",icon:<FigmaIcon name="customer" />,value:reference?.phone ?? "Not recorded"},
        {label:"Country",icon:<FigmaIcon name="location" />,value:reference?.country ?? "Not recorded"},
        {label:"Language",icon:<FigmaIcon name="settings" />,value:reference?.language ?? "Not recorded"},
        {label:"Joined",icon:<FigmaIcon name="clock" />,value:consoleDate(customer.joinedDate,false,true)},
        ...(latestJourney ? [{label:"Latest journey",icon:<FigmaIcon name="flag" />,value:<Link href={`/journeys/${latestJourney.id}`}>{latestJourney.id}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>}] : []),
      ]} />
      <div className="record-disclosures"><details><summary><span aria-hidden="true"><FigmaIcon name="customer" /></span>Support context</summary>
        {customer.supportNotes.length ? <ul>{customer.supportNotes.map((note,index) => <li key={index}>{note}</li>)}</ul> : <p>No support notes recorded.</p>}
        {!masked && <form className="stack" onSubmit={addNote}><label htmlFor="customer-support-note">Add support note</label><textarea id="customer-support-note" required maxLength={1000} value={note} disabled={busy} onChange={(event) => setNote(event.target.value)} />{actionError ? <ErrorState error={actionError} /> : null}<button className="btn btn-secondary" disabled={busy || !note.trim()} aria-busy={busy}>{busy ? "Adding…" : "Add support note"}</button></form>}
      </details></div>
    </aside></div>
    {selected && <Modal drawer side="right" showCloseButton={false} title="Pairing record" onClose={() => setSelected(null)}><div className="pairing-record-content"><DetailRows title="" rows={[
      {label:"Device",value:customer.devices.some((device) => device.serial_number === selected.serial) ? <Link href={`/devices/${customer.devices.find((device) => device.serial_number === selected.serial)!.id}`}>{selected.serial}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link> : selected.serial},
      {label:"Event",value:selected.event},
      {label:selected.event === "Paired" ? "Paired" : "Date",value:consoleDate(selected.pairedAt ?? selected.date,Boolean(selected.pairedAt),true)},
      {label:"Server received",value:selected.serverReceived ?? "Not recorded"},
      {label:"Phone",value:selected.phone},
      {label:"App version",value:selected.appVersion ?? "Not recorded"},
      {label:"Connection",value:selected.connection ?? "Not recorded"},
      {label:"Result",value:selected.result},
    ]} /><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button></div></div></Modal>}
  </div>;
}
