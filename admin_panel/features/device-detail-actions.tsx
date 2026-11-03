"use client";
import Link from "next/link";
import {useState,type FormEvent} from "react";
import {useConsole} from "./console-context";
import {FilterMenu} from "@/components/console-filters";
import {Modal,Field,ErrorState} from "@/components/console-ui";
import {validMetadata} from "@/lib/api/validation";
import type {DemoDeviceAdminState} from "@/lib/operations-design-fixtures";
import type {Device,ProvisionedDevice} from "@/lib/api/types";

export type DeviceActionKind="edit"|"rotate"|"revoke"|"reveal";
export type DeviceActionResult=({kind:"edit"|"revoke";device:Device;message:string}|{kind:"rotate";result:ProvisionedDevice}|{kind:"reveal";visibleUntil:number}) & {admin:DemoDeviceAdminState};
export function DeviceActionsMenu({device,readOnly,suspended,onAction}:{device:Device;readOnly:boolean;suspended:boolean;onAction:(kind:DeviceActionKind)=>void}) {
  const api=useConsole();
  const registered=device.status === "registered" && !device.owner_id;
  const admin=api.session.role === "admin" && !readOnly;
  const closeMenu=(event:React.MouseEvent<HTMLButtonElement>,kind:DeviceActionKind) => {
    const menu=event.currentTarget.closest("details");if(menu)menu.open=false;onAction(kind);
  };
  return <div className="record-actions"><FilterMenu label="Actions">
    <button disabled={readOnly || device.status === "revoked" || suspended} onClick={(event) => closeMenu(event,"edit")}>Edit metadata{(readOnly || suspended) && <span>{suspended ? "Suspended" : "Read only"}</span>}</button>
    <button disabled={readOnly || !registered} onClick={(event) => closeMenu(event,"rotate")}>Replace claim code{!registered && <span>{device.status === "revoked" ? "Revoked" : "Already claimed"}</span>}</button>
    <hr />
    {admin && device.status !== "revoked" ? <><Link href={`/operations?tab=admin&device=${device.id}&action=replacement`}>Request replacement<span>Admin action</span></Link><Link href={`/operations?tab=admin&device=${device.id}&action=suspend`}>Suspend device<span>Admin action</span></Link></> : <><button disabled>Request replacement<span>Requires Admin</span></button><button disabled>Suspend device<span>Requires Admin</span></button></>}
    <hr />
    <button className="danger-text" disabled={readOnly || device.status === "revoked"} onClick={(event) => closeMenu(event,"revoke")}>Revoke device</button>
  </FilterMenu></div>;
}

export function DeviceActionDialog({kind,device,customerEmail,onClose,onSuccess}:{kind:DeviceActionKind;device:Device;customerEmail:string|null;onClose:()=>void;onSuccess:(result:DeviceActionResult)=>void}) {
  const api=useConsole();
  const [busy,setBusy]=useState(false),[failure,setFailure]=useState<unknown>(null),[confirmed,setConfirmed]=useState(false);
  const [model,setModel]=useState(device.model),[firmware,setFirmware]=useState(device.firmware_version),[reason,setReason]=useState("Investigating a device fault"),[errors,setErrors]=useState<Record<string,string>>({});
  const close=() => {if(!busy)onClose();};
  async function submit(event:FormEvent) {
    event.preventDefault();if(busy || (kind === "revoke" && !confirmed))return;
    const invalid:Record<string,string>={};
    if(kind === "edit") {
      if(!validMetadata(model,128))invalid.model="Enter a model of at most 128 UTF-8 bytes.";
      if(!validMetadata(firmware,64))invalid.firmware_version="Enter a declared version of at most 64 UTF-8 bytes.";
    }
    setErrors(invalid);if(Object.keys(invalid).length)return;
    setBusy(true);setFailure(null);
    try {
      if(kind === "edit") {const updated=await api.updateDevice(device.id,{model,firmware_version:firmware});onSuccess({kind,device:updated,admin:await api.getDemoDeviceAdminState(device.id),message:"Metadata saved."});}
      else if(kind === "revoke") {const updated=await api.revokeDevice(device.id);onSuccess({kind,device:updated,admin:await api.getDemoDeviceAdminState(device.id),message:"Device revoked"});}
      else if(kind === "rotate") {const result=await api.rotateClaimCode(device.id);onSuccess({kind,result,admin:await api.getDemoDeviceAdminState(device.id)});}
      else {const result=await api.revealDemoCustomer(device.id,reason);onSuccess({kind,...result,admin:await api.getDemoDeviceAdminState(device.id)});}
    }catch(error) {setFailure(error);}finally {setBusy(false);}
  }
  const title=kind === "edit" ? "Edit metadata" : kind === "revoke" ? `Revoke ${device.serial_number}?` : kind === "rotate" ? "Replace the claim code?" : "Reveal customer details?";
  return <Modal className="record-modal device-action-modal" title={title} showCloseButton={false} onClose={close}>
    <form className="stack device-action-form" data-action={kind} noValidate onSubmit={submit}>
      {kind === "edit" ? <>
        <Field label="Model" name="model" error={errors.model}><input id="model" value={model} disabled={busy} onChange={(event) => setModel(event.target.value)} aria-invalid={Boolean(errors.model)} aria-describedby={errors.model ? "model-error" : undefined} /></Field>
        <Field label="Declared firmware version" name="firmware_version" error={errors.firmware_version}><input id="firmware_version" value={firmware} disabled={busy} onChange={(event) => setFirmware(event.target.value)} aria-invalid={Boolean(errors.firmware_version)} aria-describedby={errors.firmware_version ? "firmware_version-error" : undefined} /></Field>
        <p className="field-hint">A declared value, not a measured version. Serial, manufacturer and ownership remain unchanged.</p>
      </> : kind === "revoke" ? <>
        <div className="device-revoke-copy"><p>Claiming and registry updates stop permanently.</p><p>It doesn’t lock or wipe the bag.</p>
        {customerEmail && <p><strong>Registered to {customerEmail}.</strong></p>}</div>
        <label className="admin-confirm-check"><input type="checkbox" disabled={busy} checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I understand this can’t be undone</label>

      </> : kind === "rotate" ? <p>The previous code becomes invalid. Save the new one-time code securely before leaving its result.</p> : <>
        <p>Logged in Audit. Visible for 15 minutes.</p>
        <Field label="Reason" name="customer-reveal-reason"><select id="customer-reveal-reason" disabled={busy} value={reason} onChange={(event) => setReason(event.target.value)}><option>Investigating a device fault</option><option>Support investigation</option><option>Customer request</option></select></Field>
      </>}
      {failure ? <ErrorState error={failure} /> : null}
      <div className="dialog-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={close}>{kind === "edit" ? "Cancel editing" : "Cancel"}</button><button type="submit" aria-busy={busy} className={`btn ${kind === "revoke" ? "btn-danger" : "btn-primary"}`} disabled={busy || (kind === "revoke" && !confirmed)}>{busy ? <><span className="working-spinner" aria-hidden="true" />Working</> : kind === "edit" ? "Save metadata" : kind === "revoke" ? "Revoke device" : kind === "rotate" ? "Replace code" : "Reveal"}</button></div>
    </form>
  </Modal>;
}
