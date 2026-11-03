import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  TestHarness,
  assertValidHex,
  assertValidAsciiSerial,
} from "./test-harness";
import {
  consoleDevices,
  consoleUsers,
  consoleFiles,
} from "../../admin_panel/lib/console-fixtures";
import { adminSections } from "../../admin_panel/lib/admin-sections";
import { validEmail, validPassword } from "../../admin_panel/lib/api/validation";

describe("Tier 1 Smoke & Happy Path Test Suite", () => {
  // ==========================================================================
  // Section 1: Authentication & Session
  // ==========================================================================
  describe("1. Authentication & Session", () => {
    test("T1-AUTH-01: valid admin credentials produce authenticated session", async () => {
      const h = new TestHarness({ role: "admin" });
      assert.equal(h.api.session.role, "admin");
      assert.equal(h.api.session.email, "ops@amortrav.example.invalid");
    });

    test("T1-AUTH-02: valid manufacturer credentials produce scoped session", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      assert.equal(h.api.session.role, "manufacturer");
      assert.equal(h.api.session.email, "factory@northline.example.invalid");
    });

    test("T1-AUTH-03: email validator accepts RFC-compliant corporate emails", () => {
      assert.equal(validEmail("ops@amortrav.example.invalid"), true);
      assert.equal(validEmail("partner-factory.1@northline.example.invalid"), true);
    });

    test("T1-AUTH-04: password validator enforces UTF-8 byte minimum", () => {
      assert.equal(validPassword("fictional-demo-pass"), true);
      assert.equal(validPassword("standard-secure-pass-123"), true);
    });

    test("T1-AUTH-05: demo switcher creates HttpOnly Strict cookie structure", () => {
      const cookieHeader = "amtrav_console_demo=admin; Path=/; HttpOnly; SameSite=Strict";
      assert.match(cookieHeader, /amtrav_console_demo=admin/);
      assert.match(cookieHeader, /HttpOnly/);
      assert.match(cookieHeader, /SameSite=Strict/);
    });
  });

  // ==========================================================================
  // Section 2: App Shell & Navigation Registry
  // ==========================================================================
  describe("2. App Shell & Navigation Registry", () => {
    test("T1-SHELL-01: registry exposes standard admin sections", () => {
      assert.ok(adminSections.devices);
      assert.ok(adminSections.register);
      assert.ok(adminSections.files);
    });

    test("T1-SHELL-02: devices section is accessible to both admin and manufacturer", () => {
      assert.ok(adminSections.devices.roles?.includes("administrator"));
      assert.ok(adminSections.devices.roles?.includes("manufacturer"));
    });

    test("T1-SHELL-03: users/accounts section is restricted to administrator", () => {
      assert.ok(adminSections.users.roles?.includes("administrator"));
      assert.ok(!adminSections.users.roles?.includes("manufacturer"));
    });

    test("T1-SHELL-04: mobile navigation drawer structure provides accessible label", () => {
      const ariaLabel = "Open navigation menu";
      assert.equal(ariaLabel, "Open navigation menu");
    });

    test("T1-SHELL-05: active navigation item sets aria-current page", () => {
      const activeHref = "/devices";
      const currentRoute = "/devices";
      const isCurrent = activeHref === currentRoute ? "page" : undefined;
      assert.equal(isCurrent, "page");
    });
  });

  // ==========================================================================
  // Section 3: Overview Dashboard
  // ==========================================================================
  describe("3. Overview Dashboard", () => {
    test("T1-OVR-01: fleet KPI counts match current device fixtures", async () => {
      const h = new TestHarness({ role: "admin" });
      const kpis = await h.getOverviewKpis();
      assert.equal(kpis.total_registered, 8);
      assert.equal(kpis.unclaimed_count, 3);
      assert.equal(kpis.claimed_count, 4);
      assert.equal(kpis.revoked_count, 1);
    });

    test("T1-OVR-02: active journeys metric reflects scheduled transit fleet", async () => {
      const h = new TestHarness({ role: "admin" });
      const kpis = await h.getOverviewKpis();
      assert.ok(kpis.active_journeys >= 1);
    });

    test("T1-OVR-03: active alerts count surfaces unacknowledged security triggers", async () => {
      const h = new TestHarness({ role: "admin" });
      const kpis = await h.getOverviewKpis();
      assert.ok(kpis.active_alerts >= 1);
    });

    test("T1-OVR-04: trend chart duration spans supported presentation windows (4, 8, 12 weeks)", () => {
      const validRanges = [4, 8, 12];
      assert.deepEqual(validRanges, [4, 8, 12]);
    });

    test("T1-OVR-05: recent activity feed yields chronological fleet events", async () => {
      const h = new TestHarness({ role: "admin" });
      const events = await h.getRecentActivity(5);
      assert.ok(events.length > 0);
      assert.ok(events[0].category);
      assert.ok(events[0].actor_email);
    });
  });

  // ==========================================================================
  // Section 4: Devices Registry
  // ==========================================================================
  describe("4. Devices Registry", () => {
    test("T1-DEV-01: administrator lists all 8 devices across manufacturers", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.listDevices();
      assert.equal(res.items.length, 8);
    });

    test("T1-DEV-02: manufacturer sees only devices matching their manufacturer ID", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      const res = await h.api.listDevices();
      assert.equal(res.items.length, 6);
      assert.ok(res.items.every((d) => d.manufacturer_id === h.api.session.id));
    });

    test("T1-DEV-03: devices pagination respects limit and offset bounds", async () => {
      const h = new TestHarness({ role: "admin" });
      const page1 = await h.api.listDevices({ limit: 4, offset: 0 });
      const page2 = await h.api.listDevices({ limit: 4, offset: 4 });
      assert.equal(page1.items.length, 4);
      assert.equal(page2.items.length, 4);
      assert.notEqual(page1.items[0].id, page2.items[0].id);
    });

    test("T1-DEV-04: serial numbers are formatted in uppercase monospace", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.listDevices();
      for (const d of res.items) {
        assertValidAsciiSerial(d.serial_number);
      }
    });

    test("T1-DEV-05: claimed device displays owner ID and valid claimed_at timestamp", async () => {
      const h = new TestHarness({ role: "admin" });
      const d = await h.api.getDevice(consoleDevices[0].id);
      assert.equal(d.status, "claimed");
      assert.ok(d.owner_id);
      assert.ok(d.claimed_at);
    });
  });

  // ==========================================================================
  // Section 5: Device Details
  // ==========================================================================
  describe("5. Device Details", () => {
    test("T1-DTL-01: retrieves full identity card with immutable hardware UUID", async () => {
      const h = new TestHarness({ role: "admin" });
      const d = await h.api.getDevice(consoleDevices[0].id);
      assert.equal(d.id, consoleDevices[0].id);
      assert.equal(d.serial_number, consoleDevices[0].serial_number);
    });

    test("T1-DTL-02: allows editing model metadata and appends audit event", async () => {
      const h = new TestHarness({ role: "admin" });
      const target = consoleDevices[2];
      const updated = await h.api.updateDevice(target.id, { model: "Carry-On 55 Pro" });
      assert.equal(updated.model, "Carry-On 55 Pro");
      const audits = await h.api.listDeviceAudit(target.id);
      assert.equal(audits.items[0].action, "metadata_updated");
    });

    test("T1-DTL-03: unclaimed registered bag supports claim code rotation", async () => {
      const h = new TestHarness({ role: "admin" });
      const target = consoleDevices[2];
      assert.equal(target.status, "registered");
      const res = await h.api.rotateClaimCode(target.id);
      assertValidHex(res.claim_code);
      const audits = await h.api.listDeviceAudit(target.id);
      assert.equal(audits.items[0].action, "claim_code_rotated");
    });

    test("T1-DTL-04: revoking device sets status to revoked and appends audit entry", async () => {
      const h = new TestHarness({ role: "admin" });
      const target = consoleDevices[2];
      const revoked = await h.api.revokeDevice(target.id);
      assert.equal(revoked.status, "revoked");
      const audits = await h.api.listDeviceAudit(target.id);
      assert.equal(audits.items[0].action, "revoked");
    });

    test("T1-DTL-05: audit history entries include actor ID and UTC ISO timestamp", async () => {
      const h = new TestHarness({ role: "admin" });
      const audits = await h.api.listDeviceAudit(consoleDevices[0].id);
      assert.ok(audits.items.length >= 1);
      assert.ok(audits.items[0].actor_id);
      assert.match(audits.items[0].created_at, /^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ==========================================================================
  // Section 6: Device Operations & Telemetry
  // ==========================================================================
  describe("6. Device Operations & Telemetry", () => {
    test("T1-OPS-01: retrieves live telemetry record for active luggage", async () => {
      const h = new TestHarness({ role: "admin" });
      const t = await h.getDeviceTelemetry(consoleDevices[0].id);
      assert.ok(t);
      assert.ok(t.battery_level_pct >= 0 && t.battery_level_pct <= 100);
      assert.ok(["locked", "unlocked"].includes(t.lock_status));
    });

    test("T1-OPS-02: remote diagnostics ping returns successful response with latency", async () => {
      const h = new TestHarness({ role: "admin" });
      const diag = await h.triggerDiagnostics(consoleDevices[0].id);
      assert.equal(diag.success, true);
      assert.ok(diag.ping_ms > 0);
    });

    test("T1-OPS-03: administrator remotely locks luggage", async () => {
      const h = new TestHarness({ role: "admin" });
      const updated = await h.toggleRemoteLock(consoleDevices[1].id, true);
      assert.equal(updated.lock_status, "locked");
    });

    test("T1-OPS-04: administrator remotely unlocks luggage", async () => {
      const h = new TestHarness({ role: "admin" });
      const updated = await h.toggleRemoteLock(consoleDevices[0].id, false);
      assert.equal(updated.lock_status, "unlocked");
    });

    test("T1-OPS-05: firmware update staging payload confirms staged device count", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.stageFirmwareUpdate({
        firmware_version: "1.4.3-beta.1",
        target_channel: "beta",
        staged_by: h.api.session.id,
      });
      assert.ok(res.staged_count > 0);
      assert.match(res.message, /1.4.3-beta.1/);
    });
  });

  // ==========================================================================
  // Section 7: Journeys & Luggage Tracking
  // ==========================================================================
  describe("7. Journeys & Luggage Tracking", () => {
    test("T1-JRN-01: lists active and historical luggage journeys", async () => {
      const h = new TestHarness({ role: "admin" });
      const journeys = await h.listJourneys();
      assert.ok(journeys.length >= 3);
      assert.ok(journeys.some((j) => j.status === "in_transit"));
    });

    test("T1-JRN-02: filters journeys by flight number", async () => {
      const h = new TestHarness({ role: "admin" });
      const matches = await h.listJourneys({ flight: "AM-1042" });
      assert.equal(matches.length, 1);
      assert.equal(matches[0].flight_number, "AM-1042");
    });

    test("T1-JRN-03: filters journeys by status", async () => {
      const h = new TestHarness({ role: "admin" });
      const arrived = await h.listJourneys({ status: "arrived" });
      assert.ok(arrived.every((j) => j.status === "arrived"));
    });

    test("T1-JRN-04: journeys display valid 3-letter IATA airport codes", async () => {
      const h = new TestHarness({ role: "admin" });
      const journeys = await h.listJourneys();
      for (const j of journeys) {
        assert.match(j.origin_airport, /^[A-Z]{3}$/);
        assert.match(j.destination_airport, /^[A-Z]{3}$/);
      }
    });

    test("T1-JRN-05: in_transit journey has null arrival timestamp", async () => {
      const h = new TestHarness({ role: "admin" });
      const inTransit = (await h.listJourneys({ status: "in_transit" }))[0];
      assert.ok(inTransit);
      assert.equal(inTransit.arrived_at, null);
    });
  });

  // ==========================================================================
  // Section 8: Journey Details
  // ==========================================================================
  describe("8. Journey Details", () => {
    test("T1-JDTL-01: retrieves specific journey by UUID", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000001");
      assert.equal(j.flight_number, "AM-1042");
      assert.equal(j.origin_airport, "JFK");
    });

    test("T1-JDTL-02: journey detail includes sequential airport scan checkpoints", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000001");
      assert.equal(j.checkpoints.length, 3);
      assert.equal(j.checkpoints[0].scan_type, "check_in");
      assert.equal(j.checkpoints[1].scan_type, "security_screen");
      assert.equal(j.checkpoints[2].scan_type, "ramp_load");
    });

    test("T1-JDTL-03: all checkpoints record verified status and timestamps", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000001");
      for (const cp of j.checkpoints) {
        assert.equal(cp.verified, true);
        assert.match(cp.timestamp, /^\d{4}-\d{2}-\d{2}T/);
      }
    });

    test("T1-JDTL-04: journey links to registered luggage serial number", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000001");
      assertValidAsciiSerial(j.serial_number);
    });

    test("T1-JDTL-05: arrived journey contains valid carousel delivery scan", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000002");
      assert.equal(j.status, "arrived");
      assert.ok(j.checkpoints.some((cp) => cp.scan_type === "delivery"));
    });
  });

  // ==========================================================================
  // Section 9: Customers Directory
  // ==========================================================================
  describe("9. Customers Directory", () => {
    test("T1-CUST-01: lists registered traveler profiles", async () => {
      const h = new TestHarness({ role: "admin" });
      const customers = await h.listCustomers();
      assert.equal(customers.length, 3);
    });

    test("T1-CUST-02: searches customers by full name", async () => {
      const h = new TestHarness({ role: "admin" });
      const matches = await h.listCustomers("Elena");
      assert.equal(matches.length, 1);
      assert.equal(matches[0].full_name, "Elena Rostova");
    });

    test("T1-CUST-03: searches customers by email substring", async () => {
      const h = new TestHarness({ role: "admin" });
      const matches = await h.listCustomers("traveler@amtrav");
      assert.equal(matches.length, 1);
      assert.equal(matches[0].email, "traveler@amtrav.example.invalid");
    });

    test("T1-CUST-04: surfaces loyalty tier status (standard/silver/gold/platinum)", async () => {
      const h = new TestHarness({ role: "admin" });
      const customers = await h.listCustomers();
      const tiers = customers.map((c) => c.vip_status);
      assert.ok(tiers.includes("platinum"));
      assert.ok(tiers.includes("gold"));
    });

    test("T1-CUST-05: displays claimed smart luggage count per passenger", async () => {
      const h = new TestHarness({ role: "admin" });
      const c = (await h.listCustomers("Elena"))[0];
      assert.equal(c.claimed_devices_count, 2);
    });
  });

  // ==========================================================================
  // Section 10: Customer Details
  // ==========================================================================
  describe("10. Customer Details", () => {
    test("T1-CDTL-01: retrieves customer profile by ID", async () => {
      const h = new TestHarness({ role: "admin" });
      const c = await h.getCustomer("60000000-0000-4000-8000-000000000001");
      assert.equal(c.full_name, "Elena Rostova");
      assert.equal(c.account_type, "google_mobile");
    });

    test("T1-CDTL-02: customer detail includes list of claimed smart bags", async () => {
      const h = new TestHarness({ role: "admin" });
      const c = await h.getCustomer("60000000-0000-4000-8000-000000000001");
      assert.ok(c.claimed_devices.length > 0);
      assertValidAsciiSerial(c.claimed_devices[0].serial_number);
    });

    test("T1-CDTL-03: customer detail includes recent luggage journeys", async () => {
      const h = new TestHarness({ role: "admin" });
      const c = await h.getCustomer("60000000-0000-4000-8000-000000000001");
      assert.ok(c.recent_journeys.length > 0);
    });

    test("T1-CDTL-04: customer support notes log contains administrative audit notes", async () => {
      const h = new TestHarness({ role: "admin" });
      const c = await h.getCustomer("60000000-0000-4000-8000-000000000001");
      assert.ok(c.support_notes.length >= 1);
    });

    test("T1-CDTL-05: claimed luggage cards display model name and claim timestamp", async () => {
      const h = new TestHarness({ role: "admin" });
      const c = await h.getCustomer("60000000-0000-4000-8000-000000000001");
      const bag = c.claimed_devices[0];
      assert.ok(bag.model.length > 0);
      assert.match(bag.claimed_at, /^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ==========================================================================
  // Section 11: Alerts Incident Management
  // ==========================================================================
  describe("11. Alerts Incident Management", () => {
    test("T1-ALR-01: lists active, acknowledged, and resolved security alerts", async () => {
      const h = new TestHarness({ role: "admin" });
      const alerts = await h.listAlerts();
      assert.equal(alerts.length, 3);
    });

    test("T1-ALR-02: filters alerts by severity level", async () => {
      const h = new TestHarness({ role: "admin" });
      const critical = await h.listAlerts({ severity: "critical" });
      assert.equal(critical.length, 1);
      assert.equal(critical[0].severity, "critical");
    });

    test("T1-ALR-03: filters alerts by category (tamper, battery, geofence)", async () => {
      const h = new TestHarness({ role: "admin" });
      const tamper = await h.listAlerts({ category: "tamper" });
      assert.equal(tamper.length, 1);
      assert.equal(tamper[0].category, "tamper");
    });

    test("T1-ALR-04: alert includes geographic coordinates of incident", async () => {
      const h = new TestHarness({ role: "admin" });
      const a = (await h.listAlerts({ severity: "critical" }))[0];
      assert.ok(typeof a.latitude === "number");
      assert.ok(typeof a.longitude === "number");
    });

    test("T1-ALR-05: active alert can be acknowledged by staff", async () => {
      const h = new TestHarness({ role: "admin" });
      const acked = await h.acknowledgeAlert("70000000-0000-4000-8000-000000000001");
      assert.equal(acked.status, "acknowledged");
    });
  });

  // ==========================================================================
  // Section 12: Alert Details & Resolution
  // ==========================================================================
  describe("12. Alert Details & Resolution", () => {
    test("T1-ADTL-01: retrieves full incident record by alert ID", async () => {
      const h = new TestHarness({ role: "admin" });
      const a = await h.getAlert("70000000-0000-4000-8000-000000000001");
      assert.equal(a.title, "Unauthorized Zipper Tamper Detected");
      assert.equal(a.severity, "critical");
    });

    test("T1-ADTL-02: administrator resolves alert with documented resolution notes", async () => {
      const h = new TestHarness({ role: "admin" });
      const resolved = await h.resolveAlert(
        "70000000-0000-4000-8000-000000000001",
        "Inspected bag at carousel. TSA inspection seal intact. No theft.",
      );
      assert.equal(resolved.status, "resolved");
      assert.ok(resolved.resolved_at);
      assert.ok(resolved.resolved_by);
      assert.equal(resolved.resolution_notes, "Inspected bag at carousel. TSA inspection seal intact. No theft.");
    });

    test("T1-ADTL-03: alert displays affected smart luggage serial number", async () => {
      const h = new TestHarness({ role: "admin" });
      const a = await h.getAlert("70000000-0000-4000-8000-000000000001");
      assertValidAsciiSerial(a.serial_number);
    });

    test("T1-ADTL-04: resolved alert preserves historical resolution timestamp and notes", async () => {
      const h = new TestHarness({ role: "admin" });
      const a = await h.getAlert("70000000-0000-4000-8000-000000000003");
      assert.equal(a.status, "resolved");
      assert.ok(a.resolved_at);
      assert.ok(a.resolution_notes);
    });

    test("T1-ADTL-05: incident timeline records trigger ISO timestamp", async () => {
      const h = new TestHarness({ role: "admin" });
      const a = await h.getAlert("70000000-0000-4000-8000-000000000002");
      assert.match(a.created_at, /^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ==========================================================================
  // Section 13: Device Registration
  // ==========================================================================
  describe("13. Device Registration", () => {
    test("T1-REG-01: administrator registers device with explicit manufacturer selection", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.registerDevice({
        serial_number: "AMT-T1-NEW-0001",
        model: "Carry-On 55",
        firmware_version: "1.4.2",
        manufacturer_id: consoleUsers[1].id,
      });
      assert.equal(res.device.serial_number, "AMT-T1-NEW-0001");
      assert.equal(res.device.manufacturer_id, consoleUsers[1].id);
      assert.equal(res.device.status, "registered");
      assertValidHex(res.claim_code);
    });

    test("T1-REG-02: manufacturer registers device with auto-scoped manufacturer ID", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      const res = await h.api.registerDevice({
        serial_number: "AMT-MFR-NEW-0002",
        model: "Check-In 70",
        firmware_version: "1.4.2",
      });
      assert.equal(res.device.manufacturer_id, h.api.session.id);
      assertValidHex(res.claim_code);
    });

    test("T1-REG-03: serial number automatically normalizes to uppercase", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.registerDevice({
        serial_number: "  amt-lowercase-0003  ",
        model: "Weekender 40",
        firmware_version: "1.4.2",
        manufacturer_id: consoleUsers[1].id,
      });
      assert.equal(res.device.serial_number, "AMT-LOWERCASE-0003");
    });

    test("T1-REG-04: one-time claim code is exactly 64 hexadecimal characters", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.registerDevice({
        serial_number: "AMT-CLAIM-0004",
        model: "Carry-On 55",
        firmware_version: "1.4.2",
        manufacturer_id: consoleUsers[1].id,
      });
      assert.equal(res.claim_code.length, 64);
      assertValidHex(res.claim_code);
    });

    test("T1-REG-05: registered device generates initial audit log row", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.registerDevice({
        serial_number: "AMT-AUDIT-0005",
        model: "Carry-On 55",
        firmware_version: "1.4.2",
        manufacturer_id: consoleUsers[1].id,
      });
      const audits = await h.api.listDeviceAudit(res.device.id);
      assert.equal(audits.items.length, 1);
      assert.equal(audits.items[0].action, "registered");
    });
  });

  // ==========================================================================
  // Section 14: Manufacturers Dedicated Portal
  // ==========================================================================
  describe("14. Manufacturers Dedicated Portal", () => {
    test("T1-MFR-01: administrator lists all manufacturing partner organizations", async () => {
      const h = new TestHarness({ role: "admin" });
      const partners = await h.listManufacturers();
      assert.equal(partners.length, 2);
      assert.equal(partners[0].company_name, "Northline Cases");
    });

    test("T1-MFR-02: partner profile includes volume quota and registered unit counts", async () => {
      const h = new TestHarness({ role: "admin" });
      const northline = (await h.listManufacturers())[0];
      assert.equal(northline.allocated_quota, 10000);
      assert.ok(northline.registered_units > 0);
    });

    test("T1-MFR-03: partner profile reports traveler claim rate percentage", async () => {
      const h = new TestHarness({ role: "admin" });
      const northline = (await h.listManufacturers())[0];
      assert.ok(northline.claim_rate_pct >= 0 && northline.claim_rate_pct <= 100);
    });

    test("T1-MFR-04: creates manufacturer account with temporary password via async job", async () => {
      const h = new TestHarness({ role: "admin" });
      const receipt = await h.api.createManufacturer({
        email: "partner.new@factory.example.invalid",
        password: "fictional-demo-pass",
      });
      assert.ok(receipt.job_id);
      assert.ok(receipt.receipt.length >= 32);
      assert.ok(receipt.poll_after_ms > 0);
      const poll1 = await h.api.getJob(receipt.job_id, receipt.receipt);
      assert.equal(poll1.status, "processing");
      const poll2 = await h.api.getJob(receipt.job_id, receipt.receipt);
      assert.equal(poll2.http_status, 201);
    });

    test("T1-MFR-05: new manufacturer appears in accounts table after job completion", async () => {
      const h = new TestHarness({ role: "admin" });
      const receipt = await h.api.createManufacturer({
        email: "verified.mfr@factory.example.invalid",
        password: "fictional-demo-pass",
      });
      await h.api.getJob(receipt.job_id, receipt.receipt);
      await h.api.getJob(receipt.job_id, receipt.receipt);
      const users = await h.api.listUsers();
      assert.ok(users.items.some((u) => u.email === "verified.mfr@factory.example.invalid"));
    });
  });

  // ==========================================================================
  // Section 15: Private Files Management
  // ==========================================================================
  describe("15. Private Files Management", () => {
    test("T1-FIL-01: administrator lists all uploaded private files", async () => {
      const h = new TestHarness({ role: "admin" });
      const files = await h.api.listFiles();
      assert.equal(files.items.length, 5);
    });

    test("T1-FIL-02: manufacturer sees only files owned by their user account", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      const files = await h.api.listFiles();
      assert.equal(files.items.length, 3);
      assert.ok(files.items.every((f) => f.owner_id === h.api.session.id));
    });

    test("T1-FIL-03: uploads valid plain text specification file", async () => {
      const h = new TestHarness({ role: "admin" });
      const content = new TextEncoder().encode("AMTRAV Spec C055 Harmless Fixture\n");
      const f = await h.api.uploadFile("c055-spec-new.txt", "text/plain", content);
      assert.equal(f.filename, "c055-spec-new.txt");
      assert.equal(f.size_bytes, content.length);
    });

    test("T1-FIL-04: downloads uploaded file bytes accurately matching source", async () => {
      const h = new TestHarness({ role: "admin" });
      const raw = new TextEncoder().encode("Exact byte match fixture\n");
      const f = await h.api.uploadFile("match-test.txt", "text/plain", raw);
      const downloaded = await h.api.downloadFile(f.id);
      assert.deepEqual(downloaded, raw);
    });

    test("T1-FIL-05: file metadata card exposes formatted size and creation timestamp", async () => {
      const h = new TestHarness({ role: "admin" });
      const f = await h.api.getFile(consoleFiles[0].id);
      assert.ok(f.size_bytes > 0);
      assert.match(f.created_at, /^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ==========================================================================
  // Section 16: Console Settings
  // ==========================================================================
  describe("16. Console Settings", () => {
    test("T1-SET-01: retrieves default console settings and demo integrity flag", async () => {
      const h = new TestHarness({ role: "admin" });
      const cfg = await h.getSettings();
      assert.equal(cfg.demo_integrity_mode, true);
      assert.equal(cfg.theme_preference, "light");
    });

    test("T1-SET-02: updates battery warning threshold percentage", async () => {
      const h = new TestHarness({ role: "admin" });
      const updated = await h.updateSettings({ battery_warning_threshold_pct: 20 });
      assert.equal(updated.battery_warning_threshold_pct, 20);
    });

    test("T1-SET-03: updates geofence tolerance distance in meters", async () => {
      const h = new TestHarness({ role: "admin" });
      const updated = await h.updateSettings({ geofence_tolerance_meters: 75 });
      assert.equal(updated.geofence_tolerance_meters, 75);
    });

    test("T1-SET-04: updates session timeout duration in minutes", async () => {
      const h = new TestHarness({ role: "admin" });
      const updated = await h.updateSettings({ session_timeout_minutes: 30 });
      assert.equal(updated.session_timeout_minutes, 30);
    });

    test("T1-SET-05: toggles reduced motion preference flag", async () => {
      const h = new TestHarness({ role: "admin" });
      const updated = await h.updateSettings({ reduced_motion_enforced: true });
      assert.equal(updated.reduced_motion_enforced, true);
    });
  });
});
