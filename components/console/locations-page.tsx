"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocateFixed, Radio, Search, ShieldCheck } from "lucide-react";
import { useConsole, useDevices } from "./provider";
import { PageHeading, ErrorState, LoadingState } from "./shared";
import { FleetMap } from "./fleet-map";
import { useLocationStream } from "./use-location-stream";
import { locationIsStale } from "@/lib/console/locations";

export function LocationsPage() {
  const { user } = useConsole();
  if (user.role !== "admin") {
    return (
      <section className="console-card console-empty">
        <ShieldCheck size={30} />
        <h1>Administrator access required</h1>
        <p>Device locations are only available to administrators.</p>
      </section>
    );
  }
  return <AdminLocations />;
}

function AdminLocations() {
  const { preview, base } = useConsole();
  const devices = useDevices();
  const stream = useLocationStream(preview);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  if (devices.isPending) return <LoadingState />;
  if (devices.isError)
    return <ErrorState message={devices.error.message} retry={() => devices.refetch()} />;
  const registry = new Map(devices.data.map((device) => [device.id, device]));
  const positions = stream.locations.filter((location) =>
    registry.has(location.device_id),
  );
  const filtered = positions.filter((location) => {
    const device = registry.get(location.device_id)!;
    return `${device.serial_number} ${device.model}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });
  const recent = positions.filter((location) => !locationIsStale(location, now)).length;
  const selected = positions.find((location) => location.device_id === selectedId);
  const selectedDevice = selected ? registry.get(selected.device_id) : undefined;
  const connectionLabel = {
    preview: "Sample locations",
    connecting: "Connecting",
    connected: "Stream connected",
    reconnecting: "Reconnecting",
    unavailable: "Unavailable",
    setup: "Not connected",
  }[stream.status];

  return (
    // On wide screens the page fills the window, so the map and device list run to the bottom.
    <div className="fleet-page">
      <PageHeading
        title="Fleet map"
        description="Last-known luggage positions, streamed to your workspace."
      >
        <span className={`location-connection ${stream.status}`} role="status">
          <Radio size={15} /> {connectionLabel}
        </span>
      </PageHeading>
      <div className="location-summary">
        <span>
          <b>{positions.length}</b> with a location
        </span>
        <span>
          <b>{recent}</b> recent fixes
        </span>
        <span>
          <b>{Math.max(0, devices.data.length - positions.length)}</b> without a displayed
          location
        </span>
        <span className="location-admin-label">
          <ShieldCheck size={14} /> Admin access only
        </span>
      </div>
      {stream.message && (
        <p className="console-alert" role="status">
          {stream.message}
        </p>
      )}
      {stream.truncated && (
        <p className="console-alert">
          Showing the 1,000 most recently reported devices. Older positions are outside
          this view.
        </p>
      )}
      <div className="fleet-layout">
        <FleetMap
          locations={positions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          now={now}
        />
        <aside className="console-card fleet-device-panel">
          <div className="card-heading">
            <h2>Located devices</h2>
            <span className="subtle-pill">{positions.length}</span>
          </div>
          <label className="console-search">
            <Search size={16} />
            <span className="sr-only">Search located devices</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Serial or model"
            />
          </label>
          <div className="fleet-device-list">
            {filtered.map((location) => {
              const device = registry.get(location.device_id)!;
              const stale = locationIsStale(location, now);
              return (
                <button
                  key={location.device_id}
                  className={`fleet-device ${selectedId === location.device_id ? "selected" : ""}`}
                  onClick={() => setSelectedId(location.device_id)}
                  aria-pressed={selectedId === location.device_id}
                >
                  <span className={`location-pin ${stale ? "stale" : ""}`}>
                    <LocateFixed size={18} />
                  </span>
                  <span>
                    <strong>{device.serial_number}</strong>
                    <small>{device.model}</small>
                    <small>
                      {stale ? "Last known" : "Recent fix"} ·{" "}
                      {new Date(location.recorded_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </span>
                </button>
              );
            })}
            {!filtered.length && (
              <div className="fleet-empty">
                <MapEmpty />
                <h3>{search ? "No matches" : "Waiting for location reports"}</h3>
                <p>
                  {search
                    ? "Try a different serial number or model."
                    : "Devices will appear after the first valid location report arrives."}
                </p>
              </div>
            )}
          </div>
          {selected && selectedDevice && (
            <div className="location-details">
              <h3>{selectedDevice.serial_number}</h3>
              <dl>
                <div>
                  <dt>Coordinates</dt>
                  <dd>
                    {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
                  </dd>
                </div>
                <div>
                  <dt>Accuracy</dt>
                  <dd>±{Math.round(selected.accuracy_m)} m</dd>
                </div>
                <div>
                  <dt>Reported</dt>
                  <dd>{new Date(selected.recorded_at).toLocaleString()}</dd>
                </div>
              </dl>
              <Link
                className="console-secondary"
                href={`${base}/devices/${selected.device_id}`}
              >
                Open device
              </Link>
            </div>
          )}
        </aside>
      </div>
      <p className="location-footnote">
        {preview ? "Preview positions are illustrative sample data. " : ""}A connected
        stream does not mean every device is online. Positions older than five minutes are
        marked as last known.
      </p>
    </div>
  );
}

function MapEmpty() {
  return <LocateFixed size={28} />;
}
