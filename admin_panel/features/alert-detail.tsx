"use client";

import Link from "next/link";
import {FigmaIcon} from "@/components/figma-icon";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import {useConsole,useResource,useConsoleState} from "./console-context";
import {SectionPage,LoadingState,ErrorState,EmptyState,Modal,Field} from "@/components/console-ui";
import {RecordHeader,DetailRows,RecordToast} from "@/components/record-detail";
import {JourneyTimeline} from "@/components/journey-timeline";
import {PriorityLabel,SourceLabel} from "@/components/console-data";
import {alertPresentation,alertOutcomeLabels} from "@/lib/alert-design-fixtures";
import {designDeviceProfiles} from "@/lib/admin-design-fixtures";
import {alertPriority,alertStatusLabels,consoleDate,loadConsolePages} from "@/lib/console-presentation";
import type {AlertStatus,AlertOutcome,AlertRecord} from "@/lib/api/types";

export function AlertDetailFeature({id}:{id:string}) {
  const api=useConsole();
  const {presentation,notifyDataChanged}=useConsoleState();
  const [editing,setEditing]=useState(false),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[actionError,setActionError]=useState<unknown>(null),[notice,setNotice]=useState("");
  const load=useCallback(async () => {
    const alert=await api.getAlertById(id);
    const [device,alerts]=await Promise.all([api.getDevice(alert.deviceId),loadConsolePages((page,pageSize) => api.listAlerts({page,pageSize}))]);
    const customer=device.owner_id && api.session.role === "admin" ? await api.getCustomerById(device.owner_id) : null;
    return {alert,customer,related:alerts.filter((candidate) => candidate.deviceId === device.id && candidate.id !== id && candidate.status !== "resolved").sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp))};
  },[api,id]);
  const {data,loading,error,retry,updateData}=useResource(load);
  useEffect(() => {if(!notice)return;const timer=setTimeout(() => setNotice(""),5000);return () => clearTimeout(timer);},[notice]);
  async function addNote(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setActionError(null);setNotice("");
    try {const alert=await api.addAlertNote(id,note);updateData((current) => ({...current,alert}));setNote("");setNotice("Demo note added locally");}
    catch(error) {setActionError(error);}finally {setBusy(false);}
  }
  if(loading)return <SectionPage title="Alert"><LoadingState label="Loading alert" /></SectionPage>;
  if(error)return <SectionPage title="Alert"><ErrorState error={error} retry={retry} /></SectionPage>;
  if(!data)return <SectionPage title="Alert"><EmptyState title="Alert not found" /></SectionPage>;
  const {alert,customer,related}=data;
  const reference=alertPresentation[alert.id];
  const profile=designDeviceProfiles.find((profile) => profile.deviceId === alert.deviceId && profile.serial === alert.deviceSerial);
  const priority=alertPriority(alert);
  const customerVisible=api.session.role === "admin" && presentation === "operations";
  const canEdit=presentation === "operations";
  const status=alert.status === "resolved" && alert.outcome ? `Closed: ${alertOutcomeLabels[alert.outcome].toLowerCase()}` : alertStatusLabels[alert.status];
  return <div className="record-page alert-detail">
    <RecordHeader back="/alerts" backLabel="Alerts" title={alert.title} status={<><PriorityLabel priority={priority}>{priority}</PriorityLabel><span>{status}</span></>}
      meta={<><span className="mono">{alert.id}</span><SourceLabel source={profile?.source ?? "simulated"} /><span>{consoleDate(alert.timestamp,true)} UTC</span></>}
      actions={canEdit ? <button className="btn btn-primary" onClick={() => setEditing(true)}>Change status</button> : <span className="muted">Read only</span>} />
    <RecordToast message={notice} />
    <div className="record-columns"><div className="record-primary">
      <section className="alert-evidence"><h2>Evidence</h2><JourneyTimeline events={reference?.evidence ?? []} />{!reference && <p className="muted">No evidence recorded for this alert.</p>}</section>
      <section className="alert-notes"><h2>Notes</h2>
        {(alert.notes ?? []).map((note) => <article key={note.id}><div><strong>{note.author.endsWith("@amortrav.example.invalid") ? "Ama Mensah" : note.author}</strong><time dateTime={note.timestamp}>{consoleDate(note.timestamp,true)}</time></div><p>{note.text}</p></article>)}
        {canEdit && <form onSubmit={addNote}>
          <label htmlFor="alert-note">Add note</label><div><input id="alert-note" value={note} placeholder="Write a note" required maxLength={1000} disabled={busy} onChange={(event) => setNote(event.target.value)} /><button className="btn btn-secondary" disabled={busy || !note.trim()} aria-busy={busy}>{busy ? "Adding…" : "Add"}</button></div>
          {actionError ? <ErrorState error={actionError} /> : null}
        </form>}
      </section>
      <div className="record-disclosures"><details><summary><span aria-hidden="true"><FigmaIcon name="info" /></span>Why {priority}</summary><p>This alert is classified as {priority.toLowerCase()}. {alert.category === "impact" ? "Sensor severity describes the impact reading; damage has not been confirmed." : "It does not establish the device’s current physical state."}</p></details>
        <details><summary><span aria-hidden="true"><FigmaIcon name="clock" /></span>Activity</summary>{alert.activity?.length ? <ul>{alert.activity.map((event,index) => <li key={index}>{consoleDate(event.timestamp,true)} UTC · {alertStatusLabels[event.status]} · {event.author}</li>)}</ul> : <p>No status changes recorded.</p>}</details>
      </div>
    </div><aside className="record-secondary" aria-label="Alert context">
      <DetailRows title="Alert" rows={[
        {label:"Device",icon:<FigmaIcon name="firmware" />,value:<Link href={`/devices/${alert.deviceId}`}>{alert.deviceSerial}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>},
        ...(alert.journeyId ? [{label:"Journey",icon:<FigmaIcon name="flag" />,value:<Link href={`/journeys/${alert.journeyId}`}>{alert.journeyId}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>}] : []),
        {label:"Customer",icon:<FigmaIcon name="customer" />,value:customerVisible && customer ? <Link href={`/customers/${customer.id}`}>{customer.email}<span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link> : "Customer masked"},
        {label:"Location",icon:<FigmaIcon name="location" />,value:alert.location ?? "Not recorded"},
        {label:"Assigned to",icon:<FigmaIcon name="customer" />,value:alert.assignedTo ?? "Unassigned"},
        ...(alert.category === "impact" ? [{label:"Sensor severity",icon:<FigmaIcon name="impact" />,value:"Severe"},{label:"Damage",icon:<FigmaIcon name="warning" />,value:"Not confirmed"}] : []),
      ]} />
      {related.length > 0 && <section className="context-alerts"><h2>Related alerts</h2>{related.map((related) => <Link className="context-alert" key={related.id} href={`/alerts/${related.id}`}><div><PriorityLabel priority={alertPriority(related)}>{related.title}</PriorityLabel><p>{related.location ?? "Not recorded"}, {new Date(related.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"})}</p></div><span>{alertPriority(related)}</span><span aria-hidden="true"><FigmaIcon name="chevronRight" /></span></Link>)}</section>}
    </aside></div>
    {editing && <AlertStatusForm alert={alert} onClose={() => setEditing(false)} onSaved={(alert) => {setEditing(false);updateData((current) => ({...current,alert}));notifyDataChanged();setNotice(alert.status === "resolved" ? "Alert closed" : "Alert status updated");}} />}
  </div>;
}

function AlertStatusForm({alert,onClose,onSaved}:{alert:AlertRecord;onClose:()=>void;onSaved:(alert:AlertRecord)=>void}) {
  const api=useConsole();
  const [status,setStatus]=useState<AlertStatus>(alert.status),[outcome,setOutcome]=useState<AlertOutcome>(alert.outcome ?? (alert.category === "tamper" ? "no_tampering_found" : alert.category === "battery" ? "charged" : alert.category === "calibration" ? "recalibrated" : "reviewed"));
  const [note,setNote]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState<unknown>(null);
  async function save(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setError(null);
    try {const updated=await api.changeAlertStatus(alert.id,{status,...(status === "resolved" ? {outcome} : {}),note});onSaved(updated);}
    catch(error) {setError(error);}finally {setBusy(false);}
  }
  return <Modal drawer side="right" showCloseButton={false} title="Change status" onClose={() => {if(!busy)onClose();}}><form onSubmit={save} className="status-change-form">
    <fieldset disabled={busy} className="stack">
      <Field label="Status" name="alert-status"><select id="alert-status" value={status} onChange={(event) => setStatus(event.target.value as AlertStatus)}>{Object.entries(alertStatusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      {status === "resolved" && <Field label="Outcome" name="alert-outcome"><select id="alert-outcome" value={outcome} onChange={(event) => setOutcome(event.target.value as AlertOutcome)}>{Object.entries(alertOutcomeLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field>}
      <Field label="Note" name="alert-status-note"><input id="alert-status-note" required={status === "resolved"} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} /></Field>
    </fieldset>
    {error ? <ErrorState error={error} /> : null}

    <div className="dialog-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>{busy ? "Saving…" : "Save"}</button></div>
  </form></Modal>;
}
