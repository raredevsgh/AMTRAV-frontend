"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useConsole, useResource } from "./console-context";
import {
  SectionPage,
  ButtonLink,
  LoadingState,
  ErrorState,
  EmptyState,
  Pagination,
  StatusBadge,
  Notice,
  formatDate,
} from "@/components/console-ui";
export function Devices() {
  const api = useConsole();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const load = useCallback(
    () => api.listDevices({ limit, offset }),
    [api, limit, offset],
  );
  const { data, error, loading, retry } = useResource(load);
  const devices =
    data?.items.filter(
      (d) =>
        (status === "all" || d.status === status) &&
        `${d.serial_number} ${d.model}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
    ) ?? [];
  return (
    <SectionPage
      title="Devices"
      description={
        api.session.role === "admin"
          ? "Registry records across all manufacturers."
          : "Your manufacturer inventory. Only records assigned to your account."
      }
      actions={<ButtonLink href="/devices/new">＋ Register device</ButtonLink>}
    >
      {loading ? (
        <LoadingState label="Loading devices" />
      ) : (
        <>
          <section className="panel" aria-labelledby="inventory-heading">
            <div className="panel-heading">
              <h2 id="inventory-heading">Inventory</h2>
              <span className="small muted">
                {data?.items.length ?? 0} records on this page
              </span>
            </div>
            <div className="table-toolbar">
              <label className="grow">
                <span className="sr-only">
                  Search current page by serial or model
                </span>
                <input
                  aria-label="Search current page"
                  placeholder="Search this page by serial or model"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                <span className="sr-only">Device status</span>
                <select
                  aria-label="Device status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="registered">Unclaimed</option>
                  <option value="claimed">Claimed</option>
                  <option value="revoked">Revoked</option>
                </select>
              </label>
              {search && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
            <p className="small muted px-6 py-3">
              Search and status filtering apply to this loaded page only. The
              API has no registry search or total-count endpoint.
            </p>
            {error ? (
              <ErrorState error={error} retry={retry} />
            ) : devices.length === 0 ? (
              <EmptyState
                title={
                  search || status !== "all"
                    ? "No matching devices"
                    : "No devices yet"
                }
              >
                <p>
                  Clear the page filters, change page, or register a device.
                </p>
                <ButtonLink href="/devices/new">Register device</ButtonLink>
              </EmptyState>
            ) : (
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Device inventory table"
              >
                <table className="data-table inventory-table">
                  <thead>
                    <tr>
                      <th scope="col">Serial number</th>
                      <th scope="col">Model</th>
                      <th scope="col">Declared FW</th>
                      <th scope="col">Manufacturer account</th>
                      <th scope="col">Status</th>
                      <th scope="col">Claimed</th>
                      <th scope="col">
                        <span className="sr-only">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d) => (
                      <tr key={d.id}>
                        <td className="mono">{d.serial_number}</td>
                        <td>
                          <strong>{d.model}</strong>
                        </td>
                        <td>{d.firmware_version}</td>
                        <td className="mono" title={d.manufacturer_id}>
                          {d.manufacturer_id.slice(0, 8)}…
                          {d.manufacturer_id.slice(-4)}
                        </td>
                        <td>
                          <StatusBadge status={d.status} />
                        </td>
                        <td>{formatDate(d.claimed_at)}</td>
                        <td>
                          <Link
                            href={`/devices/${d.id}`}
                            className="btn btn-secondary"
                            aria-label={`View ${d.serial_number}`}
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data && (
              <Pagination
                offset={offset}
                limit={limit}
                count={data.items.length}
                onPage={setOffset}
                onLimit={(size) => {
                  setLimit(size);
                  setOffset(0);
                }}
              />
            )}
          </section>
          <Notice title="Registry metadata, not live device readings">
            Firmware is declared metadata. Status and claim dates describe the
            registry record, not the bag’s physical activity.
          </Notice>
        </>
      )}
    </SectionPage>
  );
}
