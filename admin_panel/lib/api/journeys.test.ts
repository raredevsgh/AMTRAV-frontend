import test from "node:test";
import assert from "node:assert/strict";
import { createMockApi, mockUserForRole } from "./mock-service";

test("M3-JOURNEYS-01: listJourneys returns paginated journeys with default filters", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const result = await api.listJourneys({ page: 1, pageSize: 5 });

  assert.ok(result.items.length > 0);
  assert.ok(result.items.length <= 5);
  assert.equal(result.limit, 5);
  assert.equal(result.offset, 0);

  const first = result.items[0];
  assert.ok(first.id);
  assert.ok(first.trackingNumber);
  assert.ok(first.status);
  assert.ok(first.flightNumber);
  assert.ok(first.originCode);
  assert.ok(first.destinationCode);
});

test("M3-JOURNEYS-02: listJourneys filters by status and airport", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const inTransit = await api.listJourneys({ status: "in_transit" });
  assert.ok(inTransit.items.every((j) => j.status === "in_transit"));

  const arrived = await api.listJourneys({ status: "arrived" });
  assert.ok(arrived.items.every((j) => j.status === "arrived"));

  const sfo = await api.listJourneys({ origin: "SFO" });
  assert.ok(sfo.items.every((j) => j.originCode === "SFO"));
});

test("M3-JOURNEYS-03: listJourneys filters by search query", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const searchResult = await api.listJourneys({ search: "Cooper" });
  assert.ok(searchResult.items.length > 0);
  assert.ok(
    searchResult.items.some((j) => j.travelerName.includes("Cooper")),
  );
});

test("M3-JOURNEYS-04: getJourneyById returns full details including checkpoints and legs", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const list = await api.listJourneys();
  const firstId = list.items[0].id;

  const detail = await api.getJourneyById(firstId);
  assert.equal(detail.id, firstId);
  assert.ok(Array.isArray(detail.flightLegs));
  assert.ok(Array.isArray(detail.checkpoints));
  assert.ok(detail.assignedDevice);
  assert.ok(detail.traveler);
});

test("M3-JOURNEYS-05: addJourneyCheckpoint adds checkpoint and updates lastScanTime", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const list = await api.listJourneys();
  const journeyId = list.items[0].id;

  const newCheckpoint = await api.addJourneyCheckpoint(journeyId, {
    journeyId,
    type: "sorting_facility",
    title: "Transfer Facility Induction",
    description: "Bag inducted into secondary hub automated sort line.",
    location: "Transfer Hub Ramp",
    airportCode: "ORD",
    timestamp: "2026-10-24T10:15:00Z",
    status: "completed",
    scannerId: "ORD-HUB-SCN-01",
  });

  assert.ok(newCheckpoint.id);
  assert.equal(newCheckpoint.title, "Transfer Facility Induction");

  const updated = await api.getJourneyById(journeyId);
  assert.equal(updated.lastScanTime, "2026-10-24T10:15:00Z");
  assert.ok(updated.checkpoints.some((c) => c.id === newCheckpoint.id));
});

test("M3-JOURNEYS-06: manufacturer role scoping isolates journeys to own devices", async () => {
  const adminApi = createMockApi({ actor: mockUserForRole("admin") });
  const adminList = await adminApi.listJourneys();

  const mfgUser = {
    id: "00000000-0000-4000-8000-000000000002",
    email: "mfg@example.invalid",
    role: "manufacturer" as const,
    email_verified: true,
    created_at: "2026-01-01T00:00:00Z",
  };
  const mfgApi = createMockApi({ actor: mfgUser });
  const mfgList = await mfgApi.listJourneys();

  assert.ok(mfgList.items.length <= adminList.items.length);
  for (const item of mfgList.items) {
    assert.equal(item.manufacturerId, mfgUser.id);
  }
});

test("M3-JOURNEYS-07: non-staff user role is rejected with 403 Forbidden", async () => {
  const userApi = createMockApi({ actor: mockUserForRole("user") });
  await assert.rejects(async () => {
    await userApi.listJourneys();
  }, /required role is missing/);
});
