// What the console keeps in local SQLite, and the offline edit outbox.
//
// Stored: registry data the signed-in staff member can already read (session profile,
// devices, batches, staff list, device audit) and, for admins, the security audit trail.
// Never stored: tokens (HttpOnly cookies), claim codes, locations, MFA or session data,
// files. Everything is scoped to one account and wiped on sign-out.
import type { QueryKey } from "@tanstack/react-query";
import type { LocalDb } from "./db";
import type { User } from "@/lib/console/types";

export const CACHED_QUERIES = new Set([
  "session",
  "devices",
  "device",
  "audit",
  "batches",
  "batch",
  "batch-devices",
  "users",
  "security-events",
]);

/** Live, non-preview queries from the allowlist. Preview keys end in `true`. */
export function cacheable(key: QueryKey) {
  return typeof key[0] === "string" && CACHED_QUERIES.has(key[0]) && !key.includes(true);
}

export async function saveQuery(
  db: LocalDb,
  owner: string,
  key: QueryKey,
  data: unknown,
  updatedAt: number,
) {
  if (!cacheable(key) || data === undefined) return;
  await db.query(
    `INSERT INTO query_cache (owner, key, value, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (owner, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [owner, JSON.stringify(key), JSON.stringify(data), updatedAt],
  );
}

export async function loadQueries(db: LocalDb, owner: string) {
  const rows = await db.query(
    "SELECT key, value, updated_at FROM query_cache WHERE owner = ?",
    [owner],
  );
  return rows.flatMap((row) => {
    try {
      const key = JSON.parse(String(row.key)) as QueryKey;
      return cacheable(key)
        ? [
            {
              key,
              data: JSON.parse(String(row.value)),
              updatedAt: Number(row.updated_at),
            },
          ]
        : [];
    } catch {
      return [];
    }
  });
}

/** Records who the local data belongs to; a different account starts from nothing. */
export async function rememberUser(db: LocalDb, user: User) {
  const [current] = await db.query("SELECT value FROM meta WHERE key = 'owner'");
  if (current && current.value !== user.id) await db.wipe();
  await db.query(
    `INSERT INTO meta (key, value) VALUES ('owner', ?), ('user', ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    [user.id, JSON.stringify(user)],
  );
}

export async function restoreUser(db: LocalDb): Promise<User | null> {
  const [row] = await db.query("SELECT value FROM meta WHERE key = 'user'");
  try {
    return row ? (JSON.parse(String(row.value)) as User) : null;
  } catch {
    return null;
  }
}

export interface DeviceEdit {
  device_id: string;
  serial_number: string;
  values: { model: string; firmware_version: string };
  /** The device version the edit was made against; the server refuses stale edits. */
  expected_updated_at: string;
}

export type QueuedEdit = DeviceEdit & {
  id: number;
  attempts: number;
  last_error: string | null;
};

/** Queues a device edit. A second edit to the same device replaces the values but keeps
 *  the original version guard, so it still cannot overwrite someone else's change. */
export async function enqueueEdit(db: LocalDb, owner: string, edit: DeviceEdit) {
  const [existing] = await db.query(
    "SELECT body FROM outbox WHERE owner = ? AND kind = 'device-edit' AND target = ?",
    [owner, edit.device_id],
  );
  const guard = existing
    ? (JSON.parse(String(existing.body)) as DeviceEdit).expected_updated_at
    : edit.expected_updated_at;
  await db.query(
    `INSERT INTO outbox (owner, kind, target, body, created_at) VALUES (?, 'device-edit', ?, ?, ?)
     ON CONFLICT (owner, kind, target) DO UPDATE SET body = excluded.body, last_error = NULL`,
    [
      owner,
      edit.device_id,
      JSON.stringify({ ...edit, expected_updated_at: guard }),
      Date.now(),
    ],
  );
}

export async function listOutbox(db: LocalDb, owner: string): Promise<QueuedEdit[]> {
  const rows = await db.query(
    "SELECT id, body, attempts, last_error FROM outbox WHERE owner = ? ORDER BY created_at, id",
    [owner],
  );
  return rows.map((row) => ({
    ...(JSON.parse(String(row.body)) as DeviceEdit),
    id: Number(row.id),
    attempts: Number(row.attempts),
    last_error: row.last_error === null ? null : String(row.last_error),
  }));
}

export type SendResult =
  | { status: "done" }
  | { status: "rejected"; message: string }
  | { status: "retry"; message: string }
  | { status: "stop" };

/** Replays queued edits in order. Rejected edits are dropped and reported; transient
 *  failures stay queued; "stop" (signed out) leaves everything for later. */
export async function flushOutbox(
  db: LocalDb,
  owner: string,
  send: (edit: QueuedEdit) => Promise<SendResult>,
) {
  const rejected: { edit: QueuedEdit; message: string }[] = [];
  let synced = 0;
  for (const edit of await listOutbox(db, owner)) {
    const result = await send(edit);
    if (result.status === "stop") break;
    if (result.status === "retry") {
      await db.query(
        "UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?",
        [result.message, edit.id],
      );
      break;
    }
    await db.query("DELETE FROM outbox WHERE id = ?", [edit.id]);
    if (result.status === "rejected") rejected.push({ edit, message: result.message });
    else synced += 1;
  }
  return { synced, rejected };
}
