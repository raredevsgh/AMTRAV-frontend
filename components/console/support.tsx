"use client";
// Support: travellers' requests and warranty claims, answered here. The queue on the left
// (filter by status and who it's assigned to, search by reference, subject, email or serial);
// the conversation on the right, with status, priority and assignee, internal notes, files,
// and the warranty claim's decision and progress.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Inbox,
  LoaderCircle,
  Lock,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { api } from "@/lib/console/api";
import type {
  StaffTicket,
  StaffTicketDetail,
  StoredFile,
  SupportAttachment,
  TicketPriority,
  TicketStatus,
} from "@/lib/console/types";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/console/roles";
import { useConsole, useUsers } from "./provider";
import { ConsoleSelect } from "./select";
import { dateLabel, ErrorState, LoadingState, PageHeading } from "./shared";
import { FileIcon, FilePreview, sizeLabel } from "./file-preview";
import "@/app/support.css";

const kinds: Record<StaffTicket["kind"], string> = {
  question: "Question",
  damage: "Damage",
  lost: "Lost bag",
  tracker: "Tracker",
  order: "Order",
  warranty: "Warranty",
  other: "Other",
};
const statuses: Record<TicketStatus, string> = {
  open: "Open",
  waiting: "Waiting on traveller",
  resolved: "Resolved",
  closed: "Closed",
};
const priorities: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};
const parts = {
  tracker: "Tracker",
  shell: "Shell",
  wheels: "Wheels",
  handle: "Handle",
  zip: "Zip",
  other: "Other",
} as const;
const claimSteps = {
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Not approved",
  in_progress: "In progress",
  completed: "Completed",
} as const;

const views = [
  { value: "active", label: "Active" },
  { value: "open", label: "Open" },
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

function timeLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : dateLabel(value);
}

export function SupportPage({ id }: { id?: string }) {
  const { base, preview } = useConsole();
  const [view, setView] = useState("active");
  const [assignee, setAssignee] = useState("any");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  // Search as the typing settles, not on every key.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const params = new URLSearchParams({ status: view, assignee });
  if (search) params.set("q", search);
  const queue = useQuery({
    queryKey: ["support", view, assignee, search],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve([] as StaffTicket[])
        : api<StaffTicket[]>(`admin/support/tickets?${params}`, { signal }),
    refetchInterval: 30_000,
  });

  return (
    <>
      <PageHeading
        title="Support"
        description="Travellers' requests and warranty claims. Replies reach their app and phone."
      />
      <div className={`support-layout${id ? " has-ticket" : ""}`}>
        <section className="support-queue" aria-label="Requests">
          <div className="support-filters">
            <label className="console-search">
              <Search size={17} />
              <span className="sr-only">Search requests</span>
              <input
                type="search"
                placeholder="Reference, subject, email or serial"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="support-filter-row">
              <div className="segmented-control" role="group" aria-label="Status">
                {views.map((item) => (
                  <button
                    key={item.value}
                    aria-pressed={view === item.value}
                    onClick={() => setView(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <ConsoleSelect
                compact
                label="Assigned to"
                value={assignee}
                onValueChange={setAssignee}
                options={[
                  { value: "any", label: "Anyone" },
                  { value: "me", label: "Me" },
                  { value: "none", label: "Unassigned" },
                ]}
              />
            </div>
          </div>
          {queue.isPending ? (
            <LoadingState />
          ) : queue.isError ? (
            <ErrorState message={queue.error.message} retry={() => queue.refetch()} />
          ) : !queue.data.length ? (
            <div className="support-empty">
              <Inbox size={26} />
              <p>{search ? `Nothing matches “${search}”.` : "No requests here."}</p>
            </div>
          ) : (
            <ul className="support-list">
              {queue.data.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`${base}/support/${ticket.id}`}
                    className="support-row"
                    aria-current={ticket.id === id ? "page" : undefined}
                  >
                    <span className="support-row-top">
                      {ticket.unread ? (
                        <span className="support-unread" aria-label="Unread" />
                      ) : null}
                      <strong>{ticket.subject}</strong>
                      <time dateTime={ticket.last_message_at}>
                        {timeLabel(ticket.last_message_at)}
                      </time>
                    </span>
                    <span className="support-row-meta">
                      {ticket.owner_name || ticket.owner_email} · {ticket.reference}
                    </span>
                    {ticket.preview ? (
                      <span className="support-row-preview">{ticket.preview}</span>
                    ) : null}
                    <span className="support-tags">
                      <span className={`support-tag kind-${ticket.kind}`}>
                        {kinds[ticket.kind]}
                      </span>
                      {ticket.priority === "urgent" || ticket.priority === "high" ? (
                        <span className={`support-tag priority-${ticket.priority}`}>
                          {priorities[ticket.priority]}
                        </span>
                      ) : null}
                      {ticket.claim_status ? (
                        <span className="support-tag">
                          Claim: {claimSteps[ticket.claim_status]}
                        </span>
                      ) : null}
                      {view === "all" || view === "active" ? (
                        <span className={`support-tag status-${ticket.status}`}>
                          {statuses[ticket.status]}
                        </span>
                      ) : null}
                      {ticket.assignee_email ? (
                        <span
                          className="support-assignee"
                          title={`Assigned to ${ticket.assignee_email}`}
                        >
                          {ticket.assignee_email.slice(0, 1).toUpperCase()}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="support-ticket" aria-label="Conversation">
          {id ? (
            <TicketView key={id} id={id} />
          ) : (
            <div className="support-empty pick">
              <Inbox size={30} />
              <p>Choose a request to read and answer it.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function TicketView({ id }: { id: string }) {
  const { base, user } = useConsole();
  const router = useRouter();
  const client = useQueryClient();
  const users = useUsers();
  const detail = useQuery({
    queryKey: ["support-ticket", id],
    queryFn: ({ signal }) =>
      api<StaffTicketDetail>(`admin/support/tickets/${id}`, { signal }),
    refetchInterval: 20_000,
  });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["support-ticket", id] });
    client.invalidateQueries({ queryKey: ["support"] });
  };
  const change = useMutation({
    mutationFn: (body: Record<string, string>) =>
      api(`admin/support/tickets/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: refresh,
  });
  const [previewing, setPreviewing] = useState<StoredFile | null>(null);
  const end = useRef<HTMLLIElement>(null);
  const count = detail.data?.messages.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [count]);

  if (detail.isPending) return <LoadingState />;
  if (detail.isError)
    return <ErrorState message={detail.error.message} retry={() => detail.refetch()} />;
  const { ticket, messages, claim } = detail.data;
  // Support staff and administrators answer requests; other staff can read them.
  const handles = can(user.role, "support");
  const staff = (users.data ?? []).filter((item) => can(item.role, "support"));
  const files: StoredFile[] = messages.flatMap((message) =>
    message.attachments.map((file) => ({
      ...file,
      owner_id: "",
      created_at: message.created_at,
    })),
  );

  return (
    <div className="support-thread">
      <header className="support-thread-head">
        <Button
          className="console-secondary support-back"
          onClick={() => router.push(`${base}/support`)}
          aria-label="Back to requests"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2>{ticket.subject}</h2>
          <p>
            {ticket.reference} · {kinds[ticket.kind]} · opened{" "}
            {dateLabel(ticket.created_at)} by{" "}
            <Link href={`${base}/travellers/${ticket.owner_id}`}>
              {ticket.owner_name || ticket.owner_email}
            </Link>
            {ticket.device_id ? (
              <>
                {" "}
                · bag{" "}
                <Link href={`${base}/devices/${ticket.device_id}`}>
                  {ticket.device_name
                    ? `${ticket.device_name} (${ticket.device_serial})`
                    : ticket.device_serial}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </header>

      {handles ? (
        <div className="support-controls">
          <label>
            <span>Status</span>
            <ConsoleSelect
              compact
              label="Status"
              value={ticket.status}
              disabled={change.isPending}
              onValueChange={(status) => change.mutate({ status })}
              options={Object.entries(statuses).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </label>
          <label>
            <span>Priority</span>
            <ConsoleSelect
              compact
              label="Priority"
              value={ticket.priority}
              disabled={change.isPending}
              onValueChange={(priority) => change.mutate({ priority })}
              options={Object.entries(priorities).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </label>
          <label>
            <span>Assigned to</span>
            <ConsoleSelect
              compact
              label="Assigned to"
              value={ticket.assignee_id ?? "none"}
              disabled={change.isPending}
              onValueChange={(assignee) => change.mutate({ assignee })}
              options={[
                { value: "none", label: "Nobody" },
                ...(ticket.assignee_id &&
                !staff.some((item) => item.id === ticket.assignee_id)
                  ? [
                      {
                        value: ticket.assignee_id,
                        label: ticket.assignee_email ?? "Someone",
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
        </div>
      ) : (
        <p className="support-readonly">
          {statuses[ticket.status]} · {priorities[ticket.priority]} priority · assigned to{" "}
          {ticket.assignee_email ?? "nobody"}
        </p>
      )}
      {change.isError ? (
        <p className="console-alert error" role="alert">
          {change.error.message}
        </p>
      ) : null}

      {claim ? (
        <ClaimPanel id={id} claim={claim} onChanged={refresh} manage={handles} />
      ) : null}

      <ol className="support-messages">
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.internal ? "internal" : message.from_staff ? "staff" : "traveller"
            }
          >
            <div className="support-bubble">
              <span className="support-author">
                {message.internal ? (
                  <>
                    <Lock size={12} /> Internal note · {message.author}
                  </>
                ) : message.from_staff ? (
                  (message.author ?? "Support")
                ) : (
                  ticket.owner_name || ticket.owner_email
                )}
                <time dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </span>
              <p>{message.body}</p>
              {message.attachments.length ? (
                <ul className="support-files">
                  {message.attachments.map((file) => (
                    <li key={file.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewing(files.find((item) => item.id === file.id) ?? null)
                        }
                      >
                        <FileIcon
                          file={{ ...file, owner_id: "", created_at: message.created_at }}
                          size={16}
                        />
                        <span>{file.filename}</span>
                        <small>{sizeLabel(file.size_bytes)}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
        <li ref={end} className="support-end" aria-hidden="true" />
      </ol>

      {handles && ticket.status === "closed" ? (
        <p className="support-closed">
          This request is closed. Internal notes can still be added; the traveller would
          open a new request.
        </p>
      ) : null}
      {handles ? (
        <Composer id={id} closed={ticket.status === "closed"} onSent={refresh} />
      ) : null}
      <FilePreview
        files={files}
        file={previewing}
        onSelect={setPreviewing}
        source={(file) => `support/tickets/${id}/files/${file.id}`}
      />
    </div>
  );
}

function Composer({
  id,
  closed,
  onSent,
}: {
  id: string;
  closed: boolean;
  onSent: () => void;
}) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(closed);
  const [attached, setAttached] = useState<SupportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const send = useMutation({
    mutationFn: (status?: TicketStatus) =>
      api(`admin/support/tickets/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          body,
          internal,
          attachments: attached.map((file) => file.id),
          ...(status ? { status } : {}),
        }),
      }),
    onSuccess: () => {
      setBody("");
      setAttached([]);
      setError("");
      onSent();
    },
    onError: (cause) => setError(cause.message),
  });

  async function attach(list: File[]) {
    setError("");
    setUploading(true);
    for (const file of list.slice(0, 6 - attached.length)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is larger than 10 MB.`);
        continue;
      }
      try {
        const stored = await api<StoredFile>("files", {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
            "X-File-Name": file.name.replace(/[^a-zA-Z0-9 ._-]/g, "_").slice(0, 120),
          },
        });
        setAttached((current) => [...current, stored]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Upload failed.");
      }
    }
    setUploading(false);
  }

  const ready = body.trim().length > 0 && !send.isPending && !uploading;
  return (
    <form
      className={`support-composer${internal ? " internal" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) send.mutate(undefined);
      }}
    >
      <div className="segmented-control" role="group" aria-label="Message type">
        <button
          type="button"
          aria-pressed={!internal}
          disabled={closed}
          onClick={() => setInternal(false)}
        >
          Reply to traveller
        </button>
        <button type="button" aria-pressed={internal} onClick={() => setInternal(true)}>
          <Lock size={12} /> Internal note
        </button>
      </div>
      <label className="sr-only" htmlFor={`compose-${id}`}>
        {internal ? "Internal note" : "Reply"}
      </label>
      <textarea
        id={`compose-${id}`}
        rows={4}
        maxLength={4000}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && ready)
            send.mutate(undefined);
        }}
        placeholder={
          internal
            ? "A note for the team. The traveller won't see it."
            : "Write to the traveller…"
        }
      />
      {attached.length ? (
        <ul className="support-files pending">
          {attached.map((file) => (
            <li key={file.id}>
              <span>
                <Paperclip size={14} /> {file.filename}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.filename}`}
                onClick={() =>
                  setAttached((current) => current.filter((item) => item.id !== file.id))
                }
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="support-composer-actions">
        <input
          ref={input}
          type="file"
          multiple
          className="sr-only"
          accept=".pdf,.png,.jpg,.jpeg,.json,.txt"
          onChange={(event) => {
            attach(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          className="console-secondary"
          disabled={uploading || attached.length >= 6}
          onClick={() => input.current?.click()}
        >
          {uploading ? (
            <LoaderCircle className="animate-spin" size={15} />
          ) : (
            <Paperclip size={15} />
          )}{" "}
          Attach
        </Button>
        <span className="support-hint">⌘ Enter to send</span>
        {!internal ? (
          <Button
            type="button"
            className="console-secondary"
            disabled={!ready}
            onClick={() => send.mutate("resolved")}
          >
            <CheckCircle2 size={15} /> Send and resolve
          </Button>
        ) : null}
        <Button type="submit" className="console-button" disabled={!ready}>
          {send.isPending ? (
            <LoaderCircle className="animate-spin" size={15} />
          ) : (
            <Send size={15} />
          )}
          {internal ? "Add note" : "Send"}
        </Button>
      </div>
    </form>
  );
}

function ClaimPanel({
  id,
  claim,
  onChanged,
  manage,
}: {
  id: string;
  claim: NonNullable<StaffTicketDetail["claim"]>;
  onChanged: () => void;
  manage: boolean;
}) {
  const [note, setNote] = useState("");
  const [serial, setSerial] = useState("");
  const decide = useMutation({
    mutationFn: (decision: { approve: boolean; resolution?: "repair" | "replace" }) =>
      api(`admin/support/tickets/${id}/claim/decision`, {
        method: "POST",
        body: JSON.stringify({
          ...decision,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      }),
    onSuccess: () => {
      setNote("");
      onChanged();
    },
  });
  const progress = useMutation({
    mutationFn: (status: "in_progress" | "completed") =>
      api(`admin/support/tickets/${id}/claim/progress`, {
        method: "POST",
        body: JSON.stringify({
          status,
          ...(serial.trim() ? { replacement_serial: serial.trim() } : {}),
        }),
      }),
    onSuccess: onChanged,
  });
  const busy = decide.isPending || progress.isPending;
  const order: (keyof typeof claimSteps)[] =
    claim.status === "rejected"
      ? ["submitted", "rejected"]
      : ["submitted", "approved", "in_progress", "completed"];
  const reached = order.indexOf(claim.status);

  return (
    <section className="support-claim" aria-label="Warranty claim">
      <div className="support-claim-head">
        <span className="support-claim-icon">
          <ShieldCheck size={18} />
        </span>
        <div>
          <h3>Warranty claim · {parts[claim.part]}</h3>
          <p>
            {claim.resolution ? `To ${claim.resolution}` : "Awaiting a decision"}
            {claim.replacement_serial ? ` · replacement ${claim.replacement_serial}` : ""}
            {claim.decided_at ? ` · decided ${dateLabel(claim.decided_at)}` : ""}
          </p>
        </div>
      </div>
      <ol className="support-claim-steps">
        {order.map((step, index) => (
          <li
            key={step}
            data-state={
              index < reached ? "done" : index === reached ? "current" : undefined
            }
          >
            {claimSteps[step]}
          </li>
        ))}
      </ol>
      {claim.decision_note ? (
        <p className="support-claim-note">“{claim.decision_note}”</p>
      ) : null}

      {!manage ? null : claim.status === "submitted" ? (
        <div className="support-claim-actions">
          <textarea
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="A note for the traveller with your decision (optional)"
            aria-label="Decision note"
          />
          <div>
            <Button
              className="console-button"
              disabled={busy}
              onClick={() => decide.mutate({ approve: true, resolution: "repair" })}
            >
              <Wrench size={15} /> Approve repair
            </Button>
            <Button
              className="console-button"
              disabled={busy}
              onClick={() => decide.mutate({ approve: true, resolution: "replace" })}
            >
              Approve replacement
            </Button>
            <Button
              className="console-danger"
              disabled={busy}
              onClick={() => decide.mutate({ approve: false })}
            >
              Reject
            </Button>
          </div>
        </div>
      ) : claim.status === "approved" || claim.status === "in_progress" ? (
        <div className="support-claim-actions">
          {claim.resolution === "replace" ? (
            <label className="support-serial">
              <span>Replacement serial (optional)</span>
              <input
                value={serial}
                onChange={(event) => setSerial(event.target.value)}
                placeholder="AMT-…"
              />
            </label>
          ) : null}
          <div>
            {claim.status === "approved" ? (
              <Button
                className="console-secondary"
                disabled={busy}
                onClick={() => progress.mutate("in_progress")}
              >
                {claim.resolution === "replace" ? "Replacement sent" : "Repair started"}
              </Button>
            ) : null}
            <Button
              className="console-button"
              disabled={busy}
              onClick={() => progress.mutate("completed")}
            >
              <CheckCircle2 size={15} /> Mark completed
            </Button>
          </div>
          {claim.part === "tracker" && claim.resolution === "replace" ? (
            <small>
              To move the traveller&rsquo;s bag onto a new tracker, use Replace tracker on
              the bag&rsquo;s page.
            </small>
          ) : null}
        </div>
      ) : null}
      {decide.isError || progress.isError ? (
        <p className="console-alert error" role="alert">
          {(decide.error ?? progress.error)?.message}
        </p>
      ) : null}
    </section>
  );
}
