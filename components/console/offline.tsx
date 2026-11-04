"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { onlineManager, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { api, ApiError } from "@/lib/console/api";
import type { Device, User } from "@/lib/console/types";
import { localDb } from "@/lib/offline/db";
import {
  enqueueEdit,
  flushOutbox,
  listOutbox,
  loadQueries,
  rememberUser,
  restoreUser,
  saveQuery,
  type DeviceEdit,
  type QueuedEdit,
  type SendResult,
} from "@/lib/offline/store";

export function useOnline() {
  return useSyncExternalStore(
    onlineManager.subscribe.bind(onlineManager),
    () => onlineManager.isOnline(),
    () => true,
  );
}

/** Wipes everything this browser stored for the console (sign-out, revoked session). */
export async function wipeLocalData(client?: QueryClient) {
  client?.clear();
  await localDb()
    ?.wipe()
    .catch(() => {});
}

/** Before the session check: show the last signed-in account's saved data at once. */
export async function restoreSavedWorkspace(client: QueryClient) {
  const db = localDb();
  if (!db) return;
  try {
    const user = await restoreUser(db);
    if (!user) return;
    for (const { key, data, updatedAt } of await loadQueries(db, user.id)) {
      if (client.getQueryData(key) === undefined)
        client.setQueryData(key, data, { updatedAt });
    }
  } catch {
    // A missing or locked local database only means no offline data.
  }
}

const OfflineContext = createContext<{
  queued: QueuedEdit[];
  syncing: boolean;
  rejected: string[];
  persistent: boolean;
  savedAt: number | null;
  queueDeviceEdit: (edit: DeviceEdit) => Promise<void>;
  dismissRejected: () => void;
} | null>(null);

const previewContext = {
  queued: [],
  syncing: false,
  rejected: [],
  persistent: false,
  savedAt: null,
  queueDeviceEdit: async () => {
    throw new ApiError("Sign in to make changes.", 0);
  },
  dismissRejected: () => {},
};

/** Design previews have no local database; they get an empty, read-only context. */
export function useOffline() {
  return useContext(OfflineContext) ?? previewContext;
}

async function sendEdit(edit: QueuedEdit): Promise<SendResult> {
  try {
    await api<Device>(`devices/${edit.device_id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...edit.values,
        expected_updated_at: edit.expected_updated_at,
      }),
    });
    return { status: "done" };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status === 0 || error.status >= 500)
      return { status: "retry", message: "Server unreachable" };
    if (error.status === 401) return { status: "stop" };
    if (error.status === 429) return { status: "retry", message: error.message };
    return { status: "rejected", message: error.message };
  }
}

export function OfflineProvider({ user, children }: { user: User; children: ReactNode }) {
  const client = useQueryClient();
  const online = useOnline();
  const [queued, setQueued] = useState<QueuedEdit[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const [persistent, setPersistent] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const flushing = useRef(false);

  const refresh = useCallback(async () => {
    const db = localDb();
    if (db) setQueued(await listOutbox(db, user.id).catch(() => []));
  }, [user.id]);

  // Persist allowlisted query results as they arrive, scoped to this account.
  useEffect(() => {
    const db = localDb();
    if (!db) return;
    let active = true;
    rememberUser(db, user)
      .then(() => db.persistent())
      .then((value) => active && setPersistent(value))
      .then(refresh)
      .catch(() => {});
    const save = (key: readonly unknown[], data: unknown, updatedAt: number) =>
      saveQuery(db, user.id, key, data, updatedAt)
        .then(() => active && setSavedAt(updatedAt))
        .catch(() => {});
    for (const query of client.getQueryCache().getAll())
      if (query.state.status === "success")
        save(query.queryKey, query.state.data, query.state.dataUpdatedAt);
    const unsubscribe = client.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "success")
        save(
          event.query.queryKey,
          event.query.state.data,
          event.query.state.dataUpdatedAt,
        );
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [client, user, refresh]);

  const flush = useCallback(async () => {
    const db = localDb();
    if (!db || flushing.current || !onlineManager.isOnline()) return;
    flushing.current = true;
    setSyncing(true);
    try {
      const result = await flushOutbox(db, user.id, sendEdit);
      if (result.rejected.length)
        setRejected((current) => [
          ...current,
          ...result.rejected.map(
            ({ edit, message }) =>
              `${edit.serial_number}: ${message.replace(/\.?$/, ".")} The change was undone.`,
          ),
        ]);
      if (result.synced || result.rejected.length) {
        client.invalidateQueries({ queryKey: ["devices"] });
        client.invalidateQueries({ queryKey: ["device"] });
        client.invalidateQueries({ queryKey: ["audit"] });
        client.invalidateQueries({ queryKey: ["batch-devices"] });
      }
    } finally {
      flushing.current = false;
      setSyncing(false);
      await refresh();
    }
  }, [client, user.id, refresh]);

  // Sync on reconnect, on load, and periodically while edits wait.
  useEffect(() => {
    if (online) flush();
  }, [online, flush]);
  useEffect(() => {
    if (!queued.length) return;
    const timer = setInterval(flush, 30_000);
    return () => clearInterval(timer);
  }, [queued.length, flush]);

  const queueDeviceEdit = useCallback(
    async (edit: DeviceEdit) => {
      const db = localDb();
      if (!db) throw new ApiError("Offline changes aren't available in this browser.", 0);
      await enqueueEdit(db, user.id, edit);
      await refresh();
    },
    [user.id, refresh],
  );

  return (
    <OfflineContext.Provider
      value={{
        queued,
        syncing,
        rejected,
        persistent,
        savedAt,
        queueDeviceEdit,
        dismissRejected: () => setRejected([]),
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function OfflineBanner() {
  const online = useOnline();
  const { queued, syncing, rejected, persistent, savedAt, dismissRejected } =
    useOffline();
  const waiting = queued.length;
  const changes = `${waiting} change${waiting === 1 ? "" : "s"}`;
  return (
    <>
      {!online && (
        <div className="offline-banner" role="status">
          <CloudOff size={16} />
          <span>
            <b>You’re offline.</b>{" "}
            {persistent
              ? `Showing data saved on this device${savedAt ? ` (last updated ${new Date(savedAt).toLocaleTimeString()})` : ""}.`
              : "Showing data loaded in this tab."}{" "}
            {waiting
              ? `${changes} will sync when you reconnect.`
              : "Device metadata edits will sync when you reconnect; other actions need a connection."}
          </span>
        </div>
      )}
      {online && waiting > 0 && (
        <div className="offline-banner syncing" role="status">
          <RefreshCw size={16} className={syncing ? "animate-spin" : undefined} />
          <span>
            {syncing
              ? `Syncing ${changes}…`
              : `${changes} waiting to sync. Retrying shortly.`}
          </span>
        </div>
      )}
      {rejected.length > 0 && (
        <div className="console-alert error" role="alert">
          <TriangleAlert size={16} />
          <span>
            {rejected.length === 1
              ? "An offline change was rejected. "
              : `${rejected.length} offline changes were rejected. `}
            {rejected.join(" ")}
          </span>
          <button className="console-secondary" onClick={dismissRejected}>
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
