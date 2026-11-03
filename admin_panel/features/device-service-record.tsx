"use client";
import {Modal} from "@/components/console-ui";
import {DetailRows} from "@/components/record-detail";
import {serviceProfiles} from "@/lib/operations-design-fixtures";
import {consoleDate} from "@/lib/console-presentation";
import type {Device} from "@/lib/api/types";

export function ServiceRecord({device,onClose}:{device:Device;onClose:()=>void}) {
  const profile=serviceProfiles[device.serial_number];
  return <Modal drawer side="right" showCloseButton={false} title={device.serial_number} onClose={onClose}><div className="service-record-content">
    <DetailRows title="Latest reading" rows={[
      {label:"State",value:profile?.reading ?? "No reading"},{label:"Weight",value:profile?.weightKg != null ? `${profile.weightKg.toFixed(1)} kg` : profile?.reading === "Unstable" ? "Not saved" : "Not recorded"},
      {label:"Spread",value:profile?.spread ?? "Not recorded"},{label:"Stable when",value:"Under 0.1 kg for 3 s"},
    ]} />
    <DetailRows title="Calibration history" rows={(profile?.calibrations ?? []).map((record) => ({label:consoleDate(record.date,false,true),value:`Zero offset ${record.offset.toFixed(2)} kg`}))} />
    <DetailRows title="Sensors" rows={["Load cell","High-g accelerometer","Motion sensor","Tamper switch","Lock sensor"].map((sensor) => ({label:sensor,value:!profile || profile.reading === "No reading" ? "Not recorded" : sensor === "Load cell" && profile.sensors === "Load cell drift" ? "Drift" : sensor === "Tamper switch" && profile.sensors === "Tamper switch triggered" ? "Triggered" : "OK"}))} />
    <div className="dialog-actions"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
  </div></Modal>;
}
