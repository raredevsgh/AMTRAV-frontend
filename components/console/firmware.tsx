"use client";

import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import { can } from "@/lib/console/roles";
import { api } from "@/lib/console/api";
import { previewFirmware } from "@/lib/console/trace-demo";
import type { FirmwareVersion } from "@/lib/console/types";
import { FirmwareReleases } from "./firmware-releases";
import { useConsole, useDevices } from "./provider";
import { PageHeading, LoadingState, ErrorState, timeLabel } from "./shared";

/** What the fleet actually runs, as each bag reports it (else as registered). */
function FleetFirmware() {
  const { user, preview } = useConsole();
  const versions = useQuery({
    queryKey: ["fleet-firmware", preview],
    queryFn: ({ signal }) =>
      preview ? Promise.resolve(previewFirmware) : api<FirmwareVersion[]>("admin/fleet/firmware", { signal }),
    enabled: can(user.role, "read"),
  });
  if (!can(user.role, "read")) return null;
  const total = versions.data?.reduce((sum, row) => sum + row.devices, 0) ?? 0;
  return (
    <section className="console-card">
      <div className="card-heading">
        <h2>Running in the fleet</h2>
        <span className="subtle-pill">Reported by the bags</span>
      </div>
      {versions.isPending ? (
        <LoadingState />
      ) : versions.isError ? (
        <ErrorState message={versions.error.message} retry={() => versions.refetch()} />
      ) : (
        <div className="table-scroll">
          <table className="console-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Bags</th>
                <th>Share</th>
                <th>Reporting this week</th>
                <th>Last report</th>
              </tr>
            </thead>
            <tbody>
              {versions.data.map((row) => (
                <tr key={row.firmware}>
                  <td className="mono">{row.firmware}</td>
                  <td>{row.devices}</td>
                  <td>
                    <span className="share-bar">
                      <i style={{ width: `${total ? (row.devices / total) * 100 : 0}%` }} />
                      {total ? Math.round((row.devices / total) * 100) : 0}%
                    </span>
                  </td>
                  <td>{row.reporting}</td>
                  <td>{row.last_seen_at ? timeLabel(row.last_seen_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function FirmwarePage() {
  const query = useDevices();
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const versions = [...new Set(query.data.map((device) => device.firmware_version))];
  return (
    <>
      <PageHeading
        title="Firmware"
        description="Signed releases and their rollout, what the fleet runs as the bags report it, and the versions declared in the registry."
      />
      <FirmwareReleases />
      <FleetFirmware />
      <section className="console-card">
        <h2>Declared versions</h2>
        {!versions.length ? (
          <div className="console-empty">
            <Cpu size={30} />
            <p>Register your first device to see its firmware here.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Models</th>
                  <th>Devices</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version}>
                    <td className="mono">{version}</td>
                    <td>
                      {[
                        ...new Set(
                          query.data
                            .filter((d) => d.firmware_version === version)
                            .map((d) => d.model),
                        ),
                      ].join(", ")}
                    </td>
                    <td>
                      {query.data.filter((d) => d.firmware_version === version).length}
                    </td>
                    <td>Registry metadata</td>
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
