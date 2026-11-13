"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, LoaderCircle, Plus } from "lucide-react";
import { api } from "@/lib/console/api";
import type { JobReceipt, JobResult, User, StaffRole } from "@/lib/console/types";
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
import { useConsole, useDevices, useUsers } from "./provider";
import { PageHeading, LoadingState, ErrorState, dateLabel, StatusBadge } from "./shared";
import { ConsoleSelect } from "./select";
import { roleHints, roleLabels } from "@/lib/console/roles";

/** The roles an administrator can give a staff account, in the order they're offered. */
const assignable: StaffRole[] = [
  "admin",
  "support",
  "operations",
  "finance",
  "read_only",
  "manufacturer",
];

type Credentials = { email: string; password: string };

export function ManufacturersPage() {
  const { user, preview } = useConsole();
  const users = useUsers();
  const devices = useDevices();
  const client = useQueryClient();
  const [receipt, setReceipt] = useState<JobReceipt | null>(null);
  const [roleChange, setRoleChange] = useState<{ user: User; role: StaffRole } | null>(
    null,
  );
  const [staffAction, setStaffAction] = useState<{
    user: User;
    kind: "mfa" | "sessions";
  } | null>(null);
  const runStaffAction = useMutation({
    mutationFn: () =>
      api(
        staffAction!.kind === "mfa"
          ? `admin/users/${staffAction!.user.id}/mfa/reset`
          : `admin/users/${staffAction!.user.id}/sessions/revoke`,
        { method: "POST" },
      ),
    onSuccess: () => {
      setStaffAction(null);
      client.invalidateQueries({ queryKey: ["users"] });
    },
  });
  const form = useForm<Credentials>();
  const create = useMutation({
    mutationFn: (values: Credentials) =>
      api<JobReceipt>("admin/manufacturers", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (value) => {
      setReceipt(value);
      form.reset();
    },
  });
  const job = useQuery({
    queryKey: ["manufacturer-job", receipt?.job_id],
    queryFn: () =>
      api<JobResult>(`auth/jobs/${receipt!.job_id}`, {
        headers: { "X-Job-Receipt": receipt!.receipt },
      }),
    enabled: !!receipt,
    refetchInterval: (query) =>
      query.state.error ||
      ["completed", "expired"].includes(query.state.data?.status || "")
        ? false
        : Math.max(1000, receipt?.poll_after_ms || 1000),
    refetchOnWindowFocus: false,
  });
  const completed = job.data?.status === "completed";
  const successful = completed && (job.data?.http_status || 500) < 300;
  useEffect(() => {
    if (successful) client.invalidateQueries({ queryKey: ["users"] });
  }, [successful, client]);
  const updateRole = useMutation({
    mutationFn: () =>
      api<User>(`admin/users/${roleChange!.user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: roleChange!.role }),
      }),
    onSuccess: () => {
      setRoleChange(null);
      client.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (user.role !== "admin")
    return (
      <div className="console-empty">
        <h1>Admin access required</h1>
        <p>Only administrators can create or manage staff accounts.</p>
      </div>
    );
  if (users.isPending) return <LoadingState />;
  if (users.isError)
    return <ErrorState message={users.error.message} retry={() => users.refetch()} />;
  const staff = users.data.filter((u) => u.role !== "user");
  return (
    <>
      <PageHeading
        title="Manufacturers and staff"
        description="Create manufacturer accounts and manage access to the console."
      />
      <div className="console-form-layout">
        <section className="console-card staff-list">
          <div className="card-heading">
            <h2>Staff accounts</h2>
            <span className="count-badge">{staff.length}</span>
          </div>
          {staff.map((member) => (
            <article key={member.id}>
              <span className="staff-avatar">
                <Building2 size={20} />
              </span>
              <div>
                <strong>{member.email}</strong>
                <p>Since {dateLabel(member.created_at)}</p>
                <small>
                  {devices.data
                    ? `${devices.data.filter((d) => d.manufacturer_id === member.id).length} devices`
                    : "Inventory loading…"}
                  {" · "}
                  {member.mfa_enabled ? "2-step on" : "2-step off"}
                </small>
                {member.id !== user.id && (
                  <div className="staff-actions">
                    <button
                      disabled={preview || !member.mfa_enabled}
                      onClick={() => {
                        runStaffAction.reset();
                        setStaffAction({ user: member, kind: "mfa" });
                      }}
                    >
                      Reset 2-step
                    </button>
                    <button
                      disabled={preview}
                      onClick={() => {
                        runStaffAction.reset();
                        setStaffAction({ user: member, kind: "sessions" });
                      }}
                    >
                      Sign out everywhere
                    </button>
                  </div>
                )}
              </div>
              {member.id === user.id ? (
                <StatusBadge status="admin · you" />
              ) : (
                <ConsoleSelect
                  compact
                  label={`Role for ${member.email}`}
                  value={member.role}
                  disabled={preview}
                  onValueChange={(role) => {
                    updateRole.reset();
                    setRoleChange({ user: member, role: role as StaffRole });
                  }}
                  options={assignable.map((role) => ({
                    value: role,
                    label: roleLabels[role],
                  }))}
                />
              )}
            </article>
          ))}
        </section>
        <section className="console-card create-maker">
          <span className="auth-lock">
            <Plus size={23} />
          </span>
          <h2>Add manufacturer</h2>
          <p>Create their account and share their sign-in details privately.</p>
          {receipt ? (
            <div className="job-progress" aria-live="polite">
              {successful ? (
                <>
                  <CheckCircle2 size={30} />
                  <h3>Account created.</h3>
                  <p>
                    {job.data?.result && "email" in job.data.result
                      ? job.data.result.email
                      : "The manufacturer can now sign in."}
                  </p>
                  <Button
                    className="console-button"
                    onClick={() => {
                      setReceipt(null);
                      create.reset();
                    }}
                  >
                    Add another
                  </Button>
                </>
              ) : completed ? (
                <>
                  <h3>Account wasn’t created.</h3>
                  <p>
                    {job.data?.result && "error" in job.data.result
                      ? job.data.result.error
                      : "Please try again."}
                  </p>
                  <Button
                    onClick={() => {
                      setReceipt(null);
                      create.reset();
                    }}
                  >
                    Try again
                  </Button>
                </>
              ) : job.isError ? (
                <>
                  <p>{job.error.message}</p>
                  <Button onClick={() => job.refetch()}>Check status again</Button>
                  <p className="small-note">
                    Keep this page open. Check the account list before submitting again.
                  </p>
                </>
              ) : job.data?.status === "expired" ? (
                <>
                  <p>This request expired. Check the account list before trying again.</p>
                  <Button onClick={() => setReceipt(null)}>Back to form</Button>
                </>
              ) : (
                <>
                  <LoaderCircle className="animate-spin" />
                  <h3>Creating the account…</h3>
                  <p>You can keep working. This usually takes a few seconds.</p>
                </>
              )}
            </div>
          ) : (
            <form
              className="console-form"
              onSubmit={form.handleSubmit((values) => create.mutate(values))}
            >
              <div className="field">
                <Label htmlFor="maker-email">Work email</Label>
                <Input
                  id="maker-email"
                  type="email"
                  autoComplete="off"
                  placeholder="factory@brand.com"
                  {...form.register("email", { required: true })}
                />
              </div>
              <div className="field">
                <Label htmlFor="maker-password">Initial password</Label>
                <Input
                  id="maker-password"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("password", {
                    required: true,
                    validate: (value) => {
                      const bytes = new TextEncoder().encode(value).length;
                      return (bytes >= 12 && bytes <= 128) || "Use 12–128 UTF-8 bytes.";
                    },
                  })}
                  aria-invalid={!!form.formState.errors.password}
                />
                <p>Use 12–128 bytes. Share it privately.</p>
                {form.formState.errors.password && (
                  <span className="field-error">
                    {form.formState.errors.password.message}
                  </span>
                )}
              </div>
              {create.isError && (
                <p className="console-alert error" role="alert">
                  {create.error.message}
                </p>
              )}
              <Button className="console-button" disabled={preview || create.isPending}>
                {create.isPending ? "Submitting…" : "Create account"}
              </Button>
            </form>
          )}
        </section>
      </div>
      <Dialog
        open={!!staffAction}
        onOpenChange={(open) =>
          !open && !runStaffAction.isPending && setStaffAction(null)
        }
      >
        <DialogContent className="console-dialog">
          <DialogHeader>
            <DialogTitle>
              {staffAction?.kind === "mfa"
                ? "Reset two-step verification?"
                : "Sign out on every device?"}
            </DialogTitle>
            <DialogDescription>
              {staffAction?.kind === "mfa"
                ? `${staffAction?.user.email}'s authenticator app, passkeys and recovery codes will be removed and they will be signed out everywhere. Do this only after confirming their identity, for example when they lose a device.`
                : `${staffAction?.user.email} will need to sign in again on every device.`}
            </DialogDescription>
          </DialogHeader>
          {runStaffAction.isError && (
            <p className="console-alert error" role="alert">
              {runStaffAction.error.message}
            </p>
          )}
          <div className="console-actions">
            <Button
              className="console-secondary"
              onClick={() => setStaffAction(null)}
              disabled={runStaffAction.isPending}
            >
              Cancel
            </Button>
            <Button
              className="console-danger"
              onClick={() => runStaffAction.mutate()}
              disabled={runStaffAction.isPending}
            >
              {staffAction?.kind === "mfa" ? "Reset 2-step" : "Sign out everywhere"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!roleChange}
        onOpenChange={(open) => !open && !updateRole.isPending && setRoleChange(null)}
      >
        <DialogContent className="console-dialog">
          <DialogHeader>
            <DialogTitle>Change account access?</DialogTitle>
            <DialogDescription>
              {roleChange?.user.email} will have the{" "}
              {roleChange ? roleLabels[roleChange.role] : ""} role:{" "}
              {roleChange
                ? roleHints[roleChange.role].replace(/\.$/, "").toLowerCase()
                : ""}
              . This signs them out on every device.
            </DialogDescription>
          </DialogHeader>
          {updateRole.isError && (
            <p className="console-alert error" role="alert">
              {updateRole.error.message}
            </p>
          )}
          <div className="console-actions">
            <Button
              className="console-secondary"
              onClick={() => setRoleChange(null)}
              disabled={updateRole.isPending}
            >
              Cancel
            </Button>
            <Button
              className="console-button"
              onClick={() => updateRole.mutate()}
              disabled={updateRole.isPending}
            >
              Confirm role change
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
