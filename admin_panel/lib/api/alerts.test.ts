import test from "node:test";
import assert from "node:assert/strict";
import { createMockApi, mockUserForRole } from "./mock-service";

test("M5-ALERTS-01: listAlerts returns paginated alerts", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const result = await api.listAlerts({ page: 1, pageSize: 5 });

  assert.ok(result.items.length > 0);
  assert.ok(result.items.length <= 5);
  assert.equal(result.limit, 5);
  assert.equal(result.offset, 0);

  const alert = result.items[0];
  assert.ok(alert.id);
  assert.ok(alert.title);
  assert.ok(alert.severity);
  assert.ok(alert.status);
  assert.ok(alert.category);
});

test("M5-ALERTS-02: listAlerts filters by severity and category", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const critical = await api.listAlerts({ severity: "critical" });
  assert.ok(critical.items.every((a) => a.severity === "critical"));

  const tamper = await api.listAlerts({ category: "tamper" });
  assert.ok(tamper.items.every((a) => a.category === "tamper"));
});

test("M5-ALERTS-03: acknowledgeAlert changes status to acknowledged", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const list = await api.listAlerts({ status: "active" });
  assert.ok(list.items.length > 0);

  const alertId = list.items[0].id;
  const acknowledged = await api.acknowledgeAlert(alertId);

  assert.equal(acknowledged.status, "acknowledged");
  assert.ok(acknowledged.resolvedBy);
});

test("M5-ALERTS-04: resolveAlert records resolution notes and timestamps", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const list = await api.listAlerts({ status: "active" });
  const alertId = list.items[0].id;

  const resolved = await api.resolveAlert(alertId, {
    resolutionAction: "inspected_safe",
    notes: "Physical inspection showed lock mechanism fully intact. Verified false alarm.",
  });

  assert.equal(resolved.status, "resolved");
  assert.ok(resolved.resolvedAt);
  assert.ok(resolved.resolutionNotes?.includes("inspected_safe"));
});

test("M5-ALERTS-05: non-staff roles are rejected with 403 Forbidden", async () => {
  const userApi = createMockApi({ actor: mockUserForRole("user") });
  await assert.rejects(async () => {
    await userApi.listAlerts();
  }, /required role is missing/);
});
