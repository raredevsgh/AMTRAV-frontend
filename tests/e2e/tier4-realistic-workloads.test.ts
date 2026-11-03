import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  TestHarness,
  assertValidHex,
  assertValidAsciiSerial,
} from "./test-harness";
import { consoleDevices, consoleUsers, consoleFiles } from "../../admin_panel/lib/console-fixtures";

describe("Tier 4 Realistic Operational Workloads & Multi-Step Scenarios", () => {
  // ==========================================================================
  // Scenario 1: Factory Production, Ingestion & One-Time Claim Code Handover
  // ==========================================================================
  test("T4-SCENARIO-1: Factory floor luggage manufacturing, registration and handover", async () => {
    // 1. Manufacturer technician logs in
    const m = new TestHarness({ role: "manufacturer" });
    assert.equal(m.role, "manufacturer");

    // 2. Registers newly manufactured Check-In 70 luggage
    const regResult = await m.api.registerDevice({
      serial_number: "  amt-prod-70-001  ",
      model: "Check-In 70 Titanium",
      firmware_version: "1.4.2",
    });

    // 3. Verifies normalized serial, auto-assigned manufacturer ID and registered status
    assert.equal(regResult.device.serial_number, "AMT-PROD-70-001");
    assert.equal(regResult.device.manufacturer_id, m.api.session.id);
    assert.equal(regResult.device.status, "registered");
    assert.equal(regResult.device.owner_id, null);

    // 4. Captures 64-char one-time claim code for customer packaging insertion
    assert.equal(regResult.claim_code.length, 64);
    assertValidHex(regResult.claim_code);

    // 5. Verifies registration audit record exists in device ledger
    const audits = await m.api.listDeviceAudit(regResult.device.id);
    assert.equal(audits.items.length, 1);
    assert.equal(audits.items[0].action, "registered");
    assert.equal(audits.items[0].actor_id, m.api.session.id);

    // 6. Confirms claim_code is not leaked when subsequently reading device details
    const inspected = await m.api.getDevice(regResult.device.id);
    assert.equal(Object.hasOwn(inspected, "claim_code"), false);

    // 7. Factory technician rotates claim code before boxing due to label smudge
    const rotated = await m.api.rotateClaimCode(regResult.device.id);
    assertValidHex(rotated.claim_code);
    assert.notEqual(rotated.claim_code, regResult.claim_code);

    // 8. Device ledger now has both registered and claim_code_rotated audits
    const updatedAudits = await m.api.listDeviceAudit(regResult.device.id);
    assert.equal(updatedAudits.items.length, 2);
    assert.equal(updatedAudits.items[0].action, "claim_code_rotated");
  });

  // ==========================================================================
  // Scenario 2: Passenger Claim & Baggage Flight Transit Checkpoints
  // ==========================================================================
  test("T4-SCENARIO-2: Passenger luggage claim and end-to-end flight transit checkpoints", async () => {
    const admin = new TestHarness({ role: "admin" });
    const targetBag = consoleDevices[2]; // Unclaimed registered device
    assert.equal(targetBag.status, "registered");

    // 1. Baggage transit journey is created for JFK -> LHR route on flight AM-1042
    const journey = await admin.getJourney("50000000-0000-4000-8000-000000000001");
    assert.equal(journey.status, "in_transit");
    assert.equal(journey.origin_airport, "JFK");
    assert.equal(journey.destination_airport, "LHR");

    // 2. Step 1: Terminal 4 Check-In Desk scan verified
    const cp1 = journey.checkpoints[0];
    assert.equal(cp1.scan_type, "check_in");
    assert.equal(cp1.verified, true);
    assert.equal(cp1.airport_code, "JFK");

    // 3. Step 2: TSA Inline Security Screening scan verified
    const cp2 = journey.checkpoints[1];
    assert.equal(cp2.scan_type, "security_screen");
    assert.equal(cp2.verified, true);

    // 4. Step 3: Gate Ramp Aircraft Loading scan verified
    const cp3 = journey.checkpoints[2];
    assert.equal(cp3.scan_type, "ramp_load");
    assert.equal(cp3.verified, true);

    // 5. Flight completes transit and arrives at destination (BA-0178 journey)
    const completedJourney = await admin.getJourney("50000000-0000-4000-8000-000000000002");
    assert.equal(completedJourney.status, "arrived");
    assert.ok(completedJourney.arrived_at);
    assert.ok(completedJourney.checkpoints.some((cp) => cp.scan_type === "delivery"));
  });

  // ==========================================================================
  // Scenario 3: Real-Time Tamper Incident Detection & Triage Workflow
  // ==========================================================================
  test("T4-SCENARIO-3: Security incident detection, telemetry triage and documented resolution", async () => {
    const admin = new TestHarness({ role: "admin" });

    // 1. Security monitoring alerts view shows critical tamper incident
    const criticalAlerts = await admin.listAlerts({ severity: "critical", status: "active" });
    assert.ok(criticalAlerts.length >= 1);
    const alert = criticalAlerts[0];
    assert.equal(alert.category, "tamper");
    assert.equal(alert.status, "active");

    // 2. Incident responder opens alert details to inspect GPS coordinates and message
    const alertDetail = await admin.getAlert(alert.id);
    assert.match(alertDetail.title, /Zipper Tamper/);
    assert.ok(alertDetail.latitude !== 0 && alertDetail.longitude !== 0);

    // 3. Responder acknowledges the alert
    const acknowledged = await admin.acknowledgeAlert(alert.id);
    assert.equal(acknowledged.status, "acknowledged");

    // 4. Responder executes remote diagnostics ping to inspect hardware sensors
    const diag = await admin.triggerDiagnostics(alert.device_id);
    assert.equal(diag.success, true);
    assert.ok(diag.ping_ms > 0);

    // 5. Responder locks luggage remotely to secure contents
    const lockedTelemetry = await admin.toggleRemoteLock(alert.device_id, true);
    assert.equal(lockedTelemetry.lock_status, "locked");

    // 6. Security team verifies physical tamper seal at carousel and resolves alert
    const resolved = await admin.resolveAlert(
      alert.id,
      "Physical inspection completed at carousel. Seal intact. Suspected transit vibration trigger. Bag returned to traveler.",
    );
    assert.equal(resolved.status, "resolved");
    assert.ok(resolved.resolved_at);
    assert.equal(resolved.resolved_by, consoleUsers[0].id);
    assert.match(resolved.resolution_notes!, /Physical inspection completed/);
  });

  // ==========================================================================
  // Scenario 4: Airline Customer Support & Luggage Discrepancy CRM
  // ==========================================================================
  test("T4-SCENARIO-4: Customer support passenger lookup, baggage tracking and support notes", async () => {
    const admin = new TestHarness({ role: "admin" });

    // 1. Support agent searches customer directory for passenger "Elena"
    const passengers = await admin.listCustomers("Elena");
    assert.equal(passengers.length, 1);
    const passenger = passengers[0];
    assert.equal(passenger.vip_status, "platinum");

    // 2. Agent navigates to Customer Details view
    const customerDetail = await admin.getCustomer(passenger.id);
    assert.equal(customerDetail.full_name, "Elena Rostova");
    assert.ok(customerDetail.claimed_devices.length >= 1);

    // 3. Inspects linked smart luggage
    const claimedBag = customerDetail.claimed_devices[0];
    assertValidAsciiSerial(claimedBag.serial_number);
    assert.ok(claimedBag.claimed_at);

    // 4. Inspects travel history: notices delayed flight LH-0401
    const delayedJourney = customerDetail.recent_journeys.find((j) => j.status === "delayed");
    assert.ok(delayedJourney);
    assert.equal(delayedJourney.origin_airport, "FRA");

    // 5. Support agent logs assistance note in customer support ledger
    customerDetail.support_notes.push(
      "Passenger called regarding Frankfurt delay. Confirmed bag is in gate hold. Priority transfer tag applied.",
    );
    assert.equal(customerDetail.support_notes.length, 3);
    assert.match(customerDetail.support_notes.at(-1)!, /Frankfurt delay/);
  });

  // ==========================================================================
  // Scenario 5: Fleet-Wide Firmware Staging & Emergency Remote Lock
  // ==========================================================================
  test("T4-SCENARIO-5: Security firmware rollout staging and emergency fleet lockdown", async () => {
    const admin = new TestHarness({ role: "admin" });

    // 1. Administrator checks telemetry for fleet devices
    const device1 = consoleDevices[0];
    const telemetry1 = await admin.getDeviceTelemetry(device1.id);
    assert.ok(telemetry1);
    assert.ok(telemetry1.battery_level_pct > 0);

    // 2. Security team stages security firmware patch across the fleet
    const stagingResult = await admin.stageFirmwareUpdate({
      target_channel: "stable",
      firmware_version: "1.4.3-security-patch",
      staged_by: admin.api.session.id,
    });
    assert.ok(stagingResult.staged_count >= 8);
    assert.match(stagingResult.message, /1.4.3-security-patch/);

    // 3. Administrator locks target device remotely
    const lockedDevice = await admin.toggleRemoteLock(device1.id, true);
    assert.equal(lockedDevice.lock_status, "locked");

    // 4. Verifies non-admin cannot manipulate fleet lock controls
    const manufacturerHarness = new TestHarness({ role: "manufacturer" });
    await assert.rejects(
      () => manufacturerHarness.toggleRemoteLock(device1.id, false),
      (err: any) => err.status === 403,
    );
  });

  // ==========================================================================
  // Scenario 6: Administrative Governance, Role Promotion & Invalidation
  // ==========================================================================
  test("T4-SCENARIO-6: Staff role management, governance rules and session scoping", async () => {
    const admin = new TestHarness({ role: "admin" });

    // 1. Administrator lists staff and partner accounts
    const accounts = await admin.api.listUsers();
    assert.equal(accounts.items.length, 5);

    // 2. Administrator promotes partner manager to administrator
    const partnerUser = consoleUsers[1]; // factory@northline.example.invalid
    assert.equal(partnerUser.role, "manufacturer");
    const promoted = await admin.api.updateRole(partnerUser.id, { role: "admin" });
    assert.equal(promoted.role, "admin");

    // 3. Enforces governance: administrator cannot change own role (anti-lockout)
    await assert.rejects(
      () => admin.api.updateRole(admin.api.session.id, { role: "manufacturer" }),
      (err: any) => err.status === 400,
    );

    // 4. Enforces governance: mobile Google OAuth accounts cannot be converted to staff
    const mobileUser = consoleUsers[4];
    assert.equal(mobileUser.role, "user");
    await assert.rejects(
      () => admin.api.updateRole(mobileUser.id, { role: "admin" }),
      (err: any) => err.status === 400,
    );
  });

  // ==========================================================================
  // Scenario 7: Private Specification Ingestion & Scoped Partner Distribution
  // ==========================================================================
  test("T4-SCENARIO-7: Secure document upload, MIME validation and scoped file isolation", async () => {
    const admin = new TestHarness({ role: "admin" });
    const manufacturer = new TestHarness({ role: "manufacturer" });

    // 1. Administrator uploads new C055 engineering drawing
    const specBytes = new TextEncoder().encode("AMORTRAV C055 Engineering Drawing v2.1\nConfidential.\n");
    const uploaded = await admin.api.uploadFile("c055-drawing-v2.1.txt", "text/plain", specBytes);
    assert.equal(uploaded.filename, "c055-drawing-v2.1.txt");
    assert.equal(uploaded.size_bytes, specBytes.length);

    // 2. Administrator can download and verify payload byte integrity
    const downloaded = await admin.api.downloadFile(uploaded.id);
    assert.deepEqual(downloaded, specBytes);

    // 3. Manufacturer cannot access the administrator's private file
    await assert.rejects(
      () => manufacturer.api.getFile(uploaded.id),
      (err: any) => err.status === 404,
    );
    await assert.rejects(
      () => manufacturer.api.downloadFile(uploaded.id),
      (err: any) => err.status === 404,
    );

    // 4. Manufacturer uploads their own batch file
    const batchContent = new TextEncoder().encode('{"batch_id":"BATCH-2026-10","units":50}\n');
    const mfrFile = await manufacturer.api.uploadFile("batch-2026-10.json", "application/json", batchContent);
    assert.equal(mfrFile.owner_id, manufacturer.api.session.id);

    // 5. Manufacturer can download their own file
    const mfrDownloaded = await manufacturer.api.downloadFile(mfrFile.id);
    assert.deepEqual(mfrDownloaded, batchContent);
  });
});
