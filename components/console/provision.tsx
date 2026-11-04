"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Download, FileSpreadsheet, Printer, QrCode } from "lucide-react";
import { api, listAll } from "@/lib/console/api";
import { previewBatches } from "@/lib/console/demo";
import type { BatchSummary, ProvisionedBatch } from "@/lib/console/types";
import Link from "next/link";
import { useConsole, useUsers } from "./provider";
import { useOnline } from "./offline";
import { dateLabel, ErrorState, LoadingState, PageHeading } from "./shared";

type Row = { serial_number: string; public_key?: string };

const MAX = 500;
const svgSource = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** Accepts "serial" or "serial,public_key" lines, with an optional header row. */
export function parseDeviceCsv(text: string): { rows: Row[]; error: string } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines[0]?.toLowerCase().startsWith("serial")) lines.shift();
  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const [index, line] of lines.entries()) {
    const [serial = "", key = ""] = line.split(",").map((cell) => cell.trim());
    const serialNumber = serial.toUpperCase();
    if (!/^[A-Z0-9_-]{6,64}$/.test(serialNumber))
      return { rows: [], error: `Line ${index + 1}: invalid serial number.` };
    if (seen.has(serialNumber))
      return { rows: [], error: `Line ${index + 1}: duplicate serial ${serialNumber}.` };
    if (key && !/^(02|03)[0-9a-f]{64}$|^04[0-9a-f]{128}$/i.test(key))
      return { rows: [], error: `Line ${index + 1}: public key must be hex SEC1 P-256.` };
    seen.add(serialNumber);
    rows.push(
      key
        ? { serial_number: serialNumber, public_key: key }
        : { serial_number: serialNumber },
    );
  }
  if (!rows.length) return { rows, error: "The file has no serial numbers." };
  if (rows.length > MAX)
    return { rows: [], error: `A batch holds at most ${MAX} devices.` };
  return { rows, error: "" };
}

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export function ProvisionPage() {
  const { user, preview, base } = useConsole();
  const online = useOnline();
  const users = useUsers();
  const client = useQueryClient();
  const [mode, setMode] = useState<"generate" | "csv">("generate");
  const [model, setModel] = useState("");
  const [firmware, setFirmware] = useState("");
  const [prefix, setPrefix] = useState("");
  const [count, setCount] = useState(50);
  const [manufacturer, setManufacturer] = useState("");
  const [csv, setCsv] = useState<{ name: string; rows: Row[]; error: string } | null>(
    null,
  );
  const [saved, setSaved] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const batches = useQuery({
    queryKey: ["batches", user.id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve(previewBatches)
        : listAll<BatchSummary>("devices/batches", signal),
  });
  const create = useMutation({
    mutationFn: () =>
      api<ProvisionedBatch>("devices/batches", {
        method: "POST",
        body: JSON.stringify({
          ...(user.role === "admin" ? { manufacturer_id: manufacturer } : {}),
          model,
          firmware_version: firmware,
          ...(mode === "generate"
            ? { generate: { serial_prefix: prefix, count } }
            : { devices: csv?.rows }),
        }),
      }),
    onSuccess: () => {
      setSaved(false);
      client.invalidateQueries({ queryKey: ["batches"] });
      client.invalidateQueries({ queryKey: ["devices"] });
    },
  });
  const result = create.data;

  // Claim codes exist only in this response: warn before they are lost.
  useEffect(() => {
    if (!result || saved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [result, saved]);

  function exportCsv() {
    if (!result) return;
    const lines = [
      "serial_number,claim_code,qr_payload,device_id,model,firmware_version",
      ...result.devices.map((item) =>
        [
          item.device.serial_number,
          item.claim_code,
          item.qr_payload,
          item.device.id,
          item.device.model,
          item.device.firmware_version,
        ]
          .map(csvCell)
          .join(","),
      ),
    ];
    download(
      `amortrav-batch-${result.batch.id}.csv`,
      lines.join("\n") + "\n",
      "text/csv",
    );
    setSaved(true);
  }

  const makers = (users.data || []).filter((u) => u.role === "manufacturer");
  const ready =
    !preview &&
    online &&
    model.trim() &&
    firmware.trim() &&
    (user.role !== "admin" || manufacturer) &&
    (mode === "generate"
      ? /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,18}[A-Za-z0-9])$/.test(prefix) &&
        count >= 1 &&
        count <= MAX
      : csv && !csv.error && csv.rows.length > 0);

  if (result)
    return (
      <>
        <PageHeading
          title={`Batch of ${result.devices.length} devices`}
          description={`${result.batch.model} · firmware ${result.batch.firmware_version} · ${dateLabel(result.batch.created_at)}`}
        >
          <button className="console-secondary" onClick={exportCsv}>
            <Download size={16} /> Download CSV
          </button>
          <button
            className="console-button"
            onClick={() => {
              window.print();
              setSaved(true);
            }}
          >
            <Printer size={16} /> Print labels
          </button>
        </PageHeading>
        <div className="console-alert error no-print" role="alert">
          <AlertTriangle size={16} /> Claim codes are shown only once. Print the labels or
          download the CSV before leaving this page. A lost code can be replaced per
          device.
        </div>
        <section className="label-sheet" aria-label="Packaging labels">
          {result.devices.map((item) => (
            <figure className="device-label" key={item.device.id}>
              {/* The QR uses the highest error correction, so the centred mark still scans. */}
              <span className="label-qr">
                {/* eslint-disable-next-line @next/next/no-img-element -- generated data-URI SVG; an <img> cannot run scripts */}
                <img
                  src={svgSource(item.qr_svg)}
                  alt={`Claim QR code for ${item.device.serial_number}`}
                  width={112}
                  height={112}
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- small static mark; printed labels need no optimisation */}
                <img className="label-qr-mark" src="/images/console-mark.png" alt="" width={27} height={27} />
              </span>
              <figcaption>
                <strong className="mono">{item.device.serial_number}</strong>
                <span>{item.device.model}</span>
                <small>Scan in the Amortrav app to claim</small>
              </figcaption>
            </figure>
          ))}
        </section>
        <div className="console-actions no-print">
          <button
            className={saved || !confirmLeave ? "console-secondary" : "console-danger"}
            onClick={() => {
              if (saved || confirmLeave) {
                create.reset();
                setCsv(null);
                setConfirmLeave(false);
              } else {
                setConfirmLeave(true);
              }
            }}
          >
            {saved || !confirmLeave
              ? "Start another batch"
              : "Discard unsaved claim codes and start again"}
          </button>
        </div>
      </>
    );

  return (
    <>
      <PageHeading
        title="Bulk provisioning"
        description="Register up to 500 devices at once, each with a claim code and a QR label for its packaging."
      />
      <div className="provision-layout">
        <form
          className="console-card console-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) create.mutate();
          }}
        >
          <div className="segmented" role="tablist" aria-label="Serial numbers">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "generate"}
              onClick={() => setMode("generate")}
            >
              <QrCode size={16} /> Generate serials
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "csv"}
              onClick={() => setMode("csv")}
            >
              <FileSpreadsheet size={16} /> Upload CSV
            </button>
          </div>
          {user.role === "admin" && (
            <div className="field">
              <label htmlFor="batch-maker">Manufacturer</label>
              <select
                id="batch-maker"
                className="console-input"
                value={manufacturer}
                onChange={(event) => setManufacturer(event.target.value)}
                required
              >
                <option value="">Choose a manufacturer</option>
                {makers.map((maker) => (
                  <option key={maker.id} value={maker.id}>
                    {maker.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="batch-model">Model</label>
            <input
              id="batch-model"
              className="console-input"
              maxLength={128}
              placeholder="Carry-On 55"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="batch-firmware">Firmware version</label>
            <input
              id="batch-firmware"
              className="console-input"
              maxLength={64}
              placeholder="1.2.0"
              value={firmware}
              onChange={(event) => setFirmware(event.target.value)}
            />
          </div>
          {mode === "generate" ? (
            <>
              <div className="field">
                <label htmlFor="batch-prefix">Serial prefix</label>
                <input
                  id="batch-prefix"
                  className="console-input mono"
                  maxLength={20}
                  placeholder="AMT-C55"
                  value={prefix}
                  onChange={(event) => setPrefix(event.target.value.toUpperCase())}
                />
                <p>
                  Serials become {prefix || "PREFIX"}-XXXXXXXXXX with random, unguessable
                  suffixes.
                </p>
              </div>
              <div className="field">
                <label htmlFor="batch-count">Number of devices</label>
                <input
                  id="batch-count"
                  className="console-input"
                  type="number"
                  min={1}
                  max={MAX}
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value))}
                />
              </div>
            </>
          ) : (
            <div className="field">
              <label htmlFor="batch-csv">Device list (CSV)</label>
              <input
                id="batch-csv"
                className="console-input"
                type="file"
                accept=".csv,text/csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 200 * 1024) {
                    setCsv({
                      name: file.name,
                      rows: [],
                      error: "The file is larger than 200 KB.",
                    });
                    return;
                  }
                  setCsv({ name: file.name, ...parseDeviceCsv(await file.text()) });
                }}
              />
              <p>
                One device per line: <code>serial_number,public_key</code>. The public key
                is optional hex P-256 from the device secure element.
              </p>
              {csv &&
                (csv.error ? (
                  <span className="field-error" role="alert">
                    {csv.error}
                  </span>
                ) : (
                  <p role="status">
                    {csv.rows.length} devices ready,{" "}
                    {csv.rows.filter((r) => r.public_key).length} with hardware keys.
                  </p>
                ))}
            </div>
          )}
          {create.isError && (
            <p className="console-alert error" role="alert">
              {create.error.message}
            </p>
          )}
          <button className="console-button" disabled={!ready || create.isPending}>
            {create.isPending ? "Provisioning…" : "Create batch"}
          </button>
          <p className="field-hint">
            Private keys never leave each device. Claim codes are shown once, right after
            creation.
          </p>
        </form>
      </div>
      <section className="console-card">
        <div className="card-heading">
          <h2>Recent batches</h2>
          <span className="count-badge">{batches.data?.length || 0}</span>
        </div>
        {batches.isPending ? (
          <LoadingState />
        ) : batches.isError ? (
          <ErrorState message={batches.error.message} retry={() => batches.refetch()} />
        ) : !batches.data.length ? (
          <div className="console-empty">
            <QrCode size={30} />
            <p>Your provisioning batches will appear here.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Created</th>
                  {user.role === "admin" && <th>Manufacturer</th>}
                  <th>Model</th>
                  <th>Devices</th>
                  <th>Claimed</th>
                </tr>
              </thead>
              <tbody>
                {batches.data.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <Link href={`${base}/provision/${batch.id}`}>
                        {dateLabel(batch.created_at)}
                      </Link>
                    </td>
                    {user.role === "admin" && <td>{batch.manufacturer_email}</td>}
                    <td>
                      {batch.model}
                      <small className="mono"> · {batch.firmware_version}</small>
                    </td>
                    <td>{batch.device_count}</td>
                    <td>
                      {batch.claimed_count}
                      {batch.revoked_count > 0 && (
                        <small> · {batch.revoked_count} revoked</small>
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
