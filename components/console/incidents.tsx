"use client";
// An incident, opened over the Alerts page: the alert it started from, who has it, and what to
// do next (assign, escalate, note, resolve with what was done, reopen), its log, and the
// support requests about the same bag.
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  LifeBuoy,
  LoaderCircle,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import { api } from "@/lib/console/api";
import type { IncidentDetail } from "@/lib/console/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { can } from "@/lib/console/roles";
import { useConsole, useUsers } from "./provider";
import { ConsoleSelect } from "./select";
import { dateLabel, ErrorState, LoadingState } from "./shared";
import "@/app/incidents.css";

const actionLabel: Record<IncidentDetail["events"][number]["action"], string> = {
  acknowledged: "Acknowledged",
  assigned: "Assigned",
  unassigned: "Unassigned",
  escalated: "Escalated",
  resolved: "Resolved",
  reopened: "Reopened",
  noted: "Note",
};

function stamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function IncidentDialog({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="console-dialog incident-dialog">
        {id ? <IncidentView id={id} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function IncidentView({ id }: { id: string }) {
  const { base, user } = useConsole();
  const client = useQueryClient();
  const users = useUsers();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const detail = useQuery({
    queryKey: ["incident", id],
    queryFn: ({ signal }) => api<IncidentDetail>(`admin/incidents/${id}`, { signal }),
  });
  const act = useMutation({
    mutationFn: (body: { action: string; assignee?: string; note?: string }) =>
      api<IncidentDetail>(`admin/incidents/${id}/actions`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (next) => {
      client.setQueryData(["incident", id], next);
      client.invalidateQueries({ queryKey: ["fleet-alerts"] });
      client.invalidateQueries({ queryKey: ["incidents"] });
      setNote("");
      setError("");
    },
    onError: (cause) => setError(cause.message),
  });

  if (detail.isPending) return <LoadingState />;
  if (detail.isError)
    return <ErrorState message={detail.error.message} retry={() => detail.refetch()} />;
  const { incident, events, requests } = detail.data;
  const resolved = incident.status === "resolved";
  // Incidents are worked by support, operations and administrators; other staff can follow them.
  const handles = can(user.role, "incidents");
  const staff = (users.data ?? []).filter((item) => can(item.role, "incidents"));
  const typed = note.trim();

  return (
    <div className="incident">
      <DialogHeader>
        <span
          className={`incident-state ${resolved ? "resolved" : incident.escalated ? "escalated" : "open"}`}
        >
          {resolved ? "Resolved" : incident.escalated ? "Escalated" : "Acknowledged"}
        </span>
        <DialogTitle>{incident.title}</DialogTitle>
        <DialogDescription>
          {incident.body} · alerted {stamp(incident.alerted_at)}
          {incident.owner_email ? ` · ${incident.owner_email}` : ""}
          {incident.device_id && incident.device_serial ? (
            <>
              {" · "}
              <Link
                className="serial-link"
                href={`${base}/devices/${incident.device_id}`}
              >
                {incident.device_serial}
              </Link>
            </>
          ) : null}
        </DialogDescription>
      </DialogHeader>

      <div className="incident-controls">
        {handles ? (
          <label>
            <span>Assigned to</span>
            <ConsoleSelect
              compact
              label="Assigned to"
              value={incident.assignee_id ?? "none"}
              disabled={act.isPending}
              onValueChange={(assignee) => act.mutate({ action: "assign", assignee })}
              options={[
                { value: "none", label: "Nobody" },
                ...(incident.assignee_id &&
                !staff.some((item) => item.id === incident.assignee_id)
                  ? [
                      {
                        value: incident.assignee_id,
                        label: incident.assignee_email ?? "Someone",
                      },
                    ]
                  : []),
                ...staff.map((item) => ({
                  value: item.id,
                  label: item.id === user.id ? `${item.email} (you)` : item.email,
                })),
              ]}
            />
          </label>
        ) : (
          <p className="incident-assignee">
            Assigned to {incident.assignee_email ?? "nobody"}
          </p>
        )}
        {incident.resolution ? (
          <p className="incident-resolution">
            <CheckCircle2 size={15} /> {incident.resolution}
          </p>
        ) : null}
      </div>

      {handles ? (
        <div className="incident-compose">
          <textarea
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              resolved
                ? "Why it's being reopened (optional)"
                : "A note, or what was done to resolve it"
            }
            aria-label="Note"
          />
          <div>
            {resolved ? (
              <Button
                className="console-secondary"
                disabled={act.isPending}
                onClick={() =>
                  act.mutate({ action: "reopen", ...(typed ? { note: typed } : {}) })
                }
              >
                <RotateCcw size={15} /> Reopen
              </Button>
            ) : (
              <>
                <Button
                  className="console-secondary"
                  disabled={act.isPending || !typed}
                  onClick={() => act.mutate({ action: "note", note: typed })}
                >
                  <StickyNote size={15} /> Add note
                </Button>
                {!incident.escalated ? (
                  <Button
                    className="console-danger"
                    disabled={act.isPending}
                    onClick={() =>
                      act.mutate({
                        action: "escalate",
                        ...(typed ? { note: typed } : {}),
                      })
                    }
                  >
                    <AlertTriangle size={15} /> Escalate
                  </Button>
                ) : null}
                <Button
                  className="console-button"
                  disabled={act.isPending || !typed}
                  onClick={() => act.mutate({ action: "resolve", note: typed })}
                >
                  {act.isPending ? (
                    <LoaderCircle className="animate-spin" size={15} />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}{" "}
                  Resolve
                </Button>
              </>
            )}
          </div>
          {!resolved && !typed ? (
            <small>Resolving needs a line on what was done.</small>
          ) : null}
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {requests.length ? (
        <section className="incident-requests">
          <h3>Support requests about this bag</h3>
          <ul>
            {requests.map((request) => (
              <li key={request.id}>
                <Link href={`${base}/support/${request.id}`}>
                  <LifeBuoy size={14} /> {request.subject}
                </Link>
                <small>
                  {request.reference} · {request.status} · {dateLabel(request.created_at)}
                </small>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="incident-log">
        <h3>History</h3>
        <ol>
          {events.map((event, index) => (
            <li key={index} data-action={event.action}>
              <strong>{actionLabel[event.action]}</strong>
              {event.note ? <span>{event.note}</span> : null}
              <small>
                {event.actor_email ?? "Someone"} · {stamp(event.created_at)}
              </small>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
