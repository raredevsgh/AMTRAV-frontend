import test from "node:test";
import assert from "node:assert/strict";
import { createMockApi, mockUserForRole } from "./mock-service";

test("M4-CUSTOMERS-01: listCustomers returns customer records with default pagination", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const result = await api.listCustomers({ page: 1, pageSize: 5 });

  assert.ok(result.items.length > 0);
  assert.ok(result.items.length <= 5);
  assert.equal(result.limit, 5);
  assert.equal(result.offset, 0);

  const customer = result.items[0];
  assert.ok(customer.id);
  assert.ok(customer.name);
  assert.ok(customer.email);
  assert.ok(customer.membershipTier);
  assert.ok(typeof customer.totalTrips === "number");
});

test("M4-CUSTOMERS-02: listCustomers filters by membership tier and search query", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const goldCustomers = await api.listCustomers({ membershipTier: "gold" });
  assert.ok(goldCustomers.items.every((c) => c.membershipTier === "gold"));

  const searchResult = await api.listCustomers({ search: "Cooper" });
  assert.ok(searchResult.items.some((c) => c.name.includes("Cooper")));
});

test("M4-CUSTOMERS-03: getCustomerById returns customer profile with linked devices and journeys", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const list = await api.listCustomers();
  const customerId = list.items[0].id;

  const detail = await api.getCustomerById(customerId);
  assert.equal(detail.id, customerId);
  assert.ok(Array.isArray(detail.devices));
  assert.ok(Array.isArray(detail.recentJourneys));
  assert.ok(Array.isArray(detail.supportNotes));
});

test("M4-CUSTOMERS-04: updateCustomerNotes appends note to customer profile", async () => {
  const api = createMockApi({ actor: mockUserForRole("admin") });
  const list = await api.listCustomers();
  const customerId = list.items[0].id;

  const initial = await api.getCustomerById(customerId);
  const initialCount = initial.supportNotes.length;

  const updated = await api.updateCustomerNotes(customerId, "Customer requested gold bag tag replacement.");
  assert.equal(updated.supportNotes.length, initialCount + 1);
  assert.ok(updated.supportNotes.includes("Customer requested gold bag tag replacement."));
});

test("M4-CUSTOMERS-05: non-admin roles are rejected with 403 Forbidden", async () => {
  const mfgApi = createMockApi({ actor: mockUserForRole("manufacturer") });
  await assert.rejects(async () => {
    await mfgApi.listCustomers();
  }, /admin role required/);

  await assert.rejects(async () => {
    await mfgApi.getCustomerById("usr-00000000-0000-4000-8000-000000000001");
  }, /admin role required/);
});
