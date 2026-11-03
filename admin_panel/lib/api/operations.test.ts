import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createMockApi,
  MockApiError,
  mockUserForRole,
} from "./index";
import {
  consoleAudits,
  consoleDevices,
  consoleDeviceTelemetry,
  consoleFileBodies,
  consoleFiles,
  consoleUsers,
} from "../console-fixtures";
import type { FirmwareChannel, FirmwareStagingPayload } from "./types";
import { MOCK_IDS } from "./fixtures";

const options = {
  devices: consoleDevices,
  users: consoleUsers,
  files: consoleFiles,
  fileBodies: consoleFileBodies,
  audits: consoleAudits,
  telemetries: consoleDeviceTelemetry,
  advanceJobs: true,
};

const apiFor = (role: "admin" | "manufacturer" | "user" = "admin", userId?: string) => {
  const actor = userId
    ? consoleUsers.find((u) => u.id === userId)!
    : role === "user"
      ? mockUserForRole("user")
      : consoleUsers.find((u) => u.role === role)!;
  return createMockApi({
    ...options,
    actor,
  });
};

async function assertApiError(
  action: () => Promise<unknown>,
  expectedStatus: number,
  expectedMessage?: string,
) {
  await assert.rejects(
    action,
    (e: unknown) => {
      assert.ok(e instanceof MockApiError, `Expected MockApiError but got ${String(e)}`);
      assert.equal(e.status, expectedStatus);
      if (expectedMessage) {
        assert.equal(e.body.error, expectedMessage);
      }
      return true;
    },
  );
}

// ============================================================================
// Group 1: Actuator Integrity (toggleRemoteLock)
// ============================================================================

test("M2-ACTUATOR-01: remote lock state transition from locked to unlocked and back", async () => {
  const api = apiFor("admin");
  const device = consoleDevices[0]; // initially locked in consoleDeviceTelemetry[0]
  const initialTelemetry = await api.getDeviceTelemetry(device.id);
  assert.ok(initialTelemetry);
  assert.equal(initialTelemetry.lockState, "locked");

  const unlockTime = Date.now();
  const unlockResult = await api.toggleRemoteLock(device.id, false);
  assert.equal(unlockResult.success, true);
  assert.equal(unlockResult.details?.previousState, "locked");
  assert.equal(unlockResult.details?.currentState, "unlocked");
  assert.match(unlockResult.message, /unlocked/i);

  const unlockedTelemetry = await api.getDeviceTelemetry(device.id);
  assert.ok(unlockedTelemetry);
  assert.equal(unlockedTelemetry.lockState, "unlocked");
  assert.ok(new Date(unlockedTelemetry.lastPing).getTime() >= unlockTime - 2000);

  // Transition back to locked
  const lockResult = await api.toggleRemoteLock(device.id, true);
  assert.equal(lockResult.success, true);
  assert.equal(lockResult.details?.previousState, "unlocked");
  assert.equal(lockResult.details?.currentState, "locked");
  assert.match(lockResult.message, /locked/i);

  const lockedTelemetry = await api.getDeviceTelemetry(device.id);
  assert.ok(lockedTelemetry);
  assert.equal(lockedTelemetry.lockState, "locked");
});

test("M2-ACTUATOR-02: idempotent remote lock preserves previous and current state", async () => {
  const api = apiFor("admin");
  const device = consoleDevices[0]; // initially locked

  const repeatLockResult = await api.toggleRemoteLock(device.id, true);
  assert.equal(repeatLockResult.success, true);
  assert.equal(repeatLockResult.details?.previousState, "locked");
  assert.equal(repeatLockResult.details?.currentState, "locked");

  const telemetry = await api.getDeviceTelemetry(device.id);
  assert.equal(telemetry?.lockState, "locked");
});

test("M2-ACTUATOR-03: remote lock appends fleet activity and audit records", async () => {
  const api = apiFor("admin");
  const device = consoleDevices[1]; // AMT-C055-00F3A2

  await api.toggleRemoteLock(device.id, false);

  // Check recent activity
  const recentActivities = await api.getRecentActivity(5);
  const lockActivity = recentActivities.find((a) => a.device_id === device.id);
  assert.ok(lockActivity, "Fleet activity entry should be prepended");
  assert.equal(lockActivity.event_type, "checkpoint_scanned");
  assert.match(lockActivity.description, /UNLOCKED/);
  assert.equal(lockActivity.actor, consoleUsers[0].email);
  assert.equal(lockActivity.location, "Local demo");

  // Check audit trail
  const audits = await api.listDeviceAudit(device.id);
  assert.ok(audits.items.length > 0);
  assert.equal(audits.items[0].action, "remote_unlocked");
  assert.equal(audits.items[0].device_id, device.id);
});

test("M2-ACTUATOR-04: revoked device rejects remote lock commands with 409 Conflict", async () => {
  const api = apiFor("admin");
  const revokedDevice = consoleDevices[4]; // status === "revoked"
  assert.equal(revokedDevice.status, "revoked");

  const preTelemetry = await api.getDeviceTelemetry(revokedDevice.id);
  const preLockState = preTelemetry?.lockState;

  await assertApiError(
    () => api.toggleRemoteLock(revokedDevice.id, false),
    409,
    "device is revoked",
  );

  // State must NOT have mutated
  const postTelemetry = await api.getDeviceTelemetry(revokedDevice.id);
  assert.equal(postTelemetry?.lockState, preLockState);

  // Audit logs must not include any remote_unlocked record
  const audits = await api.listDeviceAudit(revokedDevice.id);
  assert.ok(!audits.items.some((a) => a.action.startsWith("remote_")));
});

test("M2-ACTUATOR-05: remote lock on non-existent device returns 404 Not Found", async () => {
  const api = apiFor("admin");
  await assertApiError(
    () => api.toggleRemoteLock("90000000-0000-4000-8000-000000000099", true),
    404,
    "device not found",
  );
});

test("M2-ACTUATOR-06: unauthorized user role is rejected with 403 Forbidden", async () => {
  const userApi = apiFor("user");
  await assertApiError(
    () => userApi.toggleRemoteLock(consoleDevices[0].id, true),
    403,
    "required role is missing",
  );
});

// ============================================================================
// Group 2: Diagnostic Execution (triggerDiagnostics)
// ============================================================================

test("M2-DIAGNOSTIC-01: returns all five fictional subsystem checks and fixture timings", async () => {
  const api = apiFor("admin");
  const healthyDevice = consoleDevices[0]; // cellular, healthy battery, secure tamper

  const report = await api.triggerDiagnostics(healthyDevice.id);
  assert.equal(report.deviceId, healthyDevice.id);
  assert.ok(report.timestamp);
  assert.equal(report.overallStatus, "passed");
  assert.equal(report.success, true);
  assert.equal(report.checks.length, 5);

  const checkNames = report.checks.map((c) => c.name);
  assert.deepEqual(checkNames, [
    "Cellular Baseband Ping",
    "BLE Heartbeat Beacon",
    "Inertial Sensor Calibration",
    "Luggage Tamper Sensor Loop",
    "Power Management Rail",
  ]);

  for (const check of report.checks) {
    assert.equal(check.status, "passed");
    assert.ok(check.latencyMs > 0, `Expected positive latency, got ${check.latencyMs}`);
    assert.ok(check.detail && check.detail.length > 5, `Expected descriptive detail for ${check.name}`);
  }
});

test("M2-DIAGNOSTIC-02: diagnostics failure branches on offline, low battery, and tamper", async () => {
  // Device 4 has: offline, critical battery (8%), breached tamper
  // To test isolated paths, we can configure mock devices with specific telemetry
  const admin = apiFor("admin");

  // Device 4 is revoked, so calling diagnostics on it should be rejected with 409
  await assertApiError(
    () => admin.triggerDiagnostics(consoleDevices[4].id),
    409,
    "device is revoked",
  );

  // Test with custom active device with breached tamper
  const breachedDevice = { ...consoleDevices[2], id: "10000000-0000-4000-8000-000000000091", status: "registered" as const };
  const breachedTelemetry = {
    ...consoleDeviceTelemetry[2],
    deviceId: breachedDevice.id,
    tamperStatus: "breached" as const,
    batteryLevel: 90,
    connectionType: "cellular" as const,
  };

  const customApi = createMockApi({
    ...options,
    devices: [...consoleDevices, breachedDevice],
    telemetries: [...consoleDeviceTelemetry, breachedTelemetry],
    actor: consoleUsers[0],
  });

  const breachedReport = await customApi.triggerDiagnostics(breachedDevice.id);
  assert.equal(breachedReport.overallStatus, "failed");
  assert.equal(breachedReport.success, false);

  const tamperCheck = breachedReport.checks.find((c) => c.name === "Luggage Tamper Sensor Loop");
  assert.ok(tamperCheck);
  assert.equal(tamperCheck.status, "failed");
  assert.match(tamperCheck.detail ?? "", /fixture tamper state is breached/i);

  const imuCheck = breachedReport.checks.find((c) => c.name === "Inertial Sensor Calibration");
  assert.ok(imuCheck);
  assert.equal(imuCheck.status, "failed");

  // Test with custom active device with low battery (< 10%)
  const lowBatteryDevice = { ...consoleDevices[2], id: "10000000-0000-4000-8000-000000000092", status: "registered" as const };
  const lowBatteryTelemetry = {
    ...consoleDeviceTelemetry[2],
    deviceId: lowBatteryDevice.id,
    batteryLevel: 6,
    tamperStatus: "secure" as const,
    connectionType: "cellular" as const,
  };

  const lowBatApi = createMockApi({
    ...options,
    devices: [...consoleDevices, lowBatteryDevice],
    telemetries: [...consoleDeviceTelemetry, lowBatteryTelemetry],
    actor: consoleUsers[0],
  });

  const lowBatReport = await lowBatApi.triggerDiagnostics(lowBatteryDevice.id);
  assert.equal(lowBatReport.overallStatus, "warning");
  assert.equal(lowBatReport.success, false);

  const pmicCheck = lowBatReport.checks.find((c) => c.name === "Power Management Rail");
  assert.ok(pmicCheck);
  assert.equal(pmicCheck.status, "failed");

  const bleCheck = lowBatReport.checks.find((c) => c.name === "BLE Heartbeat Beacon");
  assert.ok(bleCheck);
  assert.equal(bleCheck.status, "failed");

  // Test with custom active device with offline connection
  const offlineDevice = { ...consoleDevices[2], id: "10000000-0000-4000-8000-000000000093", status: "registered" as const };
  const offlineTelemetry = {
    ...consoleDeviceTelemetry[2],
    deviceId: offlineDevice.id,
    batteryLevel: 80,
    tamperStatus: "secure" as const,
    connectionType: "offline" as const,
  };

  const offlineApi = createMockApi({
    ...options,
    devices: [...consoleDevices, offlineDevice],
    telemetries: [...consoleDeviceTelemetry, offlineTelemetry],
    actor: consoleUsers[0],
  });

  const offlineReport = await offlineApi.triggerDiagnostics(offlineDevice.id);
  assert.equal(offlineReport.overallStatus, "warning");
  assert.equal(offlineReport.success, false);

  const cellCheck = offlineReport.checks.find((c) => c.name === "Cellular Baseband Ping");
  assert.ok(cellCheck);
  assert.equal(cellCheck.status, "failed");
  assert.match(cellCheck.detail ?? "", /fixture connection is offline/i);
});

test("M2-DIAGNOSTIC-03: diagnostics on non-existent device returns 404 Not Found", async () => {
  const api = apiFor("admin");
  await assertApiError(
    () => api.triggerDiagnostics("90000000-0000-4000-8000-000000000099"),
    404,
    "device not found",
  );
});

test("M2-DIAGNOSTIC-04: unauthorized user role calling diagnostics rejected with 403 Forbidden", async () => {
  const userApi = apiFor("user");
  await assertApiError(
    () => userApi.triggerDiagnostics(consoleDevices[0].id),
    403,
    "required role is missing",
  );
});

// ============================================================================
// Group 3: OTA Firmware Staging (stageFirmwareUpdate)
// ============================================================================

test("M2-OTA-01: targetScope 'single' targets exactly one valid unit and rejects revoked", async () => {
  const api = apiFor("admin");
  const targetDevice = consoleDevices[0];

  const payload: FirmwareStagingPayload = {
    targetScope: "single",
    targetId: targetDevice.id,
    version: "1.5.0-rc.1",
    channel: "staging",
    rolloutPercentage: 50,
  };

  const result = await api.stageFirmwareUpdate(payload);
  assert.equal(result.success, true);
  assert.equal(result.details?.stagedCount, 1);
  assert.equal(result.details?.version, "1.5.0-rc.1");
  assert.equal(result.details?.channel, "staging");
  assert.match(result.message, /1 fixture units/i);

  // Revoked target must fail with 409
  await assertApiError(
    () =>
      api.stageFirmwareUpdate({
        ...payload,
        targetId: consoleDevices[4].id, // revoked
      }),
    409,
    "device is revoked",
  );

  // Non-existent target must fail with 404
  await assertApiError(
    () =>
      api.stageFirmwareUpdate({
        ...payload,
        targetId: "90000000-0000-4000-8000-000000000099",
      }),
    404,
    "target device not found",
  );
});

test("M2-OTA-02: targetScope 'manufacturer' targets all non-revoked units of that manufacturer", async () => {
  const api = apiFor("admin");

  // Harbor Goods (consoleUsers[2].id) has consoleDevices[4] (revoked) and consoleDevices[5] (registered)
  const harborId = consoleUsers[2].id;
  const harborDevices = consoleDevices.filter((d) => d.manufacturer_id === harborId);
  assert.equal(harborDevices.length, 2);

  const resultHarbor = await api.stageFirmwareUpdate({
    targetScope: "manufacturer",
    targetId: harborId,
    version: "1.4.1",
    channel: "canary",
  });
  assert.equal(resultHarbor.success, true);
  // Only the non-revoked unit (consoleDevices[5]) should be targeted!
  assert.equal(resultHarbor.details?.stagedCount, 1);

  // Northline Cases (MOCK_IDS.manufacturer) has 6 devices, none revoked
  const resultNorthline = await api.stageFirmwareUpdate({
    targetScope: "manufacturer",
    targetId: MOCK_IDS.manufacturer,
    version: "1.4.3",
    channel: "production",
  });
  assert.equal(resultNorthline.success, true);
  assert.equal(resultNorthline.details?.stagedCount, 6);
});

test("M2-OTA-03: targetScope 'fleet' stages update across entire non-revoked fleet", async () => {
  const api = apiFor("admin");
  // Fleet has 8 devices, 1 is revoked -> 7 active units
  const result = await api.stageFirmwareUpdate({
    targetScope: "fleet",
    version: "2.0.0",
    channel: "production",
  });
  assert.equal(result.success, true);
  assert.equal(result.details?.stagedCount, 7);

  // Verify activity item logged
  const recent = await api.getRecentActivity(1);
  assert.equal(recent[0].event_type, "firmware_updated");
  assert.match(recent[0].description, /2\.0\.0/);
  assert.match(recent[0].description, /7 fixture units/);
});

test("M2-OTA-04: channel validation rejects unsupported channels", async () => {
  const api = apiFor("admin");
  const validChannels = ["production", "staging", "canary"] as const;
  const legacyChannels = ["stable", "beta"] as const;

  for (const ch of validChannels) {
    const res = await api.stageFirmwareUpdate({
      targetScope: "fleet",
      version: "1.4.2",
      channel: ch,
    });
    assert.equal(res.success, true);
  }

  for (const ch of legacyChannels) {
    const res = await api.stageFirmwareUpdate({
      targetScope: "fleet",
      version: "1.4.2",
      channel: ch as unknown as FirmwareChannel,
    });
    assert.equal(res.success, true);
  }

  // Invalid channels
  for (const badChannel of ["nightly", "alpha", "prod", "test", ""]) {
    await assertApiError(
      () =>
        api.stageFirmwareUpdate({
          targetScope: "fleet",
          version: "1.4.2",
          channel: badChannel as unknown as FirmwareChannel,
        }),
      400,
      "invalid deployment channel",
    );
  }
});

test("M2-OTA-05: firmware version validation rejects empty strings and oversized strings", async () => {
  const api = apiFor("admin");

  // Empty or whitespace
  for (const badVersion of ["", "   ", "\t\n"]) {
    await assertApiError(
      () =>
        api.stageFirmwareUpdate({
          targetScope: "fleet",
          version: badVersion,
          channel: "production",
        }),
      400,
      "invalid firmware version",
    );
  }

  // Version exceeding 64 bytes
  const oversizedVersion = "1.0." + "0".repeat(65);
  await assertApiError(
    () =>
      api.stageFirmwareUpdate({
        targetScope: "fleet",
        version: oversizedVersion,
        channel: "production",
      }),
      400,
      "invalid firmware version",
  );
});

// ============================================================================
// Group 4: Multi-Tenant Isolation
// ============================================================================

test("M2-TENANT-01: manufacturer cannot actuate or view diagnostics on foreign devices", async () => {
  // Manufacturer 1 (Northline)
  const northlineApi = apiFor("manufacturer", consoleUsers[1].id);
  // Device 5 belongs to Harbor Goods (consoleUsers[2].id)
  const foreignDevice = consoleDevices[5];
  assert.notEqual(foreignDevice.manufacturer_id, consoleUsers[1].id);

  // Cannot view telemetry
  const foreignTelemetry = await northlineApi.getDeviceTelemetry(foreignDevice.id);
  assert.equal(foreignTelemetry, null);

  // Cannot trigger remote lock -> 404 Not Found (avoids device existence leakage)
  await assertApiError(
    () => northlineApi.toggleRemoteLock(foreignDevice.id, true),
    404,
    "device not found",
  );

  // Cannot trigger diagnostics -> 404 Not Found
  await assertApiError(
    () => northlineApi.triggerDiagnostics(foreignDevice.id),
    404,
    "device not found",
  );

  // Can actuate and diagnose their OWN device (Device 0)
  const ownDevice = consoleDevices[0];
  assert.equal(ownDevice.manufacturer_id, consoleUsers[1].id);

  const ownLock = await northlineApi.toggleRemoteLock(ownDevice.id, false);
  assert.equal(ownLock.success, true);

  const ownDiag = await northlineApi.triggerDiagnostics(ownDevice.id);
  assert.equal(ownDiag.success, true);
});

test("M2-TENANT-02: manufacturer fleet OTA update is strictly scoped to own devices", async () => {
  // Manufacturer 1 (Northline) has 6 devices
  const northlineApi = apiFor("manufacturer", consoleUsers[1].id);

  const result = await northlineApi.stageFirmwareUpdate({
    targetScope: "fleet",
    version: "1.4.9-mfg",
    channel: "staging",
  });

  // Must only stage for Northline's 6 devices, NOT Harbor Goods' devices!
  assert.equal(result.details?.stagedCount, 6);

  // Staging single target for foreign device must fail with 404
  await assertApiError(
    () =>
      northlineApi.stageFirmwareUpdate({
        targetScope: "single",
        targetId: consoleDevices[5].id, // Harbor Goods device
        version: "1.4.9-mfg",
        channel: "staging",
      }),
    404,
    "target device not found",
  );
});

test("M2-TENANT-03: manufacturer operations summary and telemetry list are isolated", async () => {
  const northlineApi = apiFor("manufacturer", consoleUsers[1].id);

  // Summary counts
  const summary = await northlineApi.getOperationsSummary();
  // All 6 devices of Northline are online
  assert.equal(summary.totalOnline + summary.totalOffline, 6);

  // List telemetry
  const telemetryList = await northlineApi.listTelemetry();
  assert.equal(telemetryList.length, 6);
  for (const t of telemetryList) {
    const dev = consoleDevices.find((d) => d.id === t.deviceId);
    assert.equal(dev?.manufacturer_id, consoleUsers[1].id);
  }
});

// ============================================================================
// Group 5: Telemetry Query Filters and Aggregations
// ============================================================================

test("M2-FILTER-01: listTelemetry filters by status, lockState, and search query", async () => {
  const api = apiFor("admin");

  // Status filters
  const online = await api.listTelemetry({ status: "online" });
  assert.equal(online.length, 7);

  const offline = await api.listTelemetry({ status: "offline" });
  assert.equal(offline.length, 1);
  assert.equal(offline[0].deviceId, consoleDevices[4].id);

  const cellular = await api.listTelemetry({ status: "cellular" });
  assert.equal(cellular.length, 5);

  const ble = await api.listTelemetry({ status: "ble" });
  assert.equal(ble.length, 2);

  const errorItems = await api.listTelemetry({ status: "error" });
  // Breached tamper or critical battery (devices 4 and 6)
  assert.equal(errorItems.length, 2);

  // Lock state filter
  const locked = await api.listTelemetry({ lockState: "locked" });
  assert.equal(locked.length, 6);

  const unlocked = await api.listTelemetry({ lockState: "unlocked" });
  assert.equal(unlocked.length, 2);

  // Search filter
  const searchSerial = await api.listTelemetry({ search: "AMT-C055-00F3A1" });
  assert.equal(searchSerial.length, 1);
  assert.equal(searchSerial[0].serialNumber, "AMT-C055-00F3A1");

  const searchModel = await api.listTelemetry({ search: "Carry-On 55" });
  assert.equal(searchModel.length, 3);
});

test("M2-PROVISION-01: auto-provisions telemetry record when new device is registered", async () => {
  const api = apiFor("manufacturer", consoleUsers[1].id);

  const regResult = await api.registerDevice({
    serial_number: "AMT-AUTO-9988",
    model: "Carry-On Pro",
    firmware_version: "2.1.0",
  });

  const newId = regResult.device.id;
  const autoTelemetry = await api.getDeviceTelemetry(newId);
  assert.ok(autoTelemetry, "Telemetry should be auto-provisioned upon registration");
  assert.equal(autoTelemetry.serialNumber, "AMT-AUTO-9988");
  assert.equal(autoTelemetry.firmwareVersion, "2.1.0");
  assert.equal(autoTelemetry.lockState, "unlocked");
  assert.equal(autoTelemetry.tamperStatus, "secure");
  assert.equal(autoTelemetry.connectionType, "ble");
});
