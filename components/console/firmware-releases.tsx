import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Rocket, Upload } from "lucide-react";
import { ConsoleSelect } from "./select";
import { api, apiResponse, ApiError } from "@/lib/console/api";
import type {
  FirmwareRelease,
  FirmwareReleaseDetail,
  ReleaseStatus,
  SigningKey,
} from "@/lib/console/types";
import { can } from "@/lib/console/roles";
import { useConsole } from "./provider";
import { dateLabel, ErrorState, LoadingState, timeLabel } from "./shared";

const statusBadge: Record<ReleaseStatus, string> = {
  draft: "",
  active: "lime",
  paused: "warn",
  retired: "",
};

const statusLabel: Record<ReleaseStatus, string> = {
  draft: "Draft",
  active: "Rolling out",
  paused: "Paused",
  retired: "Retired",
};

function size(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

function message(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

/** Signed firmware releases: upload, staged rollout and where each bag got to. Every staff role
 * can follow a rollout; operations and administrators upload and change them. */
export function FirmwareReleases() {
  const { user, preview } = useConsole();
  const staff = can(user.role, "read") && !preview;
  const manage = staff && can(user.role, "firmware");
  const [selected, setSelected] = useState<string | null>(null);
  const key = useQuery({
    queryKey: ["firmware-signing-key"],
    queryFn: ({ signal }) => api<SigningKey>("admin/firmware/signing-key", { signal }),
    enabled: staff,
  });
  const releases = useQuery({
    queryKey: ["firmware-releases"],
    queryFn: ({ signal }) => api<FirmwareRelease[]>("admin/firmware/releases", { signal }),
    enabled: staff,
    refetchInterval: 30_000,
  });
  if (!staff) return null;
  const chosen = releases.data?.find((release) => release.id === selected) ?? null;
  return (
    <>
      <section className="console-card">
        <div className="card-heading">
          <h2>
            <KeyRound size={18} /> Signing key
          </h2>
          {key.data ? (
            <span className={`trace-badge ${key.data.configured ? "lime" : "warn"}`}>
              {key.data.configured ? "Uploads checked" : "Not configured"}
            </span>
          ) : null}
        </div>
        {key.isPending ? (
          <LoadingState />
        ) : key.isError ? (
          <ErrorState message={key.error.message} retry={() => key.refetch()} />
        ) : key.data.configured ? (
          <p className="cell-sub">
            Images must be signed with the private half of this key, the one built into the Smart Core’s bootloader:
            <br />
            <code>{key.data.public_key}</code>
          </p>
        ) : (
          <p className="cell-sub">
            Set FIRMWARE_SIGNING_PUBLIC_KEY on the API (make one with <code>cargo run --example sign-firmware -- keygen</code>)
            before uploading firmware.
          </p>
        )}
      </section>

      {manage && key.data?.configured ? <UploadRelease /> : null}

      <section className="console-card">
        <div className="card-heading">
          <h2>
            <Rocket size={18} /> Releases
          </h2>
        </div>
        {releases.isPending ? (
          <LoadingState />
        ) : releases.isError ? (
          <ErrorState message={releases.error.message} retry={() => releases.refetch()} />
        ) : !releases.data.length ? (
          <p className="cell-sub">No releases yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Rollout</th>
                  <th>Installed</th>
                  <th>In progress</th>
                  <th>Failed</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {releases.data.map((release) => (
                  <tr
                    key={release.id}
                    tabIndex={0}
                    className={release.id === selected ? "selected" : undefined}
                    aria-selected={release.id === selected}
                    onClick={() => setSelected(release.id)}
                    onKeyDown={(event) => event.key === "Enter" && setSelected(release.id)}
                  >
                    <td>
                      <strong>{release.version}</strong>
                      <div className="cell-sub">{size(release.size_bytes)}</div>
                    </td>
                    <td>
                      <span className={`trace-badge ${release.auto_paused_at ? "severe" : statusBadge[release.status]}`}>
                        {release.auto_paused_at ? "Stopped itself" : statusLabel[release.status]}
                      </span>
                    </td>
                    <td>
                      {release.rollout_percent}%
                      {release.rollout_devices.length ? ` + ${release.rollout_devices.length} listed` : ""}
                    </td>
                    <td>{release.installed}</td>
                    <td>{release.offered + release.downloading}</td>
                    <td>{release.failed}</td>
                    <td>{dateLabel(release.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {chosen ? (
        <ManageRelease
          key={`${chosen.id}-${chosen.updated_at}`}
          release={chosen}
          releases={releases.data ?? []}
          manage={manage}
        />
      ) : null}
    </>
  );
}

function UploadRelease() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [signature, setSignature] = useState("");
  const [notes, setNotes] = useState("");
  const upload = useMutation({
    mutationFn: async () => {
      const response = await apiResponse("admin/firmware/releases", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Firmware-Version": version.trim(),
          "X-Firmware-Signature": signature.trim(),
          // Headers carry ASCII only.
          ...(notes.trim() ? { "X-Firmware-Notes": notes.trim().replace(/[^\x20-\x7e]/g, "") } : {}),
        },
      });
      return (await response.json()) as FirmwareRelease;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firmware-releases"] });
      setFile(null);
      setVersion("");
      setSignature("");
      setNotes("");
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    upload.mutate();
  }
  const ready = file && /^[0-9A-Za-z.+-]{1,32}$/.test(version.trim()) && /^[0-9a-fA-F]{128}$/.test(signature.trim());
  return (
    <section className="console-card">
      <h2>
        <Upload size={18} /> Upload a release
      </h2>
      <p className="cell-sub">
        Sign the image first: <code>cargo run --example sign-firmware -- sign key.hex VERSION image.bin</code>. The API
        refuses an image whose signature doesn’t match its version and contents. New releases start as drafts.
      </p>
      <form className="console-form" onSubmit={submit}>
        <label className="field">
          <span>Image (up to 16 MB)</span>
          <input
            className="console-input"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </label>
        <div className="threshold-grid">
          <label className="field">
            <span>Version</span>
            <input className="console-input" value={version} onChange={(event) => setVersion(event.target.value)} placeholder="1.5.0" required />
          </label>
          <label className="field">
            <span>Signature (hex)</span>
            <input
              className="console-input"
              value={signature}
              onChange={(event) => setSignature(event.target.value)}
              placeholder="128 hex characters"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Notes (optional)</span>
          <input className="console-input" value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} placeholder="Steadier weighing" />
        </label>
        {upload.isError ? (
          <p role="alert" className="console-alert error">
            {message(upload.error, "Couldn’t upload the release.")}
          </p>
        ) : upload.isSuccess ? (
          <p role="status" className="console-alert">
            {upload.data.version} uploaded as a draft. Choose it below to start the rollout.
          </p>
        ) : null}
        <div className="form-actions">
          <span />
          <button className="console-button" disabled={!ready || upload.isPending}>
            {upload.isPending ? "Uploading…" : "Upload release"}
          </button>
        </div>
      </form>
    </section>
  );
}

function ManageRelease({
  release,
  releases,
  manage,
}: {
  release: FirmwareRelease;
  releases: FirmwareRelease[];
  manage: boolean;
}) {
  const queryClient = useQueryClient();
  const [percent, setPercent] = useState(String(release.rollout_percent));
  const [failurePercent, setFailurePercent] = useState(String(release.max_failure_percent));
  const [minFailures, setMinFailures] = useState(String(release.min_failures));
  const [rollbackTo, setRollbackTo] = useState(release.rollback_release_id ?? "none");
  const [devices, setDevices] = useState(release.rollout_devices.join("\n"));
  const [notes, setNotes] = useState(release.notes ?? "");
  const detail = useQuery({
    queryKey: ["firmware-release", release.id, release.updated_at],
    queryFn: ({ signal }) => api<FirmwareReleaseDetail>(`admin/firmware/releases/${release.id}`, { signal }),
    refetchInterval: 30_000,
  });
  const change = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<FirmwareRelease>(`admin/firmware/releases/${release.id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["firmware-releases"] }),
  });
  const listed = devices
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const validList = listed.every((value) => /^[0-9a-fA-F-]{36}$/.test(value));
  function save(event: FormEvent) {
    event.preventDefault();
    change.mutate({
      rollout_percent: Number(percent),
      rollout_devices: listed,
      notes,
      max_failure_percent: Number(failurePercent),
      min_failures: Number(minFailures),
      rollback_to: rollbackTo,
    });
  }
  const retired = release.status === "retired";
  return (
    <section className="console-card">
      <div className="card-heading">
        <h2>Firmware {release.version}</h2>
        <span className={`trace-badge ${statusBadge[release.status]}`}>{statusLabel[release.status]}</span>
      </div>
      <div className="release-meta">
        <span>{size(release.size_bytes)}</span>
        <span>Uploaded {timeLabel(release.created_at)}</span>
        <span>
          SHA-256 <code>{release.sha256}</code>
        </span>
      </div>
      {release.auto_paused_at ? (
        <p className="console-alert error" role="status">
          Stopped itself {timeLabel(release.auto_paused_at)}: {release.pause_reason}.{" "}
          {release.rollback_version
            ? `Bags running ${release.version} are being offered ${release.rollback_version}, the last release that installed cleanly.`
            : "No earlier release installed cleanly, so bags stay on it until you choose one to roll back to."}{" "}
          {manage ? "Resume once it’s fixed, or retire it." : null}
        </p>
      ) : null}
      {retired ? (
        <p className="cell-sub">Retired: no longer offered, and can’t be changed.</p>
      ) : !manage ? (
        <dl className="release-terms">
          <div>
            <dt>Share of all bags</dt>
            <dd>
              {release.rollout_percent}%
              {release.rollout_devices.length ? ` + ${release.rollout_devices.length} listed` : ""}
            </dd>
          </div>
          <div>
            <dt>Stops itself at</dt>
            <dd>
              {release.max_failure_percent}% failed, once {release.min_failures} have
            </dd>
          </div>
          <div>
            <dt>Rolls back to</dt>
            <dd>{release.rollback_version ?? "The last release that installed cleanly"}</dd>
          </div>
          {release.notes ? (
            <div>
              <dt>Notes</dt>
              <dd>{release.notes}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <form className="console-form" onSubmit={save}>
          <div className="threshold-grid">
            <label className="field">
              <span>Share of all bags</span>
              <div className="unit-input">
                <input
                  className="console-input"
                  type="number"
                  min={0}
                  max={100}
                  value={percent}
                  onChange={(event) => setPercent(event.target.value)}
                />
                <i>%</i>
              </div>
            </label>
            <label className="field">
              <span>Notes</span>
              <input className="console-input" value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} />
            </label>
          </div>
          <div className="threshold-grid">
            <label className="field">
              <span>Stop when failures reach</span>
              <div className="unit-input">
                <input
                  className="console-input"
                  type="number"
                  min={1}
                  max={100}
                  value={failurePercent}
                  onChange={(event) => setFailurePercent(event.target.value)}
                />
                <i>%</i>
              </div>
            </label>
            <label className="field">
              <span>…once at least this many fail</span>
              <input
                className="console-input"
                type="number"
                min={1}
                max={1000}
                value={minFailures}
                onChange={(event) => setMinFailures(event.target.value)}
              />
            </label>
            <label className="field">
              <span>If it stops, roll bags back to</span>
              <ConsoleSelect
                label="Roll bags back to"
                value={rollbackTo}
                onValueChange={setRollbackTo}
                options={[
                  { value: "none", label: "The last release that installed cleanly" },
                  ...releases
                    .filter((other) => other.id !== release.id && other.status !== "draft")
                    .map((other) => ({ value: other.id, label: other.version })),
                ]}
              />
            </label>
          </div>
          <label className="field">
            <span>Always include these bags (device IDs, one per line)</span>
            <textarea className="console-input" rows={3} value={devices} onChange={(event) => setDevices(event.target.value)} />
          </label>
          {!validList ? <p className="console-alert error">Each line must be a device ID.</p> : null}
          {change.isError ? (
            <p role="alert" className="console-alert error">
              {message(change.error, "Couldn’t change the rollout.")}
            </p>
          ) : null}
          <div className="form-actions">
            <small>Bags pick up changes with their next upload. A bag is never offered a release it failed, unless you retry.</small>
            <div className="trace-flags">
              <button className="console-secondary" type="submit" disabled={change.isPending || !validList}>
                Save rollout
              </button>
              {release.status === "active" ? (
                <button className="console-secondary" type="button" disabled={change.isPending} onClick={() => change.mutate({ status: "paused" })}>
                  Pause
                </button>
              ) : (
                <button className="console-button" type="button" disabled={change.isPending} onClick={() => change.mutate({ status: "active" })}>
                  {release.status === "paused" ? "Resume" : "Start rollout"}
                </button>
              )}
              {release.failed > 0 ? (
                <button className="console-secondary" type="button" disabled={change.isPending} onClick={() => change.mutate({ retry_failed: true })}>
                  Retry failed
                </button>
              ) : null}
              <button className="console-danger" type="button" disabled={change.isPending} onClick={() => change.mutate({ status: "retired" })}>
                Retire
              </button>
            </div>
          </div>
        </form>
      )}
      <h3>Bags offered this release</h3>
      {detail.isPending ? (
        <LoadingState />
      ) : detail.isError ? (
        <ErrorState message={detail.error.message} retry={() => detail.refetch()} />
      ) : !detail.data.installs.length ? (
        <p className="cell-sub">None yet: bags are offered it with their next upload once it’s rolling out.</p>
      ) : (
        <ul className="trace-history">
          {detail.data.installs.map((install) => (
            <li key={install.device_id}>
              <strong>{install.serial_number}</strong>
              <span>
                <span className={`trace-badge ${install.status === "installed" ? "lime" : install.status === "failed" ? "severe" : "info"}`}>
                  {install.status}
                </span>{" "}
                {install.detail ?? ""} · {timeLabel(install.updated_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
