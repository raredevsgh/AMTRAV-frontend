"use client";
import {FigmaIcon} from "@/components/figma-icon";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import {useSearchParams} from "next/navigation";
import {useConsole,useResource,useConsoleState} from "./console-context";
import {LoadingState,ErrorState,Modal,Field,Notice} from "@/components/console-ui";
import {ConsoleTable,type ConsoleColumn} from "@/components/console-table";
import {RecordToast} from "@/components/record-detail";
import {consoleDate,maskedEmail} from "@/lib/console-presentation";
import {demoReplacementSerial,type DemoAdminAudit} from "@/lib/operations-design-fixtures";
import type {Device} from "@/lib/api/types";

type Phase="suspend"|"replacement"|"confirmReplacement"|null;
export function DeviceAdminActions({devices}:{devices:Device[]}) {
  const params=useSearchParams();
  const requested=params.get("device"),action=params.get("action");
  const device=requested ? devices.find((candidate) => candidate.id === requested) : devices.find((candidate) => candidate.serial_number === "AMT-ES55-5A06B3") ?? devices[0];
  if(!device)return <Notice title="This device is unavailable in your workspace." tone="warning"><button className="btn btn-secondary" onClick={() => selectDevice(devices[0].id)}>Choose an available device</button></Notice>;
  return <DeviceAdminRecord key={device.id} devices={devices} device={device} initialPhase={action === "suspend" || action === "replacement" ? action : null} />;
}

function selectDevice(id:string) {
  const url=new URL(window.location.href);url.searchParams.set("device",id);url.searchParams.delete("action");
  window.history.replaceState(null,"",url.pathname+url.search+url.hash);
}

function DeviceAdminRecord({devices,device,initialPhase}:{devices:Device[];device:Device;initialPhase:"suspend"|"replacement"|null}) {
  const api=useConsole();
  const {presentation,dataRevision,notifyDataChanged}=useConsoleState();
  const readOnly=api.session.role !== "admin" || presentation === "engineering";
  const [phase,setPhase]=useState<Phase>(!readOnly && device.status !== "revoked" && (initialPhase !== "replacement" || device.owner_id) ? initialPhase : null),[confirmed,setConfirmed]=useState(false),[reason,setReason]=useState("Open investigation"),[replacement,setReplacement]=useState(demoReplacementSerial),[replacementReason,setReplacementReason]=useState("Not reporting"),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[actionError,setActionError]=useState<unknown>(null),[notice,setNotice]=useState("");
  const load=useCallback(async () => {
    const state=await api.getDemoDeviceAdminState(device.id);
    const customer=device.owner_id && api.session.role === "admin" && presentation === "operations" ? await api.getCustomerById(device.owner_id) : null;
    return {state,customer,revision:dataRevision};
  },[api,device.id,device.owner_id,presentation,dataRevision]);
  const {data,loading,error,retry}=useResource(load);
  useEffect(() => {if(!notice)return;const timer=setTimeout(() => setNotice(""),5000);return () => clearTimeout(timer);},[notice]);
  const clearAction=() => {const url=new URL(window.location.href);url.searchParams.delete("action");window.history.replaceState(null,"",url.pathname+url.search+url.hash);};
  const close=() => {if(!busy){setPhase(null);clearAction();}};
  const open=(phase:Phase) => {setConfirmed(false);setActionError(null);setNotice("");setPhase(phase);};
  async function suspend(suspended:boolean) {
    if(busy || readOnly)return;setBusy(true);setActionError(null);
    try {await api.setDemoDeviceSuspension(device.id,suspended,suspended ? reason : "Resumed by admin");setPhase(null);clearAction();setNotice(`Device ${suspended ? "suspended" : "resumed"}`);notifyDataChanged();retry();}
    catch(error) {setActionError(error);}finally {setBusy(false);}
  }
  async function requestReplacement(event:FormEvent) {
    event.preventDefault();if(busy || readOnly || !confirmed)return;setBusy(true);setActionError(null);
    try {await api.requestDemoReplacement(device.id,replacement,replacementReason,note);setPhase(null);clearAction();setNotice("Replacement requested");notifyDataChanged();retry();}
    catch(error) {setActionError(error);}finally {setBusy(false);}
  }
  const columns:ConsoleColumn<DemoAdminAudit>[]=[
    {key:"action",label:"Action",width:308,render:(row) => <span className="mono" title={row.action}>{row.action}</span>},
    {key:"who",label:"Who",width:340,render:(row) => readOnly && row.action.includes("claimed") ? maskedEmail(row.who) : row.who},
    {key:"time",label:"Time (UTC)",width:240,render:(row) => consoleDate(row.timestamp,true,true)},
    {key:"detail",label:"Detail",width:252,render:(row) => <span title={row.detail}>{row.detail}</span>},
  ];
  return <div className="operations-admin">
    <div className="admin-device-selector"><Field label="Device" name="admin-device"><select id="admin-device" value={device.id} onChange={(event) => selectDevice(event.target.value)}>{devices.map((device) => <option key={device.id} value={device.id}>{device.serial_number}</option>)}</select></Field>
      <div><strong>{data?.state.suspended ? "Suspended" : device.status === "revoked" ? "Revoked" : "Active"}{data?.state.replacementSerial ? ", replacement requested" : ""}</strong><p className="muted">{data?.customer?.email ?? (device.owner_id ? "Customer masked" : "Unclaimed")}</p></div><span className="muted admin-signed-in">{presentation === "engineering" ? "Signed in as Kofi Asante, Engineering" : api.session.role === "admin" ? "Signed in as Ama Mensah, Admin" : "Manufacturer · read only"}</span>
    </div>
    <RecordToast message={notice} />
    {!phase && actionError ? <ErrorState error={actionError} /> : null}
    {loading ? <LoadingState label="Loading admin action state" /> : error ? <ErrorState error={error} retry={retry} /> : <>
      <div className="admin-action-row"><span className="admin-action-icon" aria-hidden="true"><FigmaIcon name="lock" /></span><div><strong>{data?.state.suspended ? "Resume device" : "Suspend device"}</strong><p>{data?.state.suspended ? "Registry updates are paused" : "Pauses registry updates until it is resumed"}</p></div><span className="muted"><FigmaIcon name="lock" /> Requires Admin</span><button className={`btn ${data?.state.suspended ? "btn-secondary" : "btn-danger"}`} disabled={readOnly || busy || device.status === "revoked"} onClick={() => data?.state.suspended ? void suspend(false) : open("suspend")}>{data?.state.suspended ? "Resume" : "Suspend"}</button></div>
      <div className="admin-action-row"><span className="admin-action-icon" aria-hidden="true"><FigmaIcon name="firmware" /></span><div><strong>Request replacement</strong><p>Moves the customer to a new device</p></div><span className="muted"><FigmaIcon name="lock" /> Requires Admin</span><button className="btn btn-secondary" disabled={readOnly || busy || !device.owner_id || Boolean(data?.state.replacementSerial)} onClick={() => open("replacement")}>Request</button></div>
      <h2 className="admin-audit-title">Audit history</h2>{data?.state.audit.length ? <ConsoleTable label="Device admin audit history" columns={columns} rows={data.state.audit} rowKey={(row) => row.id} /> : <p className="operations-empty">No local audit records.</p>}
    </>}
    {!loading && !error && phase === "replacement" && <Modal key={phase} drawer side="right" showCloseButton={false} title="Request replacement" onClose={close}><form className="status-change-form" onSubmit={(event) => {event.preventDefault();setConfirmed(false);setPhase("confirmReplacement");}}>
      <Field label="New device" name="replacement-device"><select id="replacement-device" value={replacement} onChange={(event) => setReplacement(event.target.value)}><option value={demoReplacementSerial}>{demoReplacementSerial}</option>{devices.filter((candidate) => candidate.status === "registered" && !candidate.owner_id && candidate.id !== device.id).map((candidate) => <option key={candidate.id} value={candidate.serial_number}>{candidate.serial_number}</option>)}</select></Field>
      <Field label="Reason" name="replacement-reason"><select id="replacement-reason" value={replacementReason} onChange={(event) => setReplacementReason(event.target.value)}>{["Not reporting","Damaged","Lost","Other"].map((reason) => <option key={reason}>{reason}</option>)}</select></Field>
      <Field label="Note" name="replacement-note"><input id="replacement-note" required maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} /></Field>
      <p>Replaces {device.serial_number} for {data?.customer?.email ?? "the registered customer"}.</p><p className="muted">Requires Admin. Recorded in the audit history.</p>
      <div className="dialog-actions"><button type="button" className="btn btn-secondary" onClick={close}>Cancel</button><button type="submit" className="btn btn-primary">Continue</button></div>
    </form></Modal>}
    {!loading && !error && (phase === "suspend" || phase === "confirmReplacement") && <Modal key={phase} className="record-modal" showCloseButton={false} title={phase === "suspend" ? `Suspend ${device.serial_number}?` : `Request ${replacement}?`} onClose={close}>
      <form className="stack admin-action-confirm" onSubmit={phase === "suspend" ? (event) => {event.preventDefault();if(confirmed)void suspend(true);} : requestReplacement}>
        <div className="admin-confirm-copy">
        <p>{phase === "suspend" ? "Registry updates would pause until it is resumed. The bag isn’t locked or wiped." : "The new device would take over once the customer pairs it. The old device stays registered until then."}</p>
        <p><strong>Registered to {data?.customer?.email ?? "the current customer"}.</strong></p><p>Requires Admin. You’re signed in as Admin. This is recorded in the audit history.</p></div>
        {actionError ? <ErrorState error={actionError} /> : null}
        <Field label="Reason" name="admin-action-reason"><select id="admin-action-reason" disabled={busy} value={phase === "suspend" ? reason : replacementReason} onChange={(event) => phase === "suspend" ? setReason(event.target.value) : setReplacementReason(event.target.value)}>{(phase === "suspend" ? ["Open investigation","Customer request","Security review","Other"] : ["Not reporting","Damaged","Lost","Other"]).map((reason) => <option key={reason}>{reason}</option>)}</select></Field>
        <label className="admin-confirm-check"><input type="checkbox" disabled={busy} checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />{phase === "suspend" ? "I understand this pauses registry updates" : "I confirm this replacement request"}</label>
        <div className="dialog-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={close}>Cancel</button><button type="submit" className={`btn ${phase === "suspend" ? "btn-danger" : "btn-primary"}`} disabled={!confirmed || busy} aria-busy={busy}>{busy ? "Saving…" : phase === "suspend" ? "Suspend device" : "Request replacement"}</button></div>
      </form>
    </Modal>}
  </div>;
}
