"use client";
import { useCallback, useState } from "react";
import { useConsole, useResource } from "./console-context";
import { ClaimHandoff } from "./claim-handoff";
import {
  SectionPage,
  ButtonLink,
  LoadingState,
  ErrorState,
  StatusBadge,
  Notice,
  Field,
  ConfirmDialog,
  Pagination,
  formatDate,
} from "@/components/console-ui";
import { validMetadata } from "@/lib/api/validation";
import type { ProvisionedDevice } from "@/lib/api/types";
export function DeviceDetail({ id }: { id: string }) {
  const api = useConsole();
  const [offset, setOffset] = useState(0);
  const load = useCallback(async () => {
    const [device, audit] = await Promise.all([
      api.getDevice(id),
      api.listDeviceAudit(id, { limit: 5, offset }),
    ]);
    return { device, audit };
  }, [api, id, offset]);
  const { data, error, loading, retry } = useResource(load);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<unknown>(null);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<"revoke" | "rotate" | null>(null);
  const [handoff, setHandoff] = useState<ProvisionedDevice | null>(null);
  const d = data?.device;
  return (
    <SectionPage
      title="Device details"
      description={`Devices / ${d?.serial_number ?? "Selected record"}`}
      actions={
        <ButtonLink href="/devices" secondary>
          Back to devices
        </ButtonLink>
      }
    >
      {handoff ? (
        <ClaimHandoff
          result={handoff}
          secondaryLabel="Back to details"
          onAnother={() => {
            setHandoff(null);
            retry();
          }}
        />
      ) : loading ? (
        <LoadingState label="Loading device details" />
      ) : error ? (
        <ErrorState error={error} retry={retry} />
      ) : (
        d && (
          <>
            {message && <Notice title={message} tone="success" />}
            {failure != null && <ErrorState error={failure} />}
            <div className="row">
              <h2 className="grow mono">{d.serial_number}</h2>
              <StatusBadge status={d.status} />
              {d.status !== "revoked" && (
                <button
                  className="btn"
                  onClick={() => {
                    setEditing(true);
                    setFailure(null);
                  }}
                >
                  Edit metadata
                </button>
              )}
            </div>
            <p className="small muted mono">Device UUID · {d.id}</p>
            <div className="detail-grid">
              <section className="panel panel-body stack">
                <h2>Identity &amp; ownership</h2>
                <dl className="details">
                  <div>
                    <dt>Serial number · Immutable</dt>
                    <dd className="mono">{d.serial_number}</dd>
                  </div>
                  <div>
                    <dt>Nickname · Read-only</dt>
                    <dd>{d.nickname ?? "Not set"}</dd>
                  </div>
                  <div>
                    <dt>Manufacturer account</dt>
                    <dd className="mono">{d.manufacturer_id}</dd>
                  </div>
                  <div>
                    <dt>Owner ID</dt>
                    <dd className="mono">
                      {d.owner_id ?? "No owner assigned"}
                    </dd>
                  </div>
                  <div>
                    <dt>Claimed at</dt>
                    <dd>
                      {d.claimed_at ? formatDate(d.claimed_at) : "Not claimed"}
                    </dd>
                  </div>
                  <div>
                    <dt>Created at · UTC</dt>
                    <dd>{formatDate(d.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Updated at · UTC</dt>
                    <dd>{formatDate(d.updated_at)}</dd>
                  </div>
                </dl>
              </section>
              <section className="panel panel-body stack">
                <h2>Editable registry metadata</h2>
                {editing ? (
                  <form
                    className="form-grid"
                    noValidate
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      const model = String(form.get("model") || "");
                      const firmware_version = String(
                        form.get("firmware_version") || "",
                      );
                      const next: Record<string, string> = {};
                      if (!validMetadata(model, 128))
                        next.model =
                          "Enter a model of at most 128 UTF-8 bytes.";
                      if (!validMetadata(firmware_version, 64))
                        next.firmware_version =
                          "Enter a declared version of at most 64 UTF-8 bytes.";
                      setErrors(next);
                      if (Object.keys(next).length) return;
                      setBusy(true);
                      try {
                        await api.updateDevice(id, { model, firmware_version });
                        setEditing(false);
                        setMessage("Metadata saved in this demo.");
                        retry();
                      } catch (e) {
                        setFailure(e);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <Field label="Model" name="model" error={errors.model}>
                      <input
                        id="model"
                        name="model"
                        defaultValue={d.model}
                        disabled={busy}
                        aria-invalid={Boolean(errors.model)}
                        aria-describedby={
                          errors.model ? "model-error" : undefined
                        }
                      />
                    </Field>
                    <Field
                      label="Declared firmware version"
                      name="firmware_version"
                      error={errors.firmware_version}
                    >
                      <input
                        id="firmware_version"
                        name="firmware_version"
                        defaultValue={d.firmware_version}
                        disabled={busy}
                        aria-invalid={Boolean(errors.firmware_version)}
                        aria-describedby={
                          errors.firmware_version
                            ? "firmware_version-error"
                            : undefined
                        }
                      />
                    </Field>
                    <div className="form-actions">
                      <button className="btn" disabled={busy}>
                        {busy ? "Saving…" : "Save metadata"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busy}
                        onClick={() => setEditing(false)}
                      >
                        Cancel editing
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="details">
                    <div>
                      <dt>Model</dt>
                      <dd>{d.model}</dd>
                    </div>
                    <div>
                      <dt>Declared firmware version</dt>
                      <dd>{d.firmware_version}</dd>
                    </div>
                  </dl>
                )}
                <p className="small muted">
                  A declared value, not a measured version. Serial,
                  manufacturer, status, nickname and ownership are read-only
                  here.
                </p>
              </section>
            </div>
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Registry audit history</h2>
                  <p className="small muted">
                    Illustrative records · Action strings are shown as supplied
                    · All times UTC
                  </p>
                </div>
              </div>
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Device audit table"
              >
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Action</th>
                      <th scope="col">Actor ID</th>
                      <th scope="col">Created at · UTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audit.items.map((a) => (
                      <tr key={a.id}>
                        <td>{a.action}</td>
                        <td className="mono">{a.actor_id}</td>
                        <td>
                          {new Date(a.created_at)
                            .toISOString()
                            .replace("T", " ")
                            .replace(".000Z", " UTC")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data.audit.items.length && (
                  <p className="empty-state">No audit records on this page.</p>
                )}
              </div>
              <Pagination
                offset={offset}
                limit={5}
                count={data.audit.items.length}
                onPage={setOffset}
              />
            </section>
            <div className="detail-grid">
              <section className="panel panel-body stack">
                <h2>Claim-code handoff</h2>
                <p className="small muted">
                  The original code cannot be retrieved. Only an unclaimed,
                  non-revoked registry record is eligible for a replacement.
                </p>
                <div>
                  <button
                    className="btn btn-secondary"
                    disabled={d.status !== "registered" || Boolean(d.owner_id)}
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setAction("rotate");
                    }}
                  >
                    Replace claim code
                  </button>
                </div>
              </section>
              <section className="panel panel-body stack">
                <h2>Revoke registry record</h2>
                <p className="small muted">
                  Revocation disables claiming and further registry updates. It
                  does not lock or wipe the bag.
                </p>
                <div>
                  <button
                    className="btn btn-danger"
                    disabled={d.status === "revoked"}
                    onClick={(e) => {
                      e.currentTarget.focus();
                      setAction("revoke");
                    }}
                  >
                    Revoke device
                  </button>
                </div>
              </section>
            </div>
          </>
        )
      )}
      {action && (
        <ConfirmDialog
          title={
            action === "revoke"
              ? "Revoke this device?"
              : "Replace the claim code?"
          }
          description={
            action === "revoke"
              ? "This disables claiming and registry edits. It does not physically lock or wipe hardware. The local demo does not contact a device."
              : "The previous code becomes invalid. Save the new one-time code securely before leaving its result."
          }
          confirm={action === "revoke" ? "Revoke device" : "Replace code"}
          danger={action === "revoke"}
          onClose={() => setAction(null)}
          onConfirm={async () => {
            if (action === "revoke") {
              await api.revokeDevice(id);
              setMessage("Registry record revoked in this demo.");
              retry();
            } else setHandoff(await api.rotateClaimCode(id));
          }}
        />
      )}
    </SectionPage>
  );
}
