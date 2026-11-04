"use client";

import Link from "next/link";
import { ArrowUpRight, Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useConsoleStore } from "@/stores/console-store";
import { useConsole, useUsers } from "./provider";
import type { Device } from "@/lib/console/types";
import { dateLabel, StatusBadge } from "./shared";

export function DeviceSearch() {
  const { search, setSearch } = useConsoleStore();
  return (
    <label className="console-search">
      <Search size={18} />
      <span className="sr-only">Search devices</span>
      <input
        type="search"
        placeholder="Search serial or model"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </label>
  );
}

export function Inventory({ devices }: { devices: Device[] }) {
  const { base, user } = useConsole();
  const users = useUsers();
  const { search, status, setStatus } = useConsoleStore();
  const [page, setPage] = useState(0);
  const filtered = devices.filter(
    (device) =>
      (status === "all" || device.status === status) &&
      `${device.serial_number} ${device.model}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * 10, (current + 1) * 10);
  const makers = new Map(users.data?.map((user) => [user.id, user.email]));

  return (
    <section className="console-card inventory-card">
      <div className="card-heading">
        <h2>
          Inventory <span className="count-badge">{devices.length}</span>
        </h2>
        <div className="segmented-control" role="group" aria-label="Filter by status">
          {["all", "unclaimed", "claimed", "revoked"].map((value) => (
            <button
              key={value}
              aria-pressed={status === value}
              onClick={() => {
                setStatus(value);
                setPage(0);
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {!visible.length ? (
        <div className="console-empty">
          <Package size={32} />
          <h3>{devices.length ? "No devices match." : "Your first bag starts here."}</h3>
          <p>
            {devices.length
              ? "Try another search or status filter."
              : "Register a device to create its one-time claim code."}
          </p>
          {!devices.length && (
            <Link className="console-button" href={`${base}/register`}>
              Register device
            </Link>
          )}
        </div>
      ) : (
        <div className="table-scroll">
          <table className="console-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Model</th>
                <th>Firmware</th>
                {user.role === "admin" && <th>Manufacturer</th>}
                <th>Status</th>
                <th>Claimed</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((device) => (
                <tr key={device.id}>
                  <td>
                    <Link className="serial-link" href={`${base}/devices/${device.id}`}>
                      {device.serial_number}
                    </Link>
                  </td>
                  <td>{device.model}</td>
                  <td className="mono">{device.firmware_version}</td>
                  {user.role === "admin" && (
                    <td className="maker-cell" title={device.manufacturer_id}>
                      {makers.get(device.manufacturer_id) ||
                        `${device.manufacturer_id.slice(0, 8)}…`}
                    </td>
                  )}
                  <td>
                    <StatusBadge status={device.status} />
                  </td>
                  <td>{dateLabel(device.claimed_at)}</td>
                  <td>
                    <Link
                      className="row-open"
                      href={`${base}/devices/${device.id}`}
                      aria-label={`Open ${device.serial_number}`}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-footer">
        <p>Firmware is declared at registration, not live telemetry.</p>
        <div>
          <span>
            {filtered.length} of {devices.length} devices
          </span>
          {pages > 1 && (
            <>
              <button
                aria-label="Previous page"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {current + 1} / {pages}
              </span>
              <button
                aria-label="Next page"
                disabled={current === pages - 1}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
