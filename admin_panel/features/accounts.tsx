"use client";
import { useCallback, useEffect, useState } from "react";
import { useConsole, useResource } from "./console-context";
import {
  SectionPage,
  LoadingState,
  ErrorState,
  Notice,
  EmptyState,
  Field,
  ConfirmDialog,
  Pagination,
  formatDate,
  errorText,
} from "@/components/console-ui";
import { RoleBadge } from "@/components/role-badge";
import { toAdminRole } from "@/lib/admin-sections";
import { validEmail, validPassword } from "@/lib/api/validation";
import type { JobReceipt, JobResult, Role, User } from "@/lib/api/types";
export function Accounts() {
  const api = useConsole();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(50);
  const load = useCallback(
    () => api.listUsers({ limit, offset }),
    [api, limit, offset],
  );
  const { data, error, loading, retry } = useResource(load);
  const [change, setChange] = useState<{ user: User; role: Role } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<unknown>(null);
  const [job, setJob] = useState<JobReceipt | null>(null);
  const [jobState, setJobState] = useState<JobResult | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!job) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expires = Date.now() + job.expires_in * 1000;
    const poll = async () => {
      try {
        const result = await api.getJob(job.job_id, job.receipt);
        if (!active) return;
        setJobState(result);
        if (result.status === "completed") {
          if (
            result.http_status != null &&
            result.http_status >= 200 &&
            result.http_status < 300
          ) {
            setMessage(
              "Example manufacturer created. No email was sent and no production account was created.",
            );
            retry();
          } else setFailure(new Error("creation failed"));
          setJob(null);
        } else if (result.status === "expired" || Date.now() >= expires) {
          setJobState({ status: "expired", http_status: 410, result: null });
          setFailure(new Error("job expired"));
          setJob(null);
        } else timer = setTimeout(poll, Math.max(0, job.poll_after_ms));
      } catch (e) {
        if (active) {
          setFailure(e);
          setJob(null);
        }
      }
    };
    timer = setTimeout(poll, Math.max(0, job.poll_after_ms));
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [api, job, retry]);
  return (
    <SectionPage
      title="Accounts"
      description="Admin only. Create manufacturer accounts and manage staff roles."
    >
      {loading ? (
        <LoadingState label="Loading accounts" />
      ) : (
        <>
          {message && <Notice title={message} tone="success" />}
          <div className="split">
            <section className="panel">
              <div className="panel-heading">
                <h2>Accounts</h2>
                <span className="small muted">
                  {data?.items.length ?? 0} records on this page · UUIDs
                  shortened
                </span>
              </div>
              {error ? (
                <ErrorState error={error} retry={retry} />
              ) : !data?.items.length ? (
                <EmptyState title="No accounts on this page" />
              ) : (
                <div
                  className="table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Accounts table"
                >
                  <table className="data-table accounts-table">
                    <thead>
                      <tr>
                        <th scope="col">Email / user UUID</th>
                        <th scope="col">Role</th>
                        <th scope="col">Verified</th>
                        <th scope="col">Created</th>
                        <th scope="col">
                          <span className="sr-only">Role action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>
                              {user.email}
                              {user.id === api.session.id ? " · You" : ""}
                            </strong>
                            <p className="mono muted mt-1" title={user.id}>
                              UUID · {user.id.slice(0, 8)}…{user.id.slice(-4)}
                            </p>
                          </td>
                          <td>
                            <RoleBadge
                              role={toAdminRole(user.role) ?? "user"}
                            />
                          </td>
                          <td>{user.email_verified ? "Yes" : "No"}</td>
                          <td>{formatDate(user.created_at)}</td>
                          <td>
                            {user.id === api.session.id ||
                            user.role === "user" ? (
                              <span className="small muted">
                                {user.id === api.session.id
                                  ? "Self · Read-only"
                                  : "Mobile user · Read-only"}
                              </span>
                            ) : (
                              <label>
                                <span className="sr-only">
                                  Change role for {user.email}
                                </span>
                                <select
                                  aria-label={`Role for ${user.email}`}
                                  value={user.role}
                                  onChange={(e) => {
                                    const role = e.target.value;
                                    if (
                                      role === "admin" ||
                                      role === "manufacturer"
                                    )
                                      setChange({ user, role });
                                  }}
                                >
                                  <option value="manufacturer">
                                    Manufacturer
                                  </option>
                                  <option value="admin">Admin</option>
                                </select>
                              </label>
                            )}
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
            <aside className="panel panel-body stack">
              <h2>Create manufacturer</h2>
              <p className="small muted">
                Create a password account with the manufacturer role. Required
                fields below.
              </p>
              <form
                className="form-grid"
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  const element = e.currentTarget;
                  const form = new FormData(element);
                  const email = String(form.get("manufacturer-email") || "");
                  const password = String(form.get("temporary-password") || "");
                  const next: Record<string, string> = {};
                  if (!validEmail(email))
                    next.email = "Enter a valid work email address.";
                  else if (!email.endsWith(".invalid"))
                    next.email =
                      "Use a fictional .invalid address in the demo.";
                  if (!validPassword(password))
                    next.password =
                      "Use 12–128 UTF-8 bytes, not character count.";
                  setErrors(next);
                  setFailure(null);
                  setMessage("");
                  setJobState(null);
                  if (Object.keys(next).length) return;
                  setBusy(true);
                  try {
                    const receipt = await api.createManufacturer({
                      email,
                      password,
                    });
                    element.reset();
                    setJob(receipt);
                    setJobState({
                      status: "queued",
                      http_status: null,
                      result: null,
                    });
                  } catch (e) {
                    setFailure(e);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Field
                  label="Work email · Required"
                  name="manufacturer-email"
                  error={errors.email}
                >
                  <input
                    id="manufacturer-email"
                    name="manufacturer-email"
                    type="email"
                    autoComplete="off"
                    disabled={busy || Boolean(job)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "manufacturer-email-error" : undefined
                    }
                  />
                </Field>
                <Field
                  label="Password · Required"
                  name="temporary-password"
                  error={errors.password}
                  hint="12–128 UTF-8 bytes. Share privately with the intended recipient; never post passwords or receipts."
                >
                  <input
                    id="temporary-password"
                    name="temporary-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={busy || Boolean(job)}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password
                        ? "temporary-password-error"
                        : "temporary-password-hint"
                    }
                  />
                </Field>
                <button className="btn" disabled={busy || Boolean(job)}>
                  {busy
                    ? "Submitting…"
                    : job
                      ? "Waiting for job…"
                      : "Create manufacturer"}
                </button>
              </form>
              {job && (
                <Notice title={`Creation ${jobState?.status ?? "queued"}`}>
                  The request is pending. Polling with its private receipt;
                  acceptance is not completion.
                </Notice>
              )}
              {failure != null && (
                <Notice
                  title={
                    jobState?.http_status === 409
                      ? "Account already exists. No account was created."
                      : jobState?.status === "expired"
                        ? "The request expired. Check accounts before submitting again."
                        : errorText(failure)
                  }
                  tone="error"
                />
              )}
              <Notice
                title="Password changes need administrator guidance"
                tone="warning"
              >
                No first-login password-change or password-reset API is
                connected. This demo never emails credentials or creates a
                production account.
              </Notice>
            </aside>
          </div>
          <Notice title="Role changes sign the person out everywhere">
            The real backend invalidates their existing tokens. This demo
            updates only fictional records and cannot prove live session
            invalidation. Your own role and mobile-user roles are read-only.
          </Notice>
          {change && (
            <ConfirmDialog
              title="Change this account’s role?"
              description={`${change.user.email} will become ${change.role}. The live backend invalidates existing sessions. In this demo only the local record changes.`}
              confirm="Change role"
              onClose={() => setChange(null)}
              onConfirm={async () => {
                await api.updateRole(change.user.id, { role: change.role });
                setMessage(
                  "Example role updated. No live sessions were affected.",
                );
                retry();
              }}
            />
          )}
        </>
      )}
    </SectionPage>
  );
}
