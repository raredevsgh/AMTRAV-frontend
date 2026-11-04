"use client";

import Link from "next/link";
import { useState } from "react";
import {
  onlineManager,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, Pencil, ShieldX, KeyRound, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api, ApiError, normalizeDevice } from "@/lib/console/api";
import type { AuditEntry, Device, ProvisionedDevice } from "@/lib/console/types";
import { DeviceLiveState, DeviceTraceDetails } from "./trace";
import { useConsole, useDevices, useUsers } from "./provider";
import { dateLabel, ErrorState, LoadingState, PageHeading, StatusBadge } from "./shared";
import { ClaimCode } from "./register-device";
import { useOffline, useOnline } from "./offline";

type Action = "edit" | "revoke" | "claim-code" | null;
type Values = { model: string; firmware_version: string };

export function DeviceDetail({ id }: { id: string }) {
  const { base, preview } = useConsole();
  const devices = useDevices();
  const users = useUsers();
  const client = useQueryClient();
  const [action, setAction] = useState<Action>(null);
  const [code, setCode] = useState<ProvisionedDevice | null>(null);
  const query = useQuery({
    queryKey: ["device", id, preview],
    queryFn: () =>
      preview
        ? Promise.resolve(devices.data?.find((d) => d.id === id) ?? null)
        : api<Device>(`devices/${id}`).then(normalizeDevice),
    enabled: !preview || !!devices.data,
  });
  const audit = useQuery({
    queryKey: ["audit", id, preview],
    queryFn: () =>
      preview
        ? Promise.resolve([
            {
              id: "preview",
              device_id: id,
              actor_id: "Sample manufacturer",
              action: "registered",
              created_at: query.data!.created_at,
            },
          ])
        : api<AuditEntry[]>(`devices/${id}/audit`),
    enabled: !!query.data,
  });
  const online = useOnline();
  const { queued, queueDeviceEdit } = useOffline();
  const pendingEdit = queued.find((edit) => edit.device_id === id);

  // Optimistic updates touch every cached copy of this device.
  const snapshot = () => ({
    device: client.getQueryData<Device | null>(["device", id, preview]),
    lists: client.getQueriesData<Device[]>({ queryKey: ["devices"] }),
    batches: client.getQueriesData<Device[]>({ queryKey: ["batch-devices"] }),
  });
  type Snapshot = ReturnType<typeof snapshot>;
  const apply = (patch: Partial<Device>) => {
    const update = (list?: Device[]) =>
      list?.map((device) => (device.id === id ? { ...device, ...patch } : device));
    client.setQueryData<Device | null>(["device", id, preview], (device) =>
      device ? { ...device, ...patch } : device,
    );
    client.setQueriesData<Device[]>({ queryKey: ["devices"] }, update);
    client.setQueriesData<Device[]>({ queryKey: ["batch-devices"] }, update);
  };
  const restore = (previous?: Snapshot) => {
    if (!previous) return;
    client.setQueryData(["device", id, preview], previous.device);
    for (const [key, data] of [...previous.lists, ...previous.batches])
      client.setQueryData(key, data);
  };
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["device", id] });
    client.invalidateQueries({ queryKey: ["devices"] });
    client.invalidateQueries({ queryKey: ["batch-devices"] });
    client.invalidateQueries({ queryKey: ["audit", id] });
  };

  // Metadata edits are the one change that works offline: they go to the SQLite outbox
  // and sync later, guarded by the version the edit was made against.
  const edit = useMutation({
    mutationFn: async ({ values, base }: { values: Values; base: Device }) => {
      if (preview) throw new Error("Sign in to make changes.");
      const queue = async () => {
        await queueDeviceEdit({
          device_id: id,
          serial_number: base.serial_number,
          values,
          expected_updated_at: base.updated_at,
        });
        return null;
      };
      if (!onlineManager.isOnline()) return queue();
      try {
        return await api<Device>(`devices/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...values, expected_updated_at: base.updated_at }),
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 0) return queue();
        throw error;
      }
    },
    onMutate: async ({ values }) => {
      await client.cancelQueries({ queryKey: ["device", id] });
      const previous = snapshot();
      apply(values);
      setAction(null);
      return previous;
    },
    onError: (_error, _input, previous) => restore(previous),
    onSuccess: (device) => {
      if (device) {
        client.setQueryData(["device", id, preview], normalizeDevice(device));
        refresh();
      }
    },
  });

  // Security actions need the server's answer: online only, never queued.
  const act = useMutation({
    mutationFn: (kind: "revoke" | "claim-code") => {
      if (preview) throw new Error("Sign in to make changes.");
      return api<Device | ProvisionedDevice>(`devices/${id}/${kind}`, { method: "POST" });
    },
    onMutate: async (kind) => {
      if (kind !== "revoke") return undefined;
      await client.cancelQueries({ queryKey: ["device", id] });
      const previous = snapshot();
      apply({ status: "revoked" });
      return previous;
    },
    onError: (_error, _kind, previous) => restore(previous),
    onSuccess: (result) => {
      if ("claim_code" in result) setCode(result);
      setAction(null);
      refresh();
    },
  });
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const device = query.data;
  if (!device)
    return (
      <div className="console-empty">
        <h1>Device not found</h1>
        <Link href={base}>Back to dashboard</Link>
      </div>
    );
  const maker =
    users.data?.find((u) => u.id === device.manufacturer_id)?.email ||
    device.manufacturer_id;
  return (
    <>
      <Link href={`${base}/devices`} className="console-back">
        <ArrowLeft size={16} /> Back to devices
      </Link>
      <PageHeading title={device.serial_number} description={device.model}>
        <StatusBadge status={device.status} />
        {pendingEdit && <span className="subtle-pill">Waiting to sync</span>}
        <Button
          className="console-secondary"
          disabled={preview || device.status === "revoked"}
          onClick={() => {
            edit.reset();
            setAction("edit");
          }}
        >
          <Pencil size={16} /> Edit metadata
        </Button>
        <Button
          className="console-danger"
          disabled={preview || !online || device.status === "revoked"}
          title={online ? undefined : "Revoking needs a connection"}
          onClick={() => {
            act.reset();
            setAction("revoke");
          }}
        >
          <ShieldX size={16} /> Revoke
        </Button>
      </PageHeading>
      {code && <ClaimCode result={code} />}
      {edit.isError && (
        <p role="alert" className="console-alert error">
          Your edit wasn’t saved: {edit.error.message}
        </p>
      )}
      <div className="detail-columns">
        <div className="detail-stack">
          <section className="console-card owner-card">
            <span>Owner</span>
            <h2>
              {device.nickname ||
                (device.owner_id ? "Claimed bag" : "Waiting for its first journey")}
            </h2>
            <p>
              {device.owner_id
                ? "Nickname set by the owner"
                : "This device has not been paired yet."}
            </p>
            <div>
              <span>Claimed</span>
              <b>{dateLabel(device.claimed_at)}</b>
            </div>
            <div>
              <span>Claim code</span>
              <b>
                {device.owner_id
                  ? "Used"
                  : device.status === "revoked"
                    ? "Disabled"
                    : "Issued"}
              </b>
            </div>
            {device.status === "unclaimed" && (
              <Button
                className="console-secondary"
                disabled={preview || !online}
                title={online ? undefined : "Replacing a claim code needs a connection"}
                onClick={() => {
                  act.reset();
                  setAction("claim-code");
                }}
              >
                <KeyRound size={16} /> Replace claim code
              </Button>
            )}
          </section>
          <DeviceLiveState id={device.id} />
        </div>
        <section className="console-card">
          <h2>Registry record</h2>
          <dl className="record-list">
            {[
              ["Model", device.model],
              ["Declared firmware", device.firmware_version],
              ["Manufacturer", maker],
              ["Registered", dateLabel(device.created_at)],
              [
                "Batch",
                device.batch_id ? (
                  <Link href={`${base}/provision/${device.batch_id}`}>View batch</Link>
                ) : (
                  "Registered individually"
                ),
              ],
              ["Last updated", dateLabel(device.updated_at)],
              ["Device ID", device.id],
            ].map(([key, value]) => (
              <div key={String(key)}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <DeviceTraceDetails id={device.id} />
      <section className="console-card">
        <div className="card-heading">
          <h2>Audit history</h2>
          <Clock3 size={18} />
        </div>
        {audit.isPending ? (
          <LoadingState />
        ) : audit.isError ? (
          <ErrorState message={audit.error.message} retry={() => audit.refetch()} />
        ) : (
          <ol className="audit-list">
            {audit.data?.map((entry) => (
              <li key={entry.id}>
                <span className="audit-dot" />
                <div>
                  <strong>{entry.action.replaceAll("_", " ")}</strong>
                  <p>
                    {users.data?.find((u) => u.id === entry.actor_id)?.email ||
                      entry.actor_id}
                  </p>
                </div>
                <time>{dateLabel(entry.created_at)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => !open && !act.isPending && setAction(null)}
      >
        <DialogContent className="console-dialog">
          <DialogHeader>
            <DialogTitle>
              {action === "edit"
                ? "Edit metadata"
                : action === "revoke"
                  ? "Revoke this device?"
                  : "Replace the claim code?"}
            </DialogTitle>
            <DialogDescription>
              {action === "edit"
                ? "Update the registry metadata. This does not update firmware on the physical bag."
                : action === "revoke"
                  ? "This removes the device from active service and prevents future claims. Its owner and audit history are retained."
                  : "The previous code will stop working. Save the replacement and share it privately with the buyer."}
            </DialogDescription>
          </DialogHeader>
          {act.isError && (
            <p role="alert" className="console-alert error">
              {act.error.message}
            </p>
          )}
          {action === "edit" && !online && (
            <p className="field-hint">
              You’re offline. This edit is saved on this device and syncs when you
              reconnect, unless someone changes the device first.
            </p>
          )}
          {action === "edit" ? (
            <form
              className="console-form"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                edit.mutate({
                  base: device,
                  values: {
                    model: String(data.get("model")).trim(),
                    firmware_version: String(data.get("firmware_version")).trim(),
                  },
                });
              }}
            >
              <div className="field">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  name="model"
                  defaultValue={device.model}
                  maxLength={128}
                  required
                />
              </div>
              <div className="field">
                <Label htmlFor="edit-firmware">Firmware version</Label>
                <Input
                  id="edit-firmware"
                  name="firmware_version"
                  defaultValue={device.firmware_version}
                  maxLength={64}
                  required
                />
              </div>
              <Button className="console-button" disabled={edit.isPending}>
                {online ? "Save changes" : "Save offline"}
              </Button>
            </form>
          ) : (
            <div className="console-actions">
              <Button
                className="console-secondary"
                onClick={() => setAction(null)}
                disabled={act.isPending}
              >
                Cancel
              </Button>
              <Button
                className={action === "revoke" ? "console-danger" : "console-button"}
                disabled={act.isPending || !online}
                onClick={() => action && act.mutate(action)}
              >
                {act.isPending
                  ? "Working…"
                  : action === "revoke"
                    ? "Revoke device"
                    : "Replace code"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
