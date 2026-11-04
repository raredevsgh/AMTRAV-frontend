"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, KeyRound } from "lucide-react";
import { api, listDevices } from "@/lib/console/api";
import { previewBatches, previewDevices } from "@/lib/console/demo";
import type { BatchSummary, Device } from "@/lib/console/types";
import { useConsole } from "./provider";
import { dateLabel, ErrorState, LoadingState, PageHeading, StatusBadge } from "./shared";

export function BatchDetail({ id }: { id: string }) {
  const { base, preview, user } = useConsole();
  const batch = useQuery({
    queryKey: ["batch", id, preview],
    queryFn: () =>
      preview
        ? Promise.resolve(previewBatches.find((b) => b.id === id) ?? null)
        : api<BatchSummary>(`devices/batches/${id}`),
  });
  const devices = useQuery({
    queryKey: ["batch-devices", id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve<Device[]>(previewDevices.slice(0, 6))
        : listDevices(`devices?batch_id=${id}`, signal),
    enabled: !!batch.data,
  });

  if (batch.isPending) return <LoadingState />;
  if (batch.isError)
    return <ErrorState message={batch.error.message} retry={() => batch.refetch()} />;
  if (!batch.data)
    return (
      <div className="console-empty">
        <h1>Batch not found</h1>
        <Link href={`${base}/provision`}>Back to bulk provisioning</Link>
      </div>
    );
  const summary = batch.data;
  const unclaimed = summary.device_count - summary.claimed_count - summary.revoked_count;
  return (
    <>
      <Link href={`${base}/provision`} className="console-back">
        <ArrowLeft size={16} /> Back to bulk provisioning
      </Link>
      <PageHeading
        title={`${summary.model} batch`}
        description={`${summary.device_count} devices · firmware ${summary.firmware_version} · created ${dateLabel(summary.created_at)}${user.role === "admin" ? ` · ${summary.manufacturer_email}` : ""}`}
      />
      <div className="batch-stats">
        {[
          ["Claimed by owners", summary.claimed_count],
          ["Awaiting claim", Math.max(unclaimed, 0)],
          ["Revoked", summary.revoked_count],
          ["Hardware keys enrolled", summary.keyed_count],
        ].map(([label, value]) => (
          <div className="console-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="console-card">
        <div className="card-heading">
          <h2>Devices in this batch</h2>
          <span className="count-badge">{devices.data?.length || 0}</span>
        </div>
        {devices.isPending ? (
          <LoadingState />
        ) : devices.isError ? (
          <ErrorState message={devices.error.message} retry={() => devices.refetch()} />
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Status</th>
                  <th>Claimed</th>
                  <th>Hardware key</th>
                </tr>
              </thead>
              <tbody>
                {devices.data.map((device) => (
                  <tr key={device.id}>
                    <td className="mono">
                      <Link href={`${base}/devices/${device.id}`}>
                        {device.serial_number}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge status={device.status} />
                    </td>
                    <td>{dateLabel(device.claimed_at)}</td>
                    <td>
                      {device.public_key ? (
                        <span className="key-enrolled">
                          <KeyRound size={14} /> Enrolled
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
