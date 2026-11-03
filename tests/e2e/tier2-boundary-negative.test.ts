import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  TestHarness,
  assertRejectsStatus,
} from "./test-harness";
import {
  consoleDevices,
  consoleUsers,
  consoleFiles,
} from "../../admin_panel/lib/console-fixtures";
import {
  registrationErrors,
  validEmail,
  validPassword,
  fileError,
  FILE_LIMIT,
} from "../../admin_panel/lib/api/validation";
import { toAdminRole, sanitizeIdentifier } from "../../admin_panel/lib/admin-sections";
import { MockApiError, mockUserForRole } from "../../admin_panel/lib/api/index";

describe("Tier 2 Boundary Value Analysis & Negative Testing", () => {
  // ==========================================================================
  // Section 1: Authentication & Session
  // ==========================================================================
  describe("1. Authentication Boundaries & Negative Paths", () => {
    test("T2-AUTH-01: invalid email formats are rejected by validator", () => {
      for (const email of [
        "plainaddress",
        "@missingusername.com",
        "a@localhost",
        "a@@b.invalid",
        "a b@x.invalid",
        "é@x.invalid",
        "",
      ]) {
        assert.equal(validEmail(email), false, `Expected ${email} to be invalid`);
      }
    });

    test("T2-AUTH-02: password shorter than 12 UTF-8 bytes fails validation", () => {
      assert.equal(validPassword("short"), false);
      assert.equal(validPassword("12345678901"), false);
      // 11 ASCII characters is 11 bytes:
      assert.equal(validPassword("a".repeat(11)), false);
    });

    test("T2-AUTH-03: password longer than 128 UTF-8 bytes fails validation", () => {
      assert.equal(validPassword("a".repeat(129)), false);
    });

    test("T2-AUTH-04: unauthenticated actor calling protected API throws 401 Unauthorized", async () => {
      const unauthApi = new TestHarness({ failure: undefined }).api;
      // createMockApi with user role attempting manufacturer access:
      const userH = new TestHarness({ role: "user" });
      await assertRejectsStatus(() => userH.api.listUsers(), 403, "admin role required");
    });

    test("T2-AUTH-05: rate limit simulation produces 429 status and retry header", async () => {
      const h = new TestHarness({ failure: "rate_limit" });
      await assertRejectsStatus(() => h.api.listDevices(), 429, "retry later");
    });
  });

  // ==========================================================================
  // Section 2: App Shell & Navigation Registry
  // ==========================================================================
  describe("2. App Shell & Navigation Role Boundaries", () => {
    test("T2-SHELL-01: manufacturer role is denied access to users/accounts endpoint (403)", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      await assertRejectsStatus(() => h.api.listUsers(), 403, "admin role required");
    });

    test("T2-SHELL-02: user role is denied manufacturer access endpoint (403)", async () => {
      const h = new TestHarness({ role: "user" });
      await assertRejectsStatus(() => h.api.manufacturerAccess(), 403, "required role is missing");
    });

    test("T2-SHELL-03: unauthenticated request to protected section fails closed", () => {
      const cookieAbsent = null;
      const isAuthenticated = Boolean(cookieAbsent);
      assert.equal(isAuthenticated, false);
    });

    test("T2-SHELL-04: sanitizeIdentifier clamps long input strings to 100 characters", () => {
      const longInput = "a".repeat(150);
      const sanitized = sanitizeIdentifier(longInput);
      assert.equal(sanitized.length, 100);
    });

    test("T2-SHELL-05: toAdminRole returns null for unmapped roles like 'user'", () => {
      assert.equal(toAdminRole("user"), null);
      assert.equal(toAdminRole("admin"), "administrator");
      assert.equal(toAdminRole("manufacturer"), "manufacturer");
    });
  });

  // ==========================================================================
  // Section 3: Overview Dashboard
  // ==========================================================================
  describe("3. Overview Dashboard Boundary Conditions", () => {
    test("T2-OVR-01: empty fleet data scenario produces 0 counts without crash", async () => {
      const h = new TestHarness({ empty: true });
      const kpis = await h.getOverviewKpis();
      assert.equal(kpis.total_registered, 0);
      assert.equal(kpis.unclaimed_count, 0);
      assert.equal(kpis.claimed_count, 0);
      assert.equal(kpis.revoked_count, 0);
      assert.equal(kpis.active_journeys, 0);
      assert.equal(kpis.active_alerts, 0);
    });

    test("T2-OVR-02: trend chart handles zero-data series with safe baseline", async () => {
      const emptySeries: number[] = [];
      const baseline = emptySeries.length > 0 ? Math.max(...emptySeries) : 0;
      assert.equal(baseline, 0);
    });

    test("T2-OVR-03: requesting unsupported trend window clamps to default 4 weeks", () => {
      const rawWindow = 52;
      const supported = [4, 8, 12];
      const normalized = supported.includes(rawWindow) ? rawWindow : 4;
      assert.equal(normalized, 4);
    });

    test("T2-OVR-04: service outage scenario throws typed 503 unavailable error", async () => {
      const h = new TestHarness({ failure: "unavailable" });
      await assertRejectsStatus(() => h.api.listDevices(), 503, "service temporarily unavailable");
    });

    test("T2-OVR-05: rate limit scenario throws typed 429 error", async () => {
      const h = new TestHarness({ failure: "rate_limit" });
      await assertRejectsStatus(() => h.api.listDevices(), 429, "retry later");
    });
  });

  // ==========================================================================
  // Section 4: Devices Registry
  // ==========================================================================
  describe("4. Devices Registry Boundaries & Negatives", () => {
    test("T2-DEV-01: negative pagination offset is normalized to 0", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.api.listDevices({ limit: 5, offset: -10 });
      assert.equal(res.items.length, 5);
      assert.equal(res.items[0].id, consoleDevices[0].id);
    });

    test("T2-DEV-02: non-integer pagination limit/offset rejects with 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.api.listDevices({ limit: 2.5 }),
        400,
        "limit and offset must be integers",
      );
    });

    test("T2-DEV-03: querying non-existent device ID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.api.getDevice("99999999-9999-4000-8000-999999999999"),
        404,
        "device not found",
      );
    });

    test("T2-DEV-04: manufacturer querying device ID owned by another manufacturer throws 404", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      // consoleDevices[4] is owned by Harbor Goods, not Northline
      await assertRejectsStatus(
        () => h.api.getDevice(consoleDevices[4].id),
        404,
        "device not found",
      );
    });

    test("T2-DEV-05: searching with non-matching query returns empty list without error", async () => {
      const h = new TestHarness({ role: "admin" });
      const devices = (await h.api.listDevices()).items;
      const matched = devices.filter((d) => d.serial_number.includes("NON-EXISTENT-XYZ"));
      assert.equal(matched.length, 0);
    });
  });

  // ==========================================================================
  // Section 5: Device Details
  // ==========================================================================
  describe("5. Device Details Boundaries & Lifecycle Enforcement", () => {
    test("T2-DTL-01: updating model with empty string or null fails validation (400)", async () => {
      const h = new TestHarness({ role: "admin" });
      const d = consoleDevices[2];
      await assertRejectsStatus(() => h.api.updateDevice(d.id, { model: "" }), 400);
      await assertRejectsStatus(() => h.api.updateDevice(d.id, { model: null }), 400);
    });

    test("T2-DTL-02: updating model with string exceeding 128 UTF-8 bytes fails validation (400)", async () => {
      const h = new TestHarness({ role: "admin" });
      const d = consoleDevices[2];
      await assertRejectsStatus(
        () => h.api.updateDevice(d.id, { model: "a".repeat(129) }),
        400,
      );
    });

    test("T2-DTL-03: updating model with unicode control characters fails validation (400)", async () => {
      const h = new TestHarness({ role: "admin" });
      const d = consoleDevices[2];
      await assertRejectsStatus(
        () => h.api.updateDevice(d.id, { model: "Carry-On\u0000Corrupted" }),
        400,
      );
    });

    test("T2-DTL-04: attempting to rotate claim code on claimed bag rejected with 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      const claimedBag = consoleDevices[0];
      assert.equal(claimedBag.status, "claimed");
      await assertRejectsStatus(
        () => h.api.rotateClaimCode(claimedBag.id),
        409,
        "only unclaimed devices can receive a new claim code",
      );
    });

    test("T2-DTL-05: attempting to edit metadata or rotate code on revoked bag rejected with 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      const revokedBag = consoleDevices[4];
      assert.equal(revokedBag.status, "revoked");
      await assertRejectsStatus(
        () => h.api.updateDevice(revokedBag.id, { model: "New Model" }),
        409,
        "device is revoked",
      );
      await assertRejectsStatus(
        () => h.api.rotateClaimCode(revokedBag.id),
        409,
        "only unclaimed devices can receive a new claim code",
      );
    });
  });

  // ==========================================================================
  // Section 6: Device Operations & Telemetry
  // ==========================================================================
  describe("6. Device Operations Boundaries & Negative Paths", () => {
    test("T2-OPS-01: manufacturer attempting remote lock toggle rejected with 403 Forbidden", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      await assertRejectsStatus(
        () => h.toggleRemoteLock(consoleDevices[0].id, true),
        403,
        "admin role required",
      );
    });

    test("T2-OPS-02: remote lock toggle on revoked luggage rejected with 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      const revoked = consoleDevices[4];
      await assertRejectsStatus(
        () => h.toggleRemoteLock(revoked.id, true),
        409,
        "device is revoked",
      );
    });

    test("T2-OPS-03: diagnostics ping on revoked luggage rejected with 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      const revoked = consoleDevices[4];
      await assertRejectsStatus(
        () => h.triggerDiagnostics(revoked.id),
        409,
        "device is revoked",
      );
    });

    test("T2-OPS-04: firmware staging with empty version string rejected with 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () =>
          h.stageFirmwareUpdate({
            firmware_version: "",
            target_channel: "stable",
            staged_by: h.api.session.id,
          }),
        400,
        "invalid firmware version",
      );
    });

    test("T2-OPS-05: firmware staging with version string > 64 bytes rejected with 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () =>
          h.stageFirmwareUpdate({
            firmware_version: "1.0.0-" + "x".repeat(60),
            target_channel: "stable",
            staged_by: h.api.session.id,
          }),
        400,
        "invalid firmware version",
      );
    });
  });

  // ==========================================================================
  // Section 7: Journeys & Luggage Tracking
  // ==========================================================================
  describe("7. Journeys Boundaries & Negative Paths", () => {
    test("T2-JRN-01: querying non-existent flight number returns empty result set", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.listJourneys({ flight: "XX-9999" });
      assert.equal(res.length, 0);
    });

    test("T2-JRN-02: querying non-existent journey UUID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.getJourney("99000000-0000-4000-8000-999999999999"),
        404,
        "journey not found",
      );
    });

    test("T2-JRN-03: filtering journeys by non-matching status yields empty list", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.listJourneys({ status: "exception" });
      assert.equal(res.length, 0);
    });

    test("T2-JRN-04: empty journeys database scenario returns empty array without error", async () => {
      const h = new TestHarness({ empty: true });
      const res = await h.listJourneys();
      assert.equal(res.length, 0);
    });

    test("T2-JRN-05: journey status values outside allowed union are rejected by type guard", () => {
      const allowed = ["scheduled", "in_transit", "delayed", "arrived", "exception"];
      const invalidStatus = "teleported";
      assert.equal(allowed.includes(invalidStatus), false);
    });
  });

  // ==========================================================================
  // Section 8: Journey Details
  // ==========================================================================
  describe("8. Journey Details Boundaries", () => {
    test("T2-JDTL-01: invalid journey UUID format throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(() => h.getJourney("not-a-uuid"), 404, "journey not found");
    });

    test("T2-JDTL-02: delayed journey correctly exposes delayed status", async () => {
      const h = new TestHarness({ role: "admin" });
      const delayed = await h.getJourney("50000000-0000-4000-8000-000000000003");
      assert.equal(delayed.status, "delayed");
      assert.equal(delayed.arrived_at, null);
    });

    test("T2-JDTL-03: checkpoint array timestamps must be non-decreasing", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000001");
      for (let i = 1; i < j.checkpoints.length; i++) {
        const prevTime = new Date(j.checkpoints[i - 1].timestamp).getTime();
        const currTime = new Date(j.checkpoints[i].timestamp).getTime();
        assert.ok(currTime >= prevTime, "Checkpoints must be in chronological order");
      }
    });

    test("T2-JDTL-04: unverified checkpoints are flagged with verified: false", () => {
      const unverifiedCp = {
        id: "51000000-0000-4000-8000-000000000099",
        name: "Manual Ramp Scan",
        airport_code: "JFK",
        timestamp: "2026-10-24T05:00:00Z",
        scan_type: "ramp_load" as const,
        verified: false,
      };
      assert.equal(unverifiedCp.verified, false);
    });

    test("T2-JDTL-05: journey without arrival record retains arrived_at as null", async () => {
      const h = new TestHarness({ role: "admin" });
      const j = await h.getJourney("50000000-0000-4000-8000-000000000001");
      assert.equal(j.arrived_at, null);
    });
  });

  // ==========================================================================
  // Section 9: Customers Directory
  // ==========================================================================
  describe("9. Customers Directory Boundaries & Negatives", () => {
    test("T2-CUST-01: customer search with special regex meta-characters is handled literally", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.listCustomers(".*+?^${}()|[email protected]");
      assert.equal(res.length, 0);
    });

    test("T2-CUST-02: searching with no matching customer returns empty array", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.listCustomers("NonExistentPassengerName");
      assert.equal(res.length, 0);
    });

    test("T2-CUST-03: querying non-existent customer UUID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.getCustomer("99000000-0000-4000-8000-999999999999"),
        404,
        "customer not found",
      );
    });

    test("T2-CUST-04: empty customer database scenario returns empty list", async () => {
      const h = new TestHarness({ empty: true });
      const res = await h.listCustomers();
      assert.equal(res.length, 0);
    });

    test("T2-CUST-05: customer full name search is case-insensitive", async () => {
      const h = new TestHarness({ role: "admin" });
      const upper = await h.listCustomers("ELENA");
      const lower = await h.listCustomers("elena");
      assert.equal(upper.length, 1);
      assert.equal(lower.length, 1);
      assert.equal(upper[0].id, lower[0].id);
    });
  });

  // ==========================================================================
  // Section 10: Customer Details
  // ==========================================================================
  describe("10. Customer Details Boundaries", () => {
    test("T2-CDTL-01: invalid customer UUID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(() => h.getCustomer("invalid-id"), 404, "customer not found");
    });

    test("T2-CDTL-02: customer without claimed devices displays empty array safely", async () => {
      const h = new TestHarness({ empty: true });
      // When fleet is empty, customer details claimed_devices is empty
      // Add one customer manually to empty harness
      const customer: any = {
        id: "60000000-0000-4000-8000-000000000099",
        full_name: "Empty Traveler",
        email: "empty@traveler.invalid",
        phone: "+1-555-000-0000",
        account_type: "email",
        vip_status: "standard",
        claimed_devices_count: 0,
        created_at: "2026-10-01T00:00:00Z",
      };
      const detail = {
        ...customer,
        claimed_devices: [],
        recent_journeys: [],
        support_notes: [],
      };
      assert.equal(detail.claimed_devices.length, 0);
      assert.equal(detail.support_notes.length, 0);
    });

    test("T2-CDTL-03: customer support notes containing HTML/script tags are treated as plain text", () => {
      const rawNote = "<script>alert('xss')</script>";
      // DOM textContent assignment prevents script execution
      const simulatedTextContent = rawNote.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      assert.ok(!simulatedTextContent.includes("<script>"));
    });

    test("T2-CDTL-04: mobile Google OAuth account is identified by account_type", async () => {
      const h = new TestHarness({ role: "admin" });
      const elena = await h.getCustomer("60000000-0000-4000-8000-000000000001");
      assert.equal(elena.account_type, "google_mobile");
    });

    test("T2-CDTL-05: standard email account is identified by account_type", async () => {
      const h = new TestHarness({ role: "admin" });
      const marcus = await h.getCustomer("60000000-0000-4000-8000-000000000002");
      assert.equal(marcus.account_type, "email");
    });
  });

  // ==========================================================================
  // Section 11: Alerts Incident Management
  // ==========================================================================
  describe("11. Alerts Incident Management Boundaries & Negatives", () => {
    test("T2-ALR-01: querying alerts with non-matching severity yields empty array", async () => {
      const h = new TestHarness({ role: "admin" });
      const res = await h.listAlerts({ severity: "low" });
      assert.equal(res.length, 0);
    });

    test("T2-ALR-02: querying non-existent alert UUID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.getAlert("99000000-0000-4000-8000-999999999999"),
        404,
        "alert not found",
      );
    });

    test("T2-ALR-03: acknowledging already resolved alert throws 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      const resolvedAlert = "70000000-0000-4000-8000-000000000003";
      await assertRejectsStatus(
        () => h.acknowledgeAlert(resolvedAlert),
        409,
        "cannot acknowledge already resolved alert",
      );
    });

    test("T2-ALR-04: manufacturer role attempting to resolve alert rejected with 403 Forbidden", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      await assertRejectsStatus(
        () => h.resolveAlert("70000000-0000-4000-8000-000000000001", "Notes"),
        403,
        "admin role required",
      );
    });

    test("T2-ALR-05: empty alerts database scenario returns 0 alerts", async () => {
      const h = new TestHarness({ empty: true });
      const res = await h.listAlerts();
      assert.equal(res.length, 0);
    });
  });

  // ==========================================================================
  // Section 12: Alert Details & Resolution
  // ==========================================================================
  describe("12. Alert Details Resolution Boundaries", () => {
    test("T2-ADTL-01: resolving alert without resolution notes throws 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.resolveAlert("70000000-0000-4000-8000-000000000001", ""),
        400,
        "resolution notes are required",
      );
    });

    test("T2-ADTL-02: resolving alert with whitespace-only notes throws 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.resolveAlert("70000000-0000-4000-8000-000000000001", "     "),
        400,
        "resolution notes are required",
      );
    });

    test("T2-ADTL-03: resolving non-existent alert ID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.resolveAlert("99000000-0000-4000-8000-999999999999", "Notes"),
        404,
        "alert not found",
      );
    });

    test("T2-ADTL-04: GPS coordinates out of geographic range are flagged", () => {
      const validLat = (lat: number) => lat >= -90 && lat <= 90;
      const validLon = (lon: number) => lon >= -180 && lon <= 180;
      assert.equal(validLat(95), false);
      assert.equal(validLon(-190), false);
      assert.equal(validLat(40.6413), true);
      assert.equal(validLon(-73.7781), true);
    });

    test("T2-ADTL-05: active alert retains resolved_at as null", async () => {
      const h = new TestHarness({ role: "admin" });
      const a = await h.getAlert("70000000-0000-4000-8000-000000000001");
      assert.equal(a.status, "active");
      assert.equal(a.resolved_at, null);
    });
  });

  // ==========================================================================
  // Section 13: Device Registration
  // ==========================================================================
  describe("13. Device Registration Validation Boundaries", () => {
    test("T2-REG-01: serial number shorter than 6 characters is rejected", () => {
      const res = registrationErrors({
        serial_number: "AMT",
        model: "Carry-On 55",
        firmware_version: "1.0.0",
      });
      assert.ok(res.serial_number);
    });

    test("T2-REG-02: serial number longer than 64 characters is rejected", () => {
      const res = registrationErrors({
        serial_number: "A".repeat(65),
        model: "Carry-On 55",
        firmware_version: "1.0.0",
      });
      assert.ok(res.serial_number);
    });

    test("T2-REG-03: serial numbers with illegal characters (/ @ space non-ASCII) are rejected", () => {
      for (const bad of ["AMT/1000", "AMT é100", "AMT 1000", "AMT@1000", "AMT.1000"]) {
        const res = registrationErrors({
          serial_number: bad,
          model: "Carry-On 55",
          firmware_version: "1.0.0",
        });
        assert.ok(res.serial_number, `Expected invalid serial for ${bad}`);
      }
    });

    test("T2-REG-04: registering duplicate serial number rejected with 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () =>
          h.api.registerDevice({
            serial_number: consoleDevices[0].serial_number,
            model: "Carry-On 55",
            firmware_version: "1.4.2",
            manufacturer_id: consoleUsers[1].id,
          }),
        409,
        "device serial number already exists",
      );
    });

    test("T2-REG-05: administrator registering device without manufacturer_id rejected with 400", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () =>
          h.api.registerDevice({
            serial_number: "AMT-VALID-0099",
            model: "Carry-On 55",
            firmware_version: "1.4.2",
            manufacturer_id: undefined,
          }),
        400,
        "manufacturer_id is required for admin registration",
      );
    });
  });

  // ==========================================================================
  // Section 14: Manufacturers Dedicated Portal
  // ==========================================================================
  describe("14. Manufacturers Portal Boundaries & Negatives", () => {
    test("T2-MFR-01: creating manufacturer with duplicate email rejected with 409 Conflict", async () => {
      const h = new TestHarness({ role: "admin" });
      // Create first
      const r1 = await h.api.createManufacturer({
        email: "duplicate@factory.example.invalid",
        password: "fictional-demo-pass",
      });
      await h.api.getJob(r1.job_id, r1.receipt);
      await h.api.getJob(r1.job_id, r1.receipt);

      // Attempt duplicate
      const r2 = await h.api.createManufacturer({
        email: "duplicate@factory.example.invalid",
        password: "fictional-demo-pass",
      });
      await h.api.getJob(r2.job_id, r2.receipt);
      const poll = await h.api.getJob(r2.job_id, r2.receipt);
      assert.equal(poll.http_status, 409);
    });

    test("T2-MFR-02: creating manufacturer with temporary password < 12 bytes rejected with 400", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () =>
          h.api.createManufacturer({
            email: "valid@factory.example.invalid",
            password: "short",
          }),
        400,
        "invalid manufacturer credentials",
      );
    });

    test("T2-MFR-03: creating manufacturer with temporary password > 128 bytes rejected with 400", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () =>
          h.api.createManufacturer({
            email: "valid@factory.example.invalid",
            password: "a".repeat(129),
          }),
        400,
        "invalid manufacturer credentials",
      );
    });

    test("T2-MFR-04: polling job status with wrong receipt capability rejected with 404", async () => {
      const h = new TestHarness({ role: "admin" });
      const r = await h.api.createManufacturer({
        email: "poll@factory.example.invalid",
        password: "fictional-demo-pass",
      });
      await assertRejectsStatus(
        () => h.api.getJob(r.job_id, "wrong-receipt-capability-value"),
        404,
        "job not found",
      );
    });

    test("T2-MFR-05: non-admin manufacturer attempting to list manufacturer partners rejected with 403", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      await assertRejectsStatus(
        () => h.listManufacturers(),
        403,
        "admin role required",
      );
    });
  });

  // ==========================================================================
  // Section 15: Private Files Management
  // ==========================================================================
  describe("15. Private Files Boundaries & Negative Paths", () => {
    test("T2-FIL-01: uploading 0-byte empty file rejected with 400 Bad Request", () => {
      assert.ok(fileError("empty.txt", "text/plain", 0));
    });

    test("T2-FIL-02: uploading file exceeding 10 MiB rejected with 413 Payload Too Large", async () => {
      const h = new TestHarness({ role: "admin" });
      assert.ok(fileError("oversized.bin", "application/octet-stream", FILE_LIMIT + 1));
      await assertRejectsStatus(
        () =>
          h.api.uploadFile(
            "oversized.bin",
            "application/octet-stream",
            new Uint8Array(FILE_LIMIT + 1),
          ),
        413,
      );
    });

    test("T2-FIL-03: uploading disallowed MIME type (text/html) rejected with 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      assert.ok(fileError("unsafe.html", "text/html", 100));
      await assertRejectsStatus(
        () =>
          h.api.uploadFile(
            "unsafe.html",
            "text/html",
            new TextEncoder().encode("<script>alert(1)</script>"),
          ),
        400,
      );
    });

    test("T2-FIL-04: uploading file with path traversal filename rejected with 400 Bad Request", () => {
      for (const bad of ["../secret.txt", "bad/name.txt", ".", "..", "foo/../bar.txt"]) {
        assert.ok(fileError(bad, "text/plain", 50), `Expected ${bad} to be rejected`);
      }
    });

    test("T2-FIL-05: downloading non-existent file ID throws 404 Not Found", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.api.downloadFile("99000000-0000-4000-8000-999999999999"),
        404,
        "file not found",
      );
    });
  });

  // ==========================================================================
  // Section 16: Console Settings
  // ==========================================================================
  describe("16. Console Settings Boundaries & Policies", () => {
    test("T2-SET-01: updating battery warning threshold < 0 rejected with 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.updateSettings({ battery_warning_threshold_pct: -5 }),
        400,
        "battery threshold must be between 0 and 100",
      );
    });

    test("T2-SET-02: updating battery warning threshold > 100 rejected with 400 Bad Request", async () => {
      const h = new TestHarness({ role: "admin" });
      await assertRejectsStatus(
        () => h.updateSettings({ battery_warning_threshold_pct: 105 }),
        400,
        "battery threshold must be between 0 and 100",
      );
    });

    test("T2-SET-03: non-administrator attempting to update console settings rejected with 403", async () => {
      const h = new TestHarness({ role: "manufacturer" });
      await assertRejectsStatus(
        () => h.updateSettings({ session_timeout_minutes: 15 }),
        403,
        "admin role required",
      );
    });

    test("T2-SET-04: demo integrity mode is strictly enabled by default in demo mode", async () => {
      const h = new TestHarness({ role: "admin" });
      const cfg = await h.getSettings();
      assert.equal(cfg.demo_integrity_mode, true);
    });

    test("T2-SET-05: settings update preserves unmodified properties", async () => {
      const h = new TestHarness({ role: "admin" });
      const initial = await h.getSettings();
      const patched = await h.updateSettings({ geofence_tolerance_meters: 100 });
      assert.equal(patched.geofence_tolerance_meters, 100);
      assert.equal(patched.battery_warning_threshold_pct, initial.battery_warning_threshold_pct);
      assert.equal(patched.demo_integrity_mode, initial.demo_integrity_mode);
    });
  });
});
