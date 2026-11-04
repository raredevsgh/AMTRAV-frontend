// Promise wrapper around the SQLite worker in public/offline-db.worker.mjs.

export type Row = Record<string, unknown>;

export interface LocalDb {
  query(sql: string, bind?: unknown[]): Promise<Row[]>;
  wipe(): Promise<void>;
  /** True when data survives a reload (OPFS); false for the in-memory fallback. */
  persistent(): Promise<boolean>;
}

type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void };

let instance: LocalDb | null = null;

function connect(): LocalDb {
  const worker = new Worker("/offline-db.worker.mjs", { type: "module" });
  const pending = new Map<number, Pending>();
  let next = 0;
  let broken: Error | null = null;
  worker.onmessage = ({ data }) => {
    const call = pending.get(data.id);
    if (!call) return;
    pending.delete(data.id);
    if (data.error) call.reject(new Error(data.error));
    else call.resolve(data.result);
  };
  worker.onerror = (event) => {
    broken = new Error(event.message || "Local database unavailable");
    for (const call of pending.values()) call.reject(broken);
    pending.clear();
  };
  const send = <T>(message: Record<string, unknown>) =>
    new Promise<T>((resolve, reject) => {
      if (broken) return reject(broken);
      const id = ++next;
      pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      worker.postMessage({ id, ...message });
      // Never let a stuck worker hang the console.
      setTimeout(() => {
        if (pending.delete(id)) reject(new Error("Local database timed out"));
      }, 10_000);
    });
  return {
    query: (sql, bind = []) => send<Row[]>({ op: "query", sql, bind }),
    wipe: () => send<void>({ op: "wipe" }),
    persistent: () =>
      send<{ persistent: boolean }>({ op: "info" }).then((info) => info.persistent),
  };
}

/** The shared local database, or null where workers are unavailable (server, tests). */
export function localDb(): LocalDb | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  instance ??= connect();
  return instance;
}
