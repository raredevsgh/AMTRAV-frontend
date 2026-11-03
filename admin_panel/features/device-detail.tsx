"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {useConsole,useResource,useConsoleState} from "./console-context";
import {SectionPage,LoadingState,ErrorState,Notice} from "@/components/console-ui";
import {RecordHeader,RecordToast} from "@/components/record-detail";
import {ConsoleTabs} from "@/components/console-tabs";
import {ConnectivityLabel} from "@/components/console-data";
import {ClaimHandoff} from "./claim-handoff";
import {DeviceSummary} from "./device-summary";
import {DeviceAlerts,DeviceLocation,DeviceAuditHistory} from "./device-record-tables";
import {DeviceJourneys} from "./device-journeys";
import {DeviceDiagnostics} from "./device-diagnostics";
import {DeviceActionsMenu,DeviceActionDialog,type DeviceActionKind,type DeviceActionResult} from "./device-detail-actions";
import {designDeviceProfiles} from "@/lib/admin-design-fixtures";
import {deviceSnapshots} from "@/lib/device-design-fixtures";
import {loadConsolePages,relativeContact,maskedEmail} from "@/lib/console-presentation";
import {useConsoleTab} from "@/lib/use-console-tab";
import {MockApiError} from "@/lib/api";
import type {ProvisionedDevice} from "@/lib/api/types";
import type {DeviceDetailData,DeviceDetailView} from "./device-detail-model";

const tabs=[{id:"summary",label:"Summary"},{id:"alerts",label:"Alerts"},{id:"journeys",label:"Journeys"},{id:"location",label:"Location"},{id:"diagnostics",label:"Diagnostics"},{id:"audit",label:"Audit"}] as const;
type Tab=typeof tabs[number]["id"];
export function DeviceDetail({id}:{id:string}) {
  const api=useConsole();
  const {notifyDataChanged}=useConsoleState();
  const [handoff,setHandoff]=useState<{api:typeof api;id:string;result:ProvisionedDevice}|null>(null);
  const load=useCallback(async ():Promise<DeviceDetailData> => {
    const device=await api.getDevice(id);
    const [alerts,journeys,telemetry,admin,revealUntil,customer]=await Promise.all([
      loadConsolePages((page,pageSize) => api.listAlerts({page,pageSize})),
      loadConsolePages((page,pageSize) => api.listJourneys({page,pageSize})),
      api.getDeviceTelemetry(id),api.getDemoDeviceAdminState(id),
      api.session.role === "admin" ? api.getDemoCustomerRevealUntil(id) : Promise.resolve(null),
      device.owner_id && api.session.role === "admin" ? api.getCustomerById(device.owner_id).catch((error:unknown) => {if(error instanceof MockApiError && error.status === 404)return null;throw error;}) : Promise.resolve(null),
    ]);
    return {device,telemetry,admin,revealUntil,customer,customerMissing:Boolean(device.owner_id && api.session.role === "admin" && !customer),alerts:alerts.filter((alert) => alert.deviceId === id),journeys:journeys.filter((journey) => journey.deviceId === id)};
  },[api,id]);
  const {data,loading,error,retry,updateData}=useResource(load);
  const success=(result:DeviceActionResult) => {
    updateData((current) => {
      const next={...current,admin:result.admin};
      if(result.kind === "reveal")return {...next,revealUntil:result.visibleUntil};
      if(result.kind === "rotate")return {...next,device:result.result.device};
      return {...next,device:result.device};
    });
    if(result.kind === "rotate")setHandoff({api,id,result:result.result});
    notifyDataChanged();
  };
  if(handoff?.api === api && handoff.id === id)return <SectionPage title="Claim code updated"><ClaimHandoff result={handoff.result} secondaryLabel="Back to details" onAnother={() => {setHandoff(null);retry();}} /></SectionPage>;
  if(loading)return <SectionPage title="Device details"><LoadingState label="Loading device details" /></SectionPage>;
  if(error)return <SectionPage title="Device details"><ErrorState error={error} retry={retry} /></SectionPage>;
  return data ? <DeviceRecord data={data} onSuccess={success} /> : null;
}

function DeviceRecord({data,onSuccess}:{data:DeviceDetailData;onSuccess:(result:DeviceActionResult)=>void}) {
  const api=useConsole();
  const {presentation}=useConsoleState();
  const [tab,setTab]=useConsoleTab<Tab>(tabs.map((tab) => tab.id),"summary");
  const [action,setAction]=useState<DeviceActionKind|null>(null),[toast,setToast]=useState(""),[justRevoked,setJustRevoked]=useState(false);
  const [revealUntil,setRevealUntil]=useState(() => data.revealUntil !== null && data.revealUntil > Date.now() ? data.revealUntil : null);
  const visibleReveal=revealUntil !== null;
  useEffect(() => {
    if(revealUntil === null)return;
    const expire=() => {if(Date.now() >= revealUntil)setRevealUntil(null);};
    const timer=setTimeout(expire,Math.max(0,revealUntil-Date.now()));
    document.addEventListener("visibilitychange",expire);
    return () => {clearTimeout(timer);document.removeEventListener("visibilitychange",expire);};
  },[revealUntil]);
  useEffect(() => {if(!toast)return;const timer=setTimeout(() => setToast(""),5000);return () => clearTimeout(timer);},[toast]);
  const profile=designDeviceProfiles.find((profile) => profile.deviceId === data.device.id && profile.serial === data.device.serial_number);
  const snapshot=profile ? deviceSnapshots[data.device.serial_number] : undefined;
  const customerVisible=api.session.role === "admin" && (presentation === "operations" || visibleReveal);
  const view:DeviceDetailView={...data,profile,snapshot,customerVisible};
  const contact=profile?.lastContactAt ?? data.telemetry?.lastPing;
  const readOnly=presentation === "engineering";
  const completed=(result:DeviceActionResult) => {
    setAction(null);
    if(result.kind === "reveal") {setRevealUntil(result.visibleUntil);setToast("Visible for 15 minutes");}
    else if(result.kind !== "rotate") {setToast(result.message);if(result.kind === "revoke")setJustRevoked(true);}
    onSuccess(result);
  };
  return <div className="record-page device-detail">
    <RecordHeader back="/devices" backLabel="Devices" title={data.device.serial_number}
      status={<><strong><ConnectivityLabel value={profile?.connectivity ?? (data.telemetry?.connectionType === "offline" ? "offline" : data.telemetry ? "online" : "unknown")} /></strong><span>{contact ? `Last contact ${relativeContact(contact).toLowerCase()}` : "No contact yet"}</span></>}
      meta={<><span>{data.device.model}</span>{data.device.status === "revoked" && <strong className="record-state">Revoked</strong>}{data.device.owner_id ? data.customer && customerVisible ? <Link href={`/customers/${data.customer.id}`}>{data.customer.email}</Link> : <span>{data.customer ? maskedEmail(data.customer.email) : "Customer masked"}</span> : <span>Unclaimed</span>}{readOnly && api.session.role === "admin" && data.customer && !visibleReveal && <button className="detail-value-link" onClick={() => setAction("reveal")}>Reveal</button>}</>}
      actions={!justRevoked ? <DeviceActionsMenu device={data.device} readOnly={readOnly} suspended={data.admin.suspended} onAction={setAction} /> : undefined} />
    {data.customerMissing && <Notice title="The linked customer record is unavailable." tone="warning" />}
    <div className="device-tabs"><ConsoleTabs label="Device details" idPrefix="device" items={tabs} value={tab} onChange={setTab} /></div>
    <div role="tabpanel" id={`device-${tab}`} aria-labelledby={`device-tab-${tab}`}>
      {tab === "summary" ? <DeviceSummary view={view} ownershipOpen={justRevoked} /> : tab === "alerts" ? <DeviceAlerts view={view} /> : tab === "journeys" ? <DeviceJourneys view={view} /> : tab === "location" ? <DeviceLocation view={view} /> : tab === "diagnostics" ? <DeviceDiagnostics view={view} /> : <DeviceAuditHistory view={view} />}
    </div>
    {action && <DeviceActionDialog key={action} kind={action} device={data.device} customerEmail={customerVisible ? data.customer?.email ?? null : null} onClose={() => setAction(null)} onSuccess={completed} />}
    <RecordToast message={toast} />
  </div>;
}
