import { beforeEach, describe, expect, it } from "vitest";
// The Node build of the same SQLite engine the browser worker uses.
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { SCHEMA } from "../public/offline-schema.mjs";
import type { LocalDb, Row } from "@/lib/offline/db";
import {
  cacheable,
  enqueueEdit,
  flushOutbox,
  listOutbox,
  loadQueries,
  rememberUser,
  restoreUser,
  saveQuery,
} from "@/lib/offline/store";
import type { User } from "@/lib/console/types";

let db: LocalDb;

beforeEach(async () => {
  const sqlite3 = await sqlite3InitModule();
  const raw = new sqlite3.oo1.DB(":memory:", "c");
  raw.exec(SCHEMA);
  db = {
    query: async (sql, bind = []) =>
      raw.exec({
        sql,
        bind: bind as never,
        rowMode: "object",
        returnValue: "resultRows",
      }) as Row[],
    wipe: async () => {
      raw.exec("DELETE FROM query_cache; DELETE FROM outbox; DELETE FROM meta;");
    },
    persistent: async () => false,
  };
});

const user = (id: string): User => ({
  id,
  email: `${id}@example.test`,
  email_verified: true,
  role: "manufacturer",
  created_at: "2026-10-01T00:00:00Z",
});
const edit = (device: string, firmware: string, guard: string) => ({
  device_id: device,
  serial_number: `SER-${device}`,
  values: { model: "Core", firmware_version: firmware },
  expected_updated_at: guard,
});

describe("local query cache", () => {
  it("stores only allowlisted, non-preview registry data", async () => {
    expect(cacheable(["devices", "u1", false])).toBe(true);
    expect(cacheable(["security-events", "u1", false])).toBe(true);
    expect(cacheable(["devices", "u1", true])).toBe(false);
    for (const key of ["mfa", "sessions", "files", "manufacturer-job", "locations"])
      expect(cacheable([key, "u1", false])).toBe(false);
    await saveQuery(db, "u1", ["mfa", "u1", false], { secret: true }, 1);
    await saveQuery(db, "u1", ["devices", "u1", false], [{ id: "d1" }], 2);
    expect(await loadQueries(db, "u1")).toEqual([
      { key: ["devices", "u1", false], data: [{ id: "d1" }], updatedAt: 2 },
    ]);
  });

  it("never shows one account's data to another", async () => {
    await rememberUser(db, user("u1"));
    await saveQuery(db, "u1", ["devices", "u1", false], [{ id: "d1" }], 1);
    await enqueueEdit(db, "u1", edit("d1", "2.0", "t0"));
    await rememberUser(db, user("u2"));
    expect(await loadQueries(db, "u1")).toEqual([]);
    expect(await listOutbox(db, "u1")).toEqual([]);
    expect((await restoreUser(db))?.id).toBe("u2");
  });
});

describe("offline edit outbox", () => {
  it("coalesces edits but keeps the original version guard", async () => {
    await enqueueEdit(db, "u1", edit("d1", "2.0", "t0"));
    await enqueueEdit(db, "u1", edit("d1", "2.1", "t1"));
    const [queued, ...rest] = await listOutbox(db, "u1");
    expect(rest).toEqual([]);
    expect(queued.values.firmware_version).toBe("2.1");
    expect(queued.expected_updated_at).toBe("t0");
  });

  it("drops synced and rejected edits, keeps transient failures in order", async () => {
    for (const device of ["a", "b", "c"])
      await enqueueEdit(db, "u1", edit(device, "2", "t"));
    const outcomes = {
      a: { status: "done" },
      b: { status: "rejected", message: "device changed" },
      c: { status: "retry", message: "Server unreachable" },
    } as const;
    const result = await flushOutbox(db, "u1", async (e) => outcomes[e.device_id as "a"]);
    expect(result.synced).toBe(1);
    expect(result.rejected.map((r) => r.message)).toEqual(["device changed"]);
    const [left] = await listOutbox(db, "u1");
    expect([left.device_id, left.attempts, left.last_error]).toEqual([
      "c",
      1,
      "Server unreachable",
    ]);
  });

  it("stops without dropping anything when the session has ended", async () => {
    await enqueueEdit(db, "u1", edit("a", "2", "t"));
    await flushOutbox(db, "u1", async () => ({ status: "stop" }));
    expect(await listOutbox(db, "u1")).toHaveLength(1);
  });
});
