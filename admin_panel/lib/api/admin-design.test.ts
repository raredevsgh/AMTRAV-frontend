import test from "node:test";
import assert from "node:assert/strict";
import { createMockApi, MockApiError } from "./index";
import { designAlerts, designAudits, designCustomers, designDeviceProfiles, designDevices, designJourneys, designTelemetry } from "../admin-design-fixtures";
import { consoleUsers } from "../console-fixtures";

const options = { devices: designDevices, telemetries: designTelemetry, journeys: designJourneys, customers: designCustomers, alerts: designAlerts, audits: designAudits, users: consoleUsers, provisionTelemetry: false };

test("current design fixtures reconcile 13 devices, 12 customers, 10 journeys and 9 open alerts", async () => {
  const api = createMockApi(options);
  assert.equal((await api.listDevices()).items.length, 13);
  assert.equal((await api.listCustomers()).items.length, 12);
  assert.equal((await api.listJourneys()).items.length, 10);
  assert.equal((await api.listAlerts()).items.filter((alert) => alert.status !== "resolved").length, 9);
  assert.equal(designDeviceProfiles.filter((profile) => profile.connectivity === "online").length, 7);
  assert.equal(designDeviceProfiles.filter((profile) => profile.connectivity === "stale" || profile.connectivity === "offline").length, 5);
  assert.equal(new Set(designAlerts.filter((alert) => alert.status !== "resolved").map((alert) => alert.deviceId)).size, 7);
  for (const journey of designJourneys) {
    assert.ok(designDevices.some((device) => device.id === journey.deviceId));
    assert.ok(designCustomers.some((customer) => customer.id === journey.travelerId));
    assert.ok(Date.parse(journey.lastScanTime) >= Date.parse(journey.departureDate), journey.id);
  }
  for (const alert of designAlerts) {
    assert.ok(designDevices.some((device) => device.id === alert.deviceId));
    if (alert.journeyId) assert.equal(designJourneys.find((journey) => journey.id === alert.journeyId)?.deviceId, alert.deviceId);
  }
});

test("unknown and newly registered design records do not acquire invented device readings", async () => {
  const api = createMockApi(options);
  const unknown = designDevices[12];
  assert.equal(await api.getDeviceTelemetry(unknown.id), null);
  await assert.rejects(() => api.triggerDiagnostics(unknown.id), (error) => error instanceof MockApiError && error.status === 409);
  const created = await api.registerDevice({ serial_number: "AMT-NO-READING", model: "Example model", firmware_version: "1.4.2", manufacturer_id: consoleUsers[1].id });
  assert.equal(await api.getDeviceTelemetry(created.device.id), null);
  assert.equal((await api.listTelemetry()).length, 12);
});

test("current design records keep manufacturer reads and direct detail access scoped", async () => {
  const api = createMockApi({ ...options, actor: consoleUsers[1] });
  const devices = (await api.listDevices()).items;
  assert.equal(devices.length, 9);
  assert.ok(devices.every((device) => device.manufacturer_id === api.session.id));
  assert.ok((await api.listJourneys()).items.every((journey) => devices.some((device) => device.id === journey.deviceId)));
  assert.ok((await api.listAlerts()).items.every((alert) => devices.some((device) => device.id === alert.deviceId)));
  await assert.rejects(() => api.getDevice(designDevices[3].id), (error) => error instanceof MockApiError && error.status === 404);
  await assert.rejects(() => api.getCustomerById(designCustomers[0].id), (error) => error instanceof MockApiError && error.status === 403);
});

test("local alert triage validates closures, retains notes and reopens without stale outcome",async () => {
  const api=createMockApi(options);
  const baseline=await api.getAlertById("ALT-5098");
  assert.equal(baseline.notes?.length,2);
  await assert.rejects(api.changeAlertStatus(baseline.id,{status:"resolved"}),/closing requires/);
  await assert.rejects(api.addAlertNote(baseline.id," "),/enter a note/);
  assert.deepEqual(await api.getAlertById(baseline.id),baseline);
  const closed=await api.changeAlertStatus(baseline.id,{status:"resolved",outcome:"no_tampering_found",note:"Airline checked the fictional bag."});
  assert.equal(closed.status,"resolved");assert.equal(closed.notes?.length,3);assert.equal(closed.activity?.length,1);
  assert.equal((await api.listAlerts()).items.filter((alert) => alert.status !== "resolved").length,8);
  await api.addAlertNote(baseline.id,"Additional demo note.");
  const reopened=await api.changeAlertStatus(baseline.id,{status:"active"});
  assert.equal(reopened.status,"active");assert.equal(reopened.outcome,undefined);assert.equal(reopened.resolvedAt,undefined);assert.equal(reopened.notes?.length,4);
  await api.resetDemoData();assert.deepEqual(await api.getAlertById(baseline.id),baseline);
});

test("manufacturer triage cannot change a foreign alert or add notes to it",async () => {
  const api=createMockApi({...options,actor:consoleUsers[1]});
  for(const action of [() => api.addAlertNote("ALT-5124","Foreign note"),() => api.changeAlertStatus("ALT-5124",{status:"acknowledged"})]) {
    await assert.rejects(action,(error) => error instanceof MockApiError && error.status === 404);
  }
});

test("customer reads reflect metadata and lifecycle mutations rather than stale nested snapshots",async () => {
  const api=createMockApi(options),device=designDevices[2],customer=designCustomers[2];
  await api.updateDevice(device.id,{model:"Updated demo model"});
  assert.equal((await api.getCustomerById(customer.id)).devices[0].model,"Updated demo model");
  await api.revokeDevice(device.id);
  assert.equal((await api.getCustomerById(customer.id)).devices[0].status,"revoked");
  await assert.rejects(api.updateCustomerNotes(customer.id,"\u0000"),/enter a support note/);
  assert.equal((await api.getCustomerById(customer.id)).supportNotes.length,0);
});

test("simulated suspension blocks local metadata updates, resumes, and records both actions",async () => {
  const api=createMockApi(options),device=designDevices[2];
  const initial=await api.getDemoDeviceAdminState(device.id);assert.equal(initial.suspended,false);
  await api.setDemoDeviceSuspension(device.id,true,"Open investigation");
  await assert.rejects(api.updateDevice(device.id,{model:"Blocked edit"}),/suspended in this demo/);
  await assert.rejects(api.setDemoDeviceSuspension(device.id,true,"Repeated"),/already has/);
  const resumed=await api.setDemoDeviceSuspension(device.id,false,"Reviewed");
  assert.equal(resumed.suspended,false);assert.equal(resumed.audit.length,initial.audit.length+2);
  await api.updateDevice(device.id,{model:"Resumed demo"});
  await api.resetDemoData({resetAuditLogs:true});assert.deepEqual(await api.getDemoDeviceAdminState(device.id),initial);
});

test("replacement requests validate targets, reject duplicates and preserve current ownership",async () => {
  const api=createMockApi({...options,latencyMs:1}),device=designDevices[2];
  const initial=await api.getDemoDeviceAdminState(device.id);
  await assert.rejects(api.requestDemoReplacement(device.id,designDevices[0].serial_number,"Not reporting","Demo note"),/available fictional/);
  await assert.rejects(api.requestDemoReplacement(device.id,"AMT-ES55-7D20C4","Not reporting",""),/reason and note/);
  assert.deepEqual(await api.getDemoDeviceAdminState(device.id),initial);
  const attempts=await Promise.allSettled([api.requestDemoReplacement(device.id,"AMT-ES55-7D20C4","Not reporting","Demo note"),api.requestDemoReplacement(device.id,"AMT-ES55-7D20C4","Not reporting","Concurrent note")]);
  assert.equal(attempts.filter((result) => result.status === "fulfilled").length,1);
  assert.equal((await api.getDevice(device.id)).owner_id,device.owner_id);
  assert.equal((await api.listDevices()).items.length,13);
  await assert.rejects(api.requestDemoReplacement(designDevices[0].id,"AMT-ES55-7D20C4","Not reporting","Already reserved"),/already been requested/);
});

test("manufacturer can read scoped service state but cannot run admin suspension or replacement",async () => {
  const api=createMockApi({...options,actor:consoleUsers[1]});
  await api.getDemoDeviceAdminState(designDevices[2].id);
  await assert.rejects(api.getDemoDeviceAdminState(designDevices[3].id),(error) => error instanceof MockApiError && error.status === 404);
  await assert.rejects(api.setDemoDeviceSuspension(designDevices[2].id,true,"Open investigation"),(error) => error instanceof MockApiError && error.status === 403);
  await assert.rejects(api.requestDemoReplacement(designDevices[2].id,"AMT-ES55-7D20C4","Not reporting","Demo note"),(error) => error instanceof MockApiError && error.status === 403);
});

test("customer reveal is timed, audited, scoped and cleared on reset",async (context) => {
  context.mock.timers.enable({apis:["Date"],now:new Date("2026-11-02T12:00:00Z").getTime()});
  const api=createMockApi(options),device=designDevices[2];
  assert.equal(await api.getDemoCustomerRevealUntil(device.id),null);
  await assert.rejects(api.revealDemoCustomer(device.id," "),/provide a reveal reason/);
  const result=await api.revealDemoCustomer(device.id,"Investigating a device fault");
  assert.equal(result.visibleUntil,Date.now()+900_000);
  assert.equal((await api.getDemoDeviceAdminState(device.id)).audit.filter((audit) => audit.action === "customer.revealed").length,1);
  assert.equal((await api.listDeviceAudit(device.id)).items.filter((audit) => audit.action === "customer.revealed").length,1);
  context.mock.timers.tick(899_999);assert.equal(await api.getDemoCustomerRevealUntil(device.id),result.visibleUntil);
  context.mock.timers.tick(1);assert.equal(await api.getDemoCustomerRevealUntil(device.id),null);
  await api.revealDemoCustomer(device.id,"Support investigation");await api.resetDemoData();assert.equal(await api.getDemoCustomerRevealUntil(device.id),null);
  const manufacturer=createMockApi({...options,actor:consoleUsers[1]});
  await assert.rejects(manufacturer.revealDemoCustomer(device.id,"Support investigation"),(error) => error instanceof MockApiError && error.status === 403);
  await assert.rejects(api.revealDemoCustomer(designDevices[12].id,"Support investigation"),/no customer/);
});

test("unified demo audit retains metadata, revoke and simulated actions without duplicates",async () => {
  const api=createMockApi(options),device=designDevices[2];
  await api.updateDevice(device.id,{model:"New declaration"});
  await api.setDemoDeviceSuspension(device.id,true,"Investigation");
  await api.setDemoDeviceSuspension(device.id,false,"Reviewed");
  await api.revokeDevice(device.id);
  const history=(await api.getDemoDeviceAdminState(device.id)).audit;
  assert.equal(history.length,7);assert.equal(new Set(history.map((audit) => audit.id)).size,7);
  for(const action of ["metadata_updated","device.suspended (simulated)","device.resumed (simulated)","revoked"]) assert.equal(history.filter((audit) => audit.action === action).length,1);
});
