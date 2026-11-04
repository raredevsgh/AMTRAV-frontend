"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { api } from "@/lib/console/api";
import { previewSecurityEvents, previewSessions } from "@/lib/console/demo";
import type { SecurityEvent, SessionInfo } from "@/lib/console/types";
import { useConsoleStore } from "@/stores/console-store";
import { useConsole } from "./provider";
import { dateLabel, ErrorState, LoadingState, PageHeading, timeLabel } from "./shared";
import { MfaSettings } from "./mfa";
import { wipeLocalData } from "./offline";

export function SecurityPage() {
  const { user, preview } = useConsole();
  const router = useRouter();
  const client = useQueryClient();
  const [confirmAll, setConfirmAll] = useState(false);

  const sessions = useQuery({
    queryKey: ["sessions", user.id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve(previewSessions)
        : api<SessionInfo[]>("auth/sessions", { signal }),
  });
  const events = useQuery({
    queryKey: ["security-events", user.id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve(previewSecurityEvents)
        : api<SecurityEvent[]>("admin/security-events?limit=100", { signal }),
    enabled: user.role === "admin",
  });

  async function leave() {
    await wipeLocalData(client);
    useConsoleStore.getState().reset();
    router.replace("/sign-in");
  }
  const revoke = useMutation({
    mutationFn: (session: SessionInfo) =>
      api(`auth/sessions/${session.id}/revoke`, { method: "POST" }),
    onSuccess: (_, session) => {
      if (session.current) leave();
      else client.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
  const revokeAll = useMutation({
    mutationFn: () => api("auth/sessions/revoke-all", { method: "POST" }),
    onSuccess: leave,
  });

  return (
    <>
      <PageHeading
        title="Security"
        description="Review where your account is signed in and end sessions you don’t recognise."
      >
        {confirmAll ? (
          <>
            <button
              className="console-danger"
              disabled={preview || revokeAll.isPending}
              onClick={() => revokeAll.mutate()}
            >
              {revokeAll.isPending ? "Signing out…" : "Confirm: sign out everywhere"}
            </button>
            <button className="console-button" onClick={() => setConfirmAll(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button
            className="console-danger"
            disabled={preview}
            onClick={() => setConfirmAll(true)}
          >
            <LogOut size={16} /> Sign out everywhere
          </button>
        )}
      </PageHeading>
      {(revoke.isError || revokeAll.isError) && (
        <p className="console-alert error" role="alert">
          {(revoke.error || revokeAll.error)?.message}
        </p>
      )}
      <MfaSettings />
      <section className="console-card">
        <div className="card-heading">
          <h2>Active sessions</h2>
          <span className="count-badge">{sessions.data?.length || 0}</span>
        </div>
        {sessions.isPending ? (
          <LoadingState />
        ) : sessions.isError ? (
          <ErrorState message={sessions.error.message} retry={() => sessions.refetch()} />
        ) : (
          <>
            <ul className="file-list">
              {sessions.data.map((session) => (
                <li key={session.id}>
                  <span className="file-icon">
                    <MonitorSmartphone size={22} />
                  </span>
                  <div>
                    <strong>
                      {session.client || "Unknown client"}
                      {session.current && " · this session"}
                    </strong>
                    <p>
                      {session.method === "google" ? "Google" : "Password"} sign-in ·
                      started {timeLabel(session.created_at)} · expires{" "}
                      {dateLabel(session.expires_at)}
                    </p>
                  </div>
                  <button
                    className="console-button"
                    disabled={preview || revoke.isPending}
                    onClick={() => revoke.mutate(session)}
                  >
                    {session.current ? "Sign out" : "End session"}
                  </button>
                </li>
              ))}
            </ul>
            <p className="field-hint">
              Sessions started before session review was available are not listed. Sign
              out everywhere also ends those.
            </p>
          </>
        )}
      </section>
      {user.role === "admin" && (
        <section className="console-card">
          <div className="card-heading">
            <h2>Security audit trail</h2>
            <ShieldCheck size={20} />
          </div>
          {events.isPending ? (
            <LoadingState />
          ) : events.isError ? (
            <ErrorState message={events.error.message} retry={() => events.refetch()} />
          ) : !events.data.length ? (
            <div className="console-empty">
              <p>No security events recorded yet.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="console-table">
                <thead>
                  <tr>
                    <th>Time (UTC)</th>
                    <th>Action</th>
                    <th>Outcome</th>
                    <th>Actor</th>
                    <th>Subject</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data.map((event) => (
                    <tr key={event.id}>
                      <td>{timeLabel(event.occurred_at)}</td>
                      <td className="mono">{event.action}</td>
                      <td>
                        <span className={`device-status ${event.outcome}`}>
                          {event.outcome}
                        </span>
                      </td>
                      <td className="mono">{event.actor_id?.slice(0, 8) || "—"}</td>
                      <td className="mono">
                        {event.subject_type
                          ? `${event.subject_type} ${event.subject_id?.slice(0, 8)}`
                          : "—"}
                      </td>
                      <td>{event.detail || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
