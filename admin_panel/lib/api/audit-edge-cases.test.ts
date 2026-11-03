import test from "node:test";
import assert from "node:assert/strict";
import {createMockApi,mockUserForRole} from "./mock-service";
import type {ConsoleSettingsConfig} from "./types";

test("registry pages reject non-finite and fractional pagination without hiding records",async () => {
  const api=createMockApi({actor:mockUserForRole("admin")});
  for(const value of [NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1]) {
    for(const list of [api.listAlerts.bind(api),api.listCustomers.bind(api),api.listJourneys.bind(api)]) {
      await assert.rejects(list({page:value}),/safe integers/);
      await assert.rejects(list({pageSize:value}),/safe integers/);
    }
  }
  const result=await api.listAlerts({page:0,pageSize:0});
  assert.equal(result.limit,1);assert.equal(result.offset,0);
});

test("invalid policy updates are atomic and manufacturer updates are denied",async () => {
  const api=createMockApi({actor:mockUserForRole("admin")});
  const baseline=await api.getSettings();
  for(const patch of [{telemetryIntervalSec:NaN},{lowBatteryThresholdPct:101},{apiRateLimitRpm:-1},{maintenanceMode:"true"},{theme:"invisible"},{allowedGeofences:["<script>"]},{unknown:true}]) {
    await assert.rejects(api.updateSettings(patch as Partial<ConsoleSettingsConfig>),/invalid demo settings|unknown demo setting/);
    assert.deepEqual(await api.getSettings(),baseline);
  }
  await assert.rejects(createMockApi({actor:mockUserForRole("manufacturer")}).updateSettings({theme:"dark"}),/admin role required/);
});

test("settings do not retain caller-owned arrays and disabled reset is enforced",async () => {
  const api=createMockApi({actor:mockUserForRole("admin")});
  const airports=["ACC"];
  await api.updateSettings({allowedGeofences:airports});airports.push("BAD");
  assert.deepEqual((await api.getSettings()).allowedGeofences,["ACC"]);
  await api.updateSettings({demoResetAllowed:false});
  await assert.rejects(api.resetDemoData(),/demo reset is disabled/);
});

test("rollout scopes never silently broaden when a target is missing or invalid",async () => {
  const api=createMockApi({actor:mockUserForRole("admin")});
  for(const payload of [{targetScope:"single"},{targetScope:"manufacturer"},{targetScope:"unknown"},{targetScope:"fleet",rolloutPercentage:0},{targetScope:"fleet",rolloutPercentage:101},{targetScope:"fleet",rolloutPercentage:NaN},{targetScope:"fleet",scheduledAt:"invalid"}]) {
    await assert.rejects(api.stageFirmwareUpdate({...payload,version:"1.4.2",channel:"production"} as Parameters<typeof api.stageFirmwareUpdate>[0]),/invalid rollout/);
  }
});
