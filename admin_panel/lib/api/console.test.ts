import assert from "node:assert/strict";
import { test } from "node:test";
import { createMockApi, MockApiError, mockUserForRole } from "./index";
import {
  registrationErrors,
  validEmail,
  validPassword,
  fileError,
  FILE_LIMIT,
} from "./validation";
import {
  consoleDevices,
  consoleUsers,
  consoleFiles,
  consoleFileBodies,
  consoleAudits,
} from "../console-fixtures";
const options = {
  devices: consoleDevices,
  users: consoleUsers,
  files: consoleFiles,
  fileBodies: consoleFileBodies,
  audits: consoleAudits,
  advanceJobs: true,
};
const apiFor = (role: "admin" | "manufacturer" = "admin") =>
  createMockApi({
    ...options,
    actor: consoleUsers.find((u) => u.role === role)!,
  });
const input = {
  serial_number: "amt-test-1001",
  model: "Carry-On 55",
  firmware_version: "1.4.2",
  manufacturer_id: consoleUsers[1].id,
};
async function status(action: () => Promise<unknown>, expected: number) {
  await assert.rejects(
    action,
    (e: unknown) => e instanceof MockApiError && e.status === expected,
  );
}

test("source-backed serial and UTF-8 metadata validation rejects controls and boundaries", () => {
  assert.deepEqual(registrationErrors(input), {});
  for (const serial_number of [
    "short",
    "a".repeat(65),
    "AMT/1000",
    "AMT-é100",
    "AMT 1000",
  ])
    assert.ok(registrationErrors({ ...input, serial_number }).serial_number);
  assert.ok(registrationErrors({ ...input, model: "é".repeat(65) }).model);
  assert.ok(
    registrationErrors({ ...input, firmware_version: "1.\n0" })
      .firmware_version,
  );
  assert.ok(registrationErrors({ ...input, model: "" }).model);
  assert.equal(validEmail(" A@Example.invalid "), true);
  for (const email of [
    "a@localhost",
    "a@@b.invalid",
    "a b@x.invalid",
    "é@x.invalid",
    "@x.invalid",
  ])
    assert.equal(validEmail(email), false);
  assert.equal(validPassword("é".repeat(6)), true);
  assert.equal(validPassword("a".repeat(129)), false);
});

test("console fixture counts are deterministic while manufacturer visibility is scoped", async () => {
  const admin = apiFor(),
    m = apiFor("manufacturer");
  assert.equal((await admin.listDevices()).items.length, 8);
  assert.equal((await m.listDevices()).items.length, 6);
  assert.equal((await m.listFiles()).items.length, 3);
  await status(() => m.listUsers(), 403);
  await status(() => m.getDevice(consoleDevices[4].id), 404);
  await status(() => m.getFile(consoleFiles[3].id), 404);
  await status(() => m.downloadFile(consoleFiles[3].id), 404);
});

test("registration verifies manufacturer identity, normalized duplicates and immutable scope", async () => {
  const a = apiFor(),
    m = apiFor("manufacturer");
  await status(
    () => a.registerDevice({ ...input, manufacturer_id: consoleUsers[0].id }),
    400,
  );
  await status(
    () => m.registerDevice({ ...input, manufacturer_id: consoleUsers[2].id }),
    403,
  );
  const result = await m.registerDevice({
    ...input,
    manufacturer_id: undefined,
    serial_number: "  amt-test-1001  ",
  });
  assert.equal(result.device.serial_number, "AMT-TEST-1001");
  assert.equal(result.device.manufacturer_id, m.session.id);
  assert.equal(result.claim_code.length, 64);
  assert.equal(
    Object.hasOwn(await m.getDevice(result.device.id), "claim_code"),
    false,
  );
  await status(() => m.registerDevice(input), 409);
  assert.equal(
    (await m.listDeviceAudit(result.device.id)).items[0].action,
    "registered",
  );
});

test("editing and lifecycle produce audit rows and enforce unclaimed/revoked rules", async () => {
  const a = apiFor();
  const d = consoleDevices[2];
  await a.updateDevice(d.id, { model: "New model" });
  assert.equal((await a.getDevice(d.id)).model, "New model");
  assert.equal(
    (await a.listDeviceAudit(d.id)).items[0].action,
    "metadata_updated",
  );
  await status(() => a.updateDevice(d.id, { model: "" }), 400);
  await status(() => a.updateDevice(d.id, { model: null }), 400);
  await a.rotateClaimCode(d.id);
  assert.equal(
    (await a.listDeviceAudit(d.id)).items[0].action,
    "claim_code_rotated",
  );
  await status(() => a.rotateClaimCode(consoleDevices[0].id), 409);
  await a.revokeDevice(d.id);
  await status(() => a.updateDevice(d.id, { model: "No" }), 409);
  await status(() => a.rotateClaimCode(d.id), 409);
  const count = (await a.listDeviceAudit(d.id)).items.length;
  await a.revokeDevice(d.id);
  assert.equal((await a.listDeviceAudit(d.id)).items.length, count);
});

test("self and mobile role boundaries apply in both directions", async () => {
  const a = apiFor();
  await status(() => a.updateRole(a.session.id, { role: "manufacturer" }), 400);
  await status(() => a.updateRole(consoleUsers[4].id, { role: "admin" }), 400);
  await status(() => a.updateRole(consoleUsers[1].id, { role: "user" }), 400);
  assert.equal(
    (await a.updateRole(consoleUsers[1].id, { role: "admin" })).role,
    "admin",
  );
});

test("manufacturer jobs are pending before completion, receipt scoped, and duplicates fail", async () => {
  const a = apiFor();
  const j = await a.createManufacturer({
    email: "new@factory.example.invalid",
    password: "fictional-demo-password",
  });
  assert.ok(j.poll_after_ms > 0);
  await status(() => a.getJob(j.job_id, "wrong"), 404);
  assert.equal((await a.getJob(j.job_id, j.receipt)).status, "processing");
  assert.equal(
    (await a.listUsers()).items.some(
      (u) => u.email === "new@factory.example.invalid",
    ),
    false,
  );
  const done = await a.getJob(j.job_id, j.receipt);
  assert.equal(done.http_status, 201);
  assert.equal(
    (await a.listUsers()).items.some(
      (u) => u.email === "new@factory.example.invalid",
    ),
    true,
  );
  const duplicate = await a.createManufacturer({
    email: "new@factory.example.invalid",
    password: "fictional-demo-password",
  });
  await status(() => a.getJob(duplicate.job_id, j.receipt), 404);
  await a.getJob(duplicate.job_id, duplicate.receipt);
  assert.equal(
    (await a.getJob(duplicate.job_id, duplicate.receipt)).http_status,
    409,
  );
});

test("raw file validation follows filename, MIME and byte bounds", () => {
  assert.equal(
    fileError("valid.bin", "application/octet-stream", FILE_LIMIT),
    null,
  );
  assert.ok(fileError("empty.txt", "text/plain", 0));
  assert.ok(fileError("big.txt", "text/plain", FILE_LIMIT + 1));
  for (const name of ["../escape", ".", "..", "bad/name", "é.txt"])
    assert.ok(fileError(name, "text/plain", 1));
  assert.ok(fileError("bad.html", "text/html", 1));
  assert.equal(fileError("unknown.bin", "", 1), null);
});

test("file bytes are copied, scoped and never expose inaccessible records", async () => {
  const a = apiFor(),
    m = apiFor("manufacturer");
  const source = new Uint8Array([65, 66, 67]);
  const f = await m.uploadFile("demo.txt", "text/plain", source);
  source[0] = 90;
  assert.deepEqual(await m.downloadFile(f.id), new Uint8Array([65, 66, 67]));
  assert.equal(f.owner_id, m.session.id);
  await status(() => a.getFile(f.id), 404);
  await status(
    () => m.uploadFile("bad.html", "text/html", new Uint8Array([1])),
    400,
  );
  await status(
    () =>
      m.uploadFile(
        "too-big.bin",
        "application/octet-stream",
        new Uint8Array(FILE_LIMIT + 1),
      ),
    413,
  );
  await status(
    () =>
      createMockApi({ actor: mockUserForRole("user") }).uploadFile(
        "x.txt",
        "text/plain",
        new Uint8Array([1]),
      ),
    403,
  );
  const body = await m.downloadFile(consoleFiles[0].id);
  assert.match(new TextDecoder().decode(body), /EXAMPLE ONLY/);
});
