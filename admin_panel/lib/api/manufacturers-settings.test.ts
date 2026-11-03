import test from "node:test";
import assert from "node:assert/strict";
import { createMockApi, mockUserForRole } from "./mock-service";

test("M6-MANUFACTURERS-01: listManufacturers returns licensed partner list for admin", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const partners = await api.listManufacturers();

  assert.ok(partners.length > 0);
  const first = partners[0];
  assert.ok(first.id);
  assert.ok(first.name);
  assert.ok(first.code);
  assert.ok(first.contactEmail);
  assert.ok(typeof first.totalAllocatedDevices === "number");
  assert.ok(Array.isArray(first.allowedChannels));
});

test("M6-MANUFACTURERS-02: non-admin roles cannot list all manufacturer partners", async () => {
  const mfgApi = createMockApi({ actor: mockUserForRole("manufacturer") });
  await assert.rejects(async () => {
    await mfgApi.listManufacturers();
  }, /admin role required/);
});

test("M6-SETTINGS-01: getSettings returns current console policies", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const settings = await api.getSettings();

  assert.ok(settings.telemetryIntervalSec > 0);
  assert.ok(typeof settings.flightSafeAutoEngage === "boolean");
  assert.ok(settings.lowBatteryThresholdPct > 0);
  assert.ok(Array.isArray(settings.allowedGeofences));
});

test("M6-SETTINGS-02: updateSettings modifies settings for admin role", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const updated = await api.updateSettings({
    telemetryIntervalSec: 30,
    maintenanceMode: true,
  });

  assert.equal(updated.telemetryIntervalSec, 30);
  assert.equal(updated.maintenanceMode, true);

  const reloaded = await api.getSettings();
  assert.equal(reloaded.telemetryIntervalSec, 30);
  assert.equal(reloaded.maintenanceMode, true);
});

test("M6-SETTINGS-03: resetDemoData restores baseline fixture datasets", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const res = await api.resetDemoData({
    preserveRegisteredSerials: false,
    resetAuditLogs: true,
  });

  assert.equal(res.success, true);
  assert.ok(res.message.includes("Fictional demo dataset restored"));
});
