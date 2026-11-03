"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useConsole, useResource } from "./console-context";
import { SectionPage, LoadingState, ErrorState, Notice, Field } from "@/components/console-ui";
import type { ConsoleSettingsConfig } from "@/lib/api/types";

export function SettingsFeature() {
  const api = useConsole();
  const load = useCallback(() => api.getSettings(),[api]);
  const {data,error,loading,retry} = useResource(load);
  return <SectionPage title="Settings" description="Manage device policies and workspace preferences." className="settings-page">
    {loading ? <LoadingState label="Loading settings" /> : error ? <ErrorState error={error} retry={retry} /> : data ? <SettingsForm initial={data} /> : null}
  </SectionPage>;
}

function SettingsForm({initial}:{initial:ConsoleSettingsConfig}) {
  const api = useConsole();
  const [draft,setDraft] = useState(initial);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState<unknown>(null);
  const [notice,setNotice] = useState("");
  const readOnly = api.session.role !== "admin";
  const update = <K extends keyof ConsoleSettingsConfig>(key:K,value:ConsoleSettingsConfig[K]) => {setDraft((current) => ({...current,[key]:value}));setNotice("");};
  async function save(event:FormEvent) {
    event.preventDefault();
    if (busy || readOnly) return;
    setBusy(true);setError(null);setNotice("");
    try {setDraft(await api.updateSettings(draft));setNotice("Settings saved.");}
    catch(error) {setError(error);}
    finally {setBusy(false);}
  }
  return <div className="settings-form">
    {notice && <Notice title={notice} tone="success" />}
    {error ? <ErrorState error={error} /> : null}
    {readOnly && <Notice title="Your role has read-only access." />}
    <form onSubmit={save}>
      <fieldset disabled={busy || readOnly}>
        <legend>Device policies</legend>
        <div className="form-grid">
          <Field label="Telemetry ping interval" name="telemetryInterval"><select id="telemetryInterval" value={draft.telemetryIntervalSec} onChange={(event) => update("telemetryIntervalSec",Number(event.target.value))}>
            {[30,60,120,300].map((value) => <option key={value} value={value}>{value} seconds</option>)}
          </select></Field>
          <Field label="Low battery threshold" name="batteryThreshold"><select id="batteryThreshold" value={draft.lowBatteryThresholdPct} onChange={(event) => update("lowBatteryThresholdPct",Number(event.target.value))}>
            {[10,15,20,25].map((value) => <option key={value} value={value}>{value}%</option>)}
          </select></Field>
          <Field label="API rate limit" name="rateLimit"><select id="rateLimit" value={draft.apiRateLimitRpm} onChange={(event) => update("apiRateLimitRpm",Number(event.target.value))}>
            {[60,120,240,600].map((value) => <option key={value} value={value}>{value} requests per minute</option>)}
          </select></Field>
        </div>
        <div className="settings-checks">
          <label><input type="checkbox" checked={draft.flightSafeAutoEngage} onChange={(event) => update("flightSafeAutoEngage",event.target.checked)} /><span>Automatically engage flight-safe mode</span></label>
          <label><input type="checkbox" checked={draft.criticalTamperAlerts} onChange={(event) => update("criticalTamperAlerts",event.target.checked)} /><span>Escalate critical tamper alerts</span></label>
          <label><input type="checkbox" checked={draft.maintenanceMode} onChange={(event) => update("maintenanceMode",event.target.checked)} /><span>Maintenance mode</span></label>
        </div>
        {!readOnly && <div className="form-actions"><button className="btn btn-primary" type="submit" aria-busy={busy}>{busy ? "Saving…" : "Save changes"}</button></div>}
      </fieldset>
    </form>
    <section className="panel" aria-labelledby="geofences-heading"><h2 id="geofences-heading">Geofences</h2><p className="muted">Airport locations included in the workspace configuration.</p><ul className="settings-geofences" aria-label="Configured geofences">{draft.allowedGeofences.map((location) => <li key={location}>{location}</li>)}</ul>{!draft.allowedGeofences.length && <p>No geofences configured.</p>}</section>
  </div>;
}
