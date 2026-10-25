import assert from "node:assert/strict";
import { test } from "node:test";
import { MockApiError, createMockApi, mockError, mockUserForRole } from "./index";
import { MOCK_IDS, mockCredentials, mockErrors, mockProvisionedDevice } from "./fixtures";

async function assertApiError(action: () => Promise<unknown>, status: number, message: string) {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof MockApiError);
    assert.equal(error.status, status);
    assert.equal(error.body.error, message);
    return true;
  });
}

test("fixtures expose source-shaped snake_case DTOs without secrets from the backend", () => {
  const serialized = JSON.stringify(mockProvisionedDevice);
  assert.match(serialized, /claim_code/);
  assert.doesNotMatch(serialized, /claimCode|manufacturerId|createdAt/);
  assert.equal(mockProvisionedDevice.device.status, "registered");
  assert.equal(mockProvisionedDevice.device.owner_id, null);
});

test("pagination is deterministic, bounded, stable, and does not invent totals", async () => {
  const api = createMockApi();
  const first = await api.listDevices({ limit: 1, offset: 0 });
  const middle = await api.listDevices({ limit: 1, offset: 1 });
  const last = await api.listDevices({ limit: 1, offset: 2 });
  const empty = await api.listDevices({ limit: 1, offset: 3 });
  const repeated = await api.listDevices({ limit: 1, offset: 1 });

  assert.equal(first.items.length, 1);
  assert.equal(last.items.length, 1);
  assert.equal(empty.items.length, 0);
  assert.notEqual(first.items[0]?.id, middle.items[0]?.id);
  assert.notEqual(middle.items[0]?.id, last.items[0]?.id);
  assert.deepEqual(repeated, middle);
  assert.equal(Object.hasOwn(first, "total"), false);
  assert.equal((await api.listDevices({ limit: 1000, offset: -10 })).items.length, 3);
});

test("pagination rejects non-integer parameters with the API error shape", async () => {
  await assertApiError(
    () => createMockApi().listDevices({ limit: 1.5 }),
    400,
    "limit and offset must be integers",
  );
});

test("role-aware visibility matches the backend authorization model", async () => {
  const administrator = createMockApi({ actor: mockUserForRole("admin") });
  const manufacturer = createMockApi({ actor: mockUserForRole("manufacturer") });
  const user = createMockApi({ actor: mockUserForRole("user") });

  assert.equal((await administrator.listDevices()).items.length, 3);
  assert.equal((await manufacturer.listDevices()).items.length, 3);
  assert.deepEqual(
    (await user.listDevices()).items.map((device) => device.id),
    [MOCK_IDS.deviceClaimed],
  );
  assert.equal((await administrator.listUsers()).items.length, 3);
  await assertApiError(() => manufacturer.listUsers(), 403, "admin role required");
  await assertApiError(() => user.listUsers(), 403, "admin role required");
  assert.equal((await manufacturer.listFiles()).items.length, 1);
  assert.equal((await user.listFiles()).items.length, 0);
});

test("device scenarios return typed success and conflict/not-found outcomes", async () => {
  const manufacturer = createMockApi({ actor: mockUserForRole("manufacturer") });
  const admin = createMockApi({ actor: mockUserForRole("admin") });

  const registered = await manufacturer.registerDevice({
    serial_number: "amtrav-new-0004",
    model: "AMTRAV Test Case",
    firmware_version: "0.1.0",
  });
  assert.equal(registered.device.serial_number, "AMTRAV-NEW-0004");
  assert.equal(registered.device.status, "registered");
  await assertApiError(
    () => manufacturer.registerDevice({
      serial_number: "AMTRAV-REG-0001",
      model: "Duplicate",
      firmware_version: "0.1.0",
    }),
    409,
    "device serial number already exists",
  );
  await assertApiError(() => admin.getDevice("unknown-device"), 404, "device not found");
  await assertApiError(() => manufacturer.updateDevice(MOCK_IDS.deviceRevoked, { model: "New" }), 409, "device is revoked");
});

test("role updates, jobs, and manufacturer access preserve the API envelopes", async () => {
  const admin = createMockApi({ actor: mockUserForRole("admin") });
  const manufacturer = createMockApi({ actor: mockUserForRole("manufacturer") });

  const receipt = await admin.createManufacturer({
    ...mockCredentials,
    email: "new-manufacturer@example.invalid",
  });
  assert.equal(receipt.job_id, "40000000-0000-4000-8000-000000000001");
  assert.equal((await admin.getJob(receipt.job_id, receipt.receipt)).status, "queued");
  assert.equal((await admin.getJob("40000000-0000-4000-8000-000000000002", "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")).http_status, 201);
  await assertApiError(() => admin.getJob(receipt.job_id, "wrong-receipt"), 404, "job not found");
  await assertApiError(
    () => admin.createManufacturer({ email: "invalid", password: "short" }),
    400,
    "invalid manufacturer credentials",
  );
  assert.equal((await manufacturer.manufacturerAccess()).message, "manufacturer access granted");
  await assertApiError(() => createMockApi({ actor: mockUserForRole("user") }).manufacturerAccess(), 403, "required role is missing");

  const changed = await admin.updateRole(MOCK_IDS.manufacturer, { role: "admin" });
  assert.equal(changed.role, "admin");
  await assertApiError(() => admin.updateRole(MOCK_IDS.user, { role: "admin" }), 400, "role is incompatible with the account sign-in method");
});

test("mock failures and error fixtures cover the documented status envelope", async () => {
  assert.deepEqual(mockError.badRequest().body, mockErrors[400]);
  assert.deepEqual(mockError.unauthorized().body, mockErrors[401]);
  assert.deepEqual(mockError.forbidden().body, mockErrors[403]);
  assert.deepEqual(mockError.notFound().body, mockErrors[404]);
  assert.deepEqual(mockError.conflict().body, mockErrors[409]);
  assert.deepEqual(mockError.invalidBody().body, mockErrors[422]);
  assert.deepEqual(mockError.rateLimited().body, mockErrors[429]);
  assert.equal(mockError.rateLimited().retryAfterSeconds, 1);
  assert.deepEqual(mockError.unavailable().body, mockErrors[503]);
  await assertApiError(() => createMockApi({ failure: "rate_limit" }).listDevices(), 429, "retry later");
  await assertApiError(() => createMockApi({ failure: "unavailable" }).listDevices(), 503, "service temporarily unavailable");
});

test("service instances and returned values do not share mutable fixture state", async () => {
  const first = createMockApi({ actor: mockUserForRole("manufacturer") });
  const second = createMockApi({ actor: mockUserForRole("manufacturer") });
  const page = await first.listDevices({ limit: 1 });
  page.items[0]!.model = "mutated only in test result";
  assert.notEqual((await first.getDevice(MOCK_IDS.deviceRegistered)).model, "mutated only in test result");
  await first.registerDevice({ serial_number: "AMTRAV-LOCAL-0005", model: "Local", firmware_version: "0.0.1" });
  assert.equal((await first.listDevices()).items.length, 4);
  assert.equal((await second.listDevices()).items.length, 3);
});
