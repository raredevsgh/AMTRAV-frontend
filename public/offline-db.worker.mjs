// Dedicated worker owning the console's local SQLite database.
// Storage: the OPFS "SAH pool" VFS, which persists in the browser's origin-private file
// system without cross-origin isolation headers. If OPFS is unavailable (older browser,
// another tab holds the database), it falls back to an in-memory database for this tab.
import sqlite3InitModule from "./sqlite/index.mjs";
import { SCHEMA } from "./offline-schema.mjs";


let db;
let persistent = false;

const ready = (async () => {
  const sqlite3 = await sqlite3InitModule({ print: () => {}, printErr: () => {} });
  try {
    const pool = await sqlite3.installOpfsSAHPoolVfs({
      name: "amortrav-console",
      directory: ".amortrav-console",
      initialCapacity: 6,
    });
    db = new pool.OpfsSAHPoolDb("/console.sqlite3");
    persistent = true;
  } catch {
    db = new sqlite3.oo1.DB(":memory:", "c");
  }
  db.exec(SCHEMA);
})();

self.onmessage = async ({ data }) => {
  const { id, op, sql, bind } = data;
  try {
    await ready;
    if (op === "info") {
      self.postMessage({ id, result: { persistent } });
    } else if (op === "wipe") {
      // secure_delete overwrites removed content; VACUUM shrinks the file afterwards.
      db.exec("DELETE FROM query_cache; DELETE FROM outbox; DELETE FROM meta; VACUUM;");
      self.postMessage({ id, result: null });
    } else {
      const rows = db.exec({ sql, bind, rowMode: "object", returnValue: "resultRows" });
      self.postMessage({ id, result: rows });
    }
  } catch (error) {
    self.postMessage({ id, error: String(error?.message || error) });
  }
};
