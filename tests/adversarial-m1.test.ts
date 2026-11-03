import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createMockApi, MockApiError } from "../admin_panel/lib/api/index";
import {
  consoleDevices,
  consoleUsers,
  consoleFiles,
  consoleAudits,
  consoleFileBodies,
  consoleFleetActivity,
} from "../admin_panel/lib/console-fixtures";
import { adminSections, toAdminRole } from "../admin_panel/lib/admin-sections";
import type { Device, FleetActivityItem, User } from "../admin_panel/lib/api/types";

// Helper to assert typed MockApiError
async function assertApiError(
  action: () => Promise<unknown>,
  status: number,
  expectedMessage?: string,
) {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof MockApiError, `Expected MockApiError, got: ${error}`);
    assert.equal(error.status, status);
    if (expectedMessage) {
      assert.equal(error.body.error, expectedMessage);
    }
    return true;
  });
}

// Setup a fresh isolated API service
function createTestService(actorRole: "admin" | "manufacturer" | "user", userIndex = 0, options: { failure?: "unavailable" | "rate_limit"; empty?: boolean } = {}) {
  const users = options.empty ? [] : [...consoleUsers];
  const matchingUsers = users.filter((u) => u.role === actorRole);
  const actor = matchingUsers[userIndex] ?? matchingUsers[0];

  return createMockApi({
    actor,
    devices: options.empty ? [] : [...consoleDevices],
    users,
    files: options.empty ? [] : [...consoleFiles],
    audits: options.empty ? [] : [...consoleAudits],
    fileBodies: options.empty ? [] : [...consoleFileBodies],
    activities: options.empty ? [] : [...consoleFleetActivity],
    advanceJobs: true,
    failure: options.failure,
  });
}

describe("Empirical Adversarial Verification — Milestone 1", () => {
  // =========================================================================
  // Section 1: Dynamic KPI Calculation & Mutation Cascades
  // =========================================================================
  describe("1. Dynamic KPI Calculation & Mutation Cascades", () => {
    test("1.1 Baseline KPI calculation matches current device fixture states across roles", async () => {
      const adminApi = createTestService("admin", 0);
      const northlineApi = createTestService("manufacturer", 0); // Northline (6 devices)
      const harborApi = createTestService("manufacturer", 1); // Harbor Goods (2 devices)

      const adminKpis = await adminApi.getOverviewKpis();
      assert.equal(adminKpis.totalFleet, 8);
      assert.equal(adminKpis.registeredBags, 3);
      assert.equal(adminKpis.unclaimedBags, 3);
      assert.equal(adminKpis.claimedBags, 4);
      assert.equal(adminKpis.revokedBags, 1);
      assert.equal(adminKpis.claimRate, 50); // 4 / 8 = 50%
      assert.equal(adminKpis.fleetHealth, 87); // Math.round(((8-1)/8)*99.4*10)/10 = 87.0
      assert.equal(adminKpis.activeJourneys, 4);

      const northlineKpis = await northlineApi.getOverviewKpis();
      assert.equal(northlineKpis.totalFleet, 6);
      assert.equal(northlineKpis.registeredBags, 3);
      assert.equal(northlineKpis.unclaimedBags, 3);
      assert.equal(northlineKpis.claimedBags, 3);
      assert.equal(northlineKpis.revokedBags, 0);
      assert.equal(northlineKpis.claimRate, 50); // 3 / 6 = 50%
      assert.equal(northlineKpis.fleetHealth, 100); // 0 revoked = 100%
      assert.equal(northlineKpis.activeJourneys, 3);

      const harborKpis = await harborApi.getOverviewKpis();
      assert.equal(harborKpis.totalFleet, 2);
      assert.equal(harborKpis.registeredBags, 0);
      assert.equal(harborKpis.unclaimedBags, 0);
      assert.equal(harborKpis.claimedBags, 1);
      assert.equal(harborKpis.revokedBags, 1);
      assert.equal(harborKpis.claimRate, 50); // 1 / 2 = 50%
      assert.equal(harborKpis.fleetHealth, 49.7); // Math.round(((2-1)/2)*99.4*10)/10 = 49.7
      assert.equal(harborKpis.activeJourneys, 1);
    });

    test("1.2 Registering a device dynamically cascades to KPIs and activity log", async () => {
      const adminApi = createTestService("admin", 0);
      const harborUser = consoleUsers[2]; // Harbor Goods

      const initialKpis = await adminApi.getOverviewKpis();
      const initialActivities = await adminApi.getRecentActivity(20);

      // Register new device under Harbor Goods
      const reg = await adminApi.registerDevice({
        serial_number: "AMT-TEST-HARBOR01",
        model: "Harbor Test C40",
        firmware_version: "2.0.0",
        manufacturer_id: harborUser.id,
      });

      assert.equal(reg.device.serial_number, "AMT-TEST-HARBOR01");

      const updatedKpis = await adminApi.getOverviewKpis();
      assert.equal(updatedKpis.totalFleet, initialKpis.totalFleet + 1);
      assert.equal(updatedKpis.registeredBags, initialKpis.registeredBags + 1);
      assert.equal(updatedKpis.unclaimedBags, initialKpis.unclaimedBags + 1);
      assert.equal(updatedKpis.claimedBags, initialKpis.claimedBags);
      assert.equal(updatedKpis.revokedBags, initialKpis.revokedBags);
      // Claim rate recalculation: 4 / 9 = 44.44% -> 44%
      assert.equal(updatedKpis.claimRate, 44);

      // Activity log check
      const updatedActivities = await adminApi.getRecentActivity(20);
      assert.equal(updatedActivities.length, initialActivities.length + 1);
      assert.equal(updatedActivities[0].device_serial, "AMT-TEST-HARBOR01");
      assert.equal(updatedActivities[0].event_type, "device_registered");
      assert.equal(updatedActivities[0].status, "normal");
    });

    test("1.3 Revoking a device updates revokedBags, health, and logs critical activity", async () => {
      const adminApi = createTestService("admin", 0);
      // consoleDevices[2] is registered (unclaimed) Northline bag
      const targetDevice = consoleDevices[2];
      assert.equal(targetDevice.status, "registered");

      const initialKpis = await adminApi.getOverviewKpis();

      const revoked = await adminApi.revokeDevice(targetDevice.id);
      assert.equal(revoked.status, "revoked");

      const updatedKpis = await adminApi.getOverviewKpis();
      assert.equal(updatedKpis.totalFleet, initialKpis.totalFleet); // total fleet unchanged
      assert.equal(updatedKpis.registeredBags, initialKpis.registeredBags - 1);
      assert.equal(updatedKpis.unclaimedBags, initialKpis.unclaimedBags - 1);
      assert.equal(updatedKpis.revokedBags, initialKpis.revokedBags + 1);
      // Health dropped: ((8 - 2)/8) * 99.4 = 74.55 -> 74.6%
      assert.equal(updatedKpis.fleetHealth, 74.6);

      // Verify activity item unshifted
      const activities = await adminApi.getRecentActivity(5);
      assert.equal(activities[0].device_serial, targetDevice.serial_number);
      assert.equal(activities[0].event_type, "tamper_detected");
      assert.equal(activities[0].status, "critical");

      // Registry revocation does not close an independent incident record.
      assert.equal(updatedKpis.tamperAlerts, initialKpis.tamperAlerts);
    });

    test("1.4 Rotating claim code appends normal activity and preserves fleet KPIs", async () => {
      const adminApi = createTestService("admin", 0);
      const targetDevice = consoleDevices[3]; // registered unclaimed
      assert.equal(targetDevice.status, "registered");

      const initialKpis = await adminApi.getOverviewKpis();

      const rotated = await adminApi.rotateClaimCode(targetDevice.id);
      assert.ok(rotated.claim_code);

      const updatedKpis = await adminApi.getOverviewKpis();
      assert.deepEqual(updatedKpis, initialKpis);

      const activities = await adminApi.getRecentActivity(5);
      assert.equal(activities[0].device_serial, targetDevice.serial_number);
      assert.equal(activities[0].event_type, "claim_code_rotated");
      assert.equal(activities[0].status, "normal");
    });

    test("1.5 Stress test: rapid sequential mutations maintain fleet reconciliation", async () => {
      const adminApi = createTestService("admin", 0);
      const northlineId = consoleUsers[1].id;

      // Perform 5 sequential registrations
      for (let i = 1; i <= 5; i++) {
        await adminApi.registerDevice({
          serial_number: `AMT-RAPID-SEQ${i.toString().padStart(3, "0")}`,
          model: "Rapid Carry-On",
          firmware_version: "1.0.0",
          manufacturer_id: northlineId,
        });
      }

      const kpis = await adminApi.getOverviewKpis();
      assert.equal(kpis.totalFleet, 8 + 5); // 13
      assert.equal(kpis.registeredBags, 3 + 5); // 8
      assert.equal(kpis.unclaimedBags, 3 + 5); // 8
      assert.equal(kpis.claimedBags, 4);
      assert.equal(kpis.revokedBags, 1);
      assert.equal(kpis.totalFleet, kpis.registeredBags + kpis.claimedBags + kpis.revokedBags);
    });
  });

  // =========================================================================
  // Section 2: Multi-Tenant Role Isolation & Boundary Attacks
  // =========================================================================
  describe("2. Multi-Tenant Role Isolation & Boundary Attacks", () => {
    test("2.1 Manufacturer cannot register a device under another manufacturer ID", async () => {
      const harborApi = createTestService("manufacturer", 1); // Harbor Goods
      const northlineId = consoleUsers[1].id;

      await assertApiError(
        () =>
          harborApi.registerDevice({
            serial_number: "AMT-SPOOF-001",
            model: "Spoofed Bag",
            firmware_version: "1.0.0",
            manufacturer_id: northlineId,
          }),
        403,
        "cannot register devices for another manufacturer",
      );
    });

    test("2.2 Manufacturer cannot get, revoke, or rotate another manufacturer's device", async () => {
      const harborApi = createTestService("manufacturer", 1); // Harbor Goods
      const northlineDevice = consoleDevices[0]; // Northline device

      await assertApiError(() => harborApi.getDevice(northlineDevice.id), 404, "device not found");
      await assertApiError(() => harborApi.revokeDevice(northlineDevice.id), 404, "device not found");
      await assertApiError(() => harborApi.rotateClaimCode(northlineDevice.id), 404, "device not found");
    });

    test("2.3 Manufacturer activity feed is strictly partitioned to accessible devices", async () => {
      const harborApi = createTestService("manufacturer", 1); // Harbor Goods
      const northlineApi = createTestService("manufacturer", 0); // Northline

      const harborActivities = await harborApi.getRecentActivity(50);
      const northlineActivities = await northlineApi.getRecentActivity(50);

      const harborSerials = new Set(consoleDevices.filter((d) => d.manufacturer_id === consoleUsers[2].id).map((d) => d.serial_number));
      const northlineSerials = new Set(consoleDevices.filter((d) => d.manufacturer_id === consoleUsers[1].id).map((d) => d.serial_number));

      // Harbor only sees events for Harbor devices
      for (const act of harborActivities) {
        if (act.device_id) {
          assert.ok(harborSerials.has(act.device_serial), `Harbor observed non-Harbor serial: ${act.device_serial}`);
          assert.ok(!northlineSerials.has(act.device_serial), `Harbor leaked Northline serial: ${act.device_serial}`);
        }
      }

      // Northline only sees events for Northline devices
      for (const act of northlineActivities) {
        if (act.device_id) {
          assert.ok(northlineSerials.has(act.device_serial), `Northline observed non-Northline serial: ${act.device_serial}`);
          assert.ok(!harborSerials.has(act.device_serial), `Northline leaked Harbor serial: ${act.device_serial}`);
        }
      }
    });

    test("2.4 Admin console sections strictly enforce role gates", () => {
      const adminRole = toAdminRole("admin");
      const manufacturerRole = toAdminRole("manufacturer");
      const userRole = toAdminRole("user");

      assert.equal(adminRole, "administrator");
      assert.equal(manufacturerRole, "manufacturer");
      assert.equal(userRole, null);

      // Check section role lists
      const adminOnlySections = ["customers", "manufacturers", "users"] as const;
      for (const sec of adminOnlySections) {
        assert.ok(adminSections[sec].roles?.includes("administrator"), `${sec} missing administrator`);
        assert.ok(!adminSections[sec].roles?.includes("manufacturer"), `${sec} must not allow manufacturer`);
      }

      const sharedSections = ["overview", "devices", "register", "operations", "journeys", "alerts", "files", "settings"] as const;
      for (const sec of sharedSections) {
        assert.ok(adminSections[sec].roles?.includes("administrator"), `${sec} missing administrator`);
        assert.ok(adminSections[sec].roles?.includes("manufacturer"), `${sec} missing manufacturer`);
      }
    });

    test("2.5 End-user role is blocked from calling overview APIs", async () => {
      const userApi = createTestService("user", 0);
      await assertApiError(() => userApi.getOverviewKpis(), 403, "required role is missing");
      await assertApiError(() => userApi.getRecentActivity(), 403, "required role is missing");
    });
  });

  // =========================================================================
  // Section 3: Trend Chart & Calendar Data Structures & Math
  // =========================================================================
  describe("3. Trend Chart & Calendar Data Structures & Math", () => {
    test("3.1 October 2026 calendar starts on Thursday with exactly 3 padding days", () => {
      // 2026-10-01 weekday verification:
      // JS getDay(): 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
      const oct1 = new Date(Date.UTC(2026, 9, 1));
      const dayOfWeek = oct1.getUTCDay(); // 4 = Thursday
      assert.equal(dayOfWeek, 4);

      // In MTWTFSS header: Mon=0, Tue=1, Wed=2, Thu=3.
      // So Thursday needs 3 empty slots before day 1.
      const days: Array<number | null> = [
        null,
        null,
        null,
        ...Array.from({ length: 31 }, (_, index) => index + 1),
      ];

      assert.equal(days[0], null);
      assert.equal(days[1], null);
      assert.equal(days[2], null);
      assert.equal(days[3], 1); // 1st is in column 4 (Thursday)
      assert.equal(days.length, 34); // 3 + 31
      assert.equal(days[33], 31); // 31st is in index 33 -> 33 % 7 = 5 (Saturday)
    });

    test("3.2 Claims calendar correctly isolates claimed dates by manufacturer scope", async () => {
      const adminApi = createTestService("admin", 0);
      const harborApi = createTestService("manufacturer", 1);
      const northlineApi = createTestService("manufacturer", 0);

      const adminDevices = (await adminApi.listDevices({ limit: 50 })).items;
      const harborDevices = (await harborApi.listDevices({ limit: 50 })).items;
      const northlineDevices = (await northlineApi.listDevices({ limit: 50 })).items;

      const extractClaimDates = (devices: Device[]) =>
        new Set(
          devices
            .map((d) => d.claimed_at?.slice(0, 10))
            .filter((date): date is string => Boolean(date)),
        );

      const adminClaims = extractClaimDates(adminDevices);
      const harborClaims = extractClaimDates(harborDevices);
      const northlineClaims = extractClaimDates(northlineDevices);

      assert.deepEqual(Array.from(adminClaims).sort(), [
        "2026-10-11",
        "2026-10-12",
        "2026-10-16",
        "2026-10-18",
      ]);

      // Harbor Goods only owns device 5 which was claimed on 2026-10-16
      assert.deepEqual(Array.from(harborClaims), ["2026-10-16"]);

      // Northline owns devices 0, 1, 7 which were claimed on 11, 12, 18
      assert.deepEqual(Array.from(northlineClaims).sort(), [
        "2026-10-11",
        "2026-10-12",
        "2026-10-18",
      ]);
    });

    test("3.3 Adversarial analysis of trend chart dual-series points scaling", () => {
      // Replicate the points() function from overview.tsx
      function points(values: number[], width = 560, height = 172) {
        const maximum = Math.max(...values, 1);
        const minimum = Math.min(...values, 0);
        const range = Math.max(maximum - minimum, 1);
        return values
          .map((value, index) => {
            const x = (index / Math.max(values.length - 1, 1)) * width;
            const y = height - ((value - minimum) / range) * (height - 28) - 14;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ");
      }

      const series4 = { registered: [9, 10, 11, 12], claimed: [6, 7, 7, 9] };

      const regPoints = points(series4.registered).split(" ");
      const claimedPoints = points(series4.claimed).split(" ");

      // Get last point (end of week 4)
      const lastRegY = regPoints[3].split(",")[1];
      const lastClaimedY = claimedPoints[3].split(",")[1];

      // EMPIRICAL FINDING: Both 12 and 9 scale to the identical top Y coordinate 14.0!
      // This is because each series normalizes to its own local maximum.
      assert.equal(lastRegY, "14.0");
      assert.equal(lastClaimedY, "14.0");
    });
  });

  // =========================================================================
  // Section 4: Degraded Scenarios & Error Resilience
  // =========================================================================
  describe("4. Degraded Scenarios & Error Resilience", () => {
    test("4.1 Unavailable scenario (503) rejects overview APIs cleanly", async () => {
      const api = createTestService("admin", 0, { failure: "unavailable" });
      await assertApiError(() => api.getOverviewKpis(), 503, "service temporarily unavailable");
      await assertApiError(() => api.getRecentActivity(), 503, "service temporarily unavailable");
    });

    test("4.2 Rate limit scenario (429) rejects overview APIs cleanly", async () => {
      const api = createTestService("admin", 0, { failure: "rate_limit" });
      await assertApiError(() => api.getOverviewKpis(), 429, "retry later");
      await assertApiError(() => api.getRecentActivity(), 429, "retry later");
    });

    test("4.3 Empty fleet scenario returns zero counts without division by zero or NaN", async () => {
      const api = createTestService("admin", 0, { empty: true });
      const kpis = await api.getOverviewKpis();
      assert.equal(kpis.totalFleet, 0);
      assert.equal(kpis.registeredBags, 0);
      assert.equal(kpis.unclaimedBags, 0);
      assert.equal(kpis.claimedBags, 0);
      assert.equal(kpis.revokedBags, 0);
      assert.equal(kpis.claimRate, 0);
      assert.equal(kpis.fleetHealth, 100);
      assert.equal(kpis.activeJourneys, 0);
      assert.equal(kpis.tamperAlerts, 0);

      const activities = await api.getRecentActivity();
      assert.deepEqual(activities, []);
    });
  });
});
