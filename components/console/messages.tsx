"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/console/api";
import { previewSentMessages } from "@/lib/console/demo";
import type { SentMessage, SentPage } from "@/lib/console/types";
import { useConsole } from "./provider";
import { ErrorState, LoadingState, PageHeading, timeLabel } from "./shared";

const TITLE_MAX = 80;
const BODY_MAX = 2000;

/** Title and message, with limits shown as you type; travellers see them in the app. */
function ComposeForm({
  submitLabel,
  pending,
  error,
  disabled,
  onSend,
}: {
  submitLabel: string;
  pending: boolean;
  error?: string;
  disabled?: boolean;
  onSend: (message: { title: string; body: string }, reset: () => void) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const valid =
    title.trim().length > 0 &&
    title.trim().length <= TITLE_MAX &&
    body.trim().length > 0 &&
    body.trim().length <= BODY_MAX;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    onSend({ title: title.trim(), body: body.trim() }, () => {
      setTitle("");
      setBody("");
    });
  }

  return (
    <form className="console-form compose-form" onSubmit={submit}>
      {error && (
        <p role="alert" className="console-alert error">
          {error}
        </p>
      )}
      <div className="field">
        <Label htmlFor="message-title">Title</Label>
        <Input
          id="message-title"
          value={title}
          maxLength={TITLE_MAX}
          placeholder="Your bag is waiting at Belt 4"
          onChange={(event) => setTitle(event.target.value)}
        />
        <p className="field-hint">
          {title.trim().length}/{TITLE_MAX}
        </p>
      </div>
      <div className="field">
        <Label htmlFor="message-body">Message</Label>
        <textarea
          id="message-body"
          className="compose-body"
          value={body}
          maxLength={BODY_MAX}
          rows={5}
          placeholder="Write what the traveller needs to know. Line breaks are kept."
          onChange={(event) => setBody(event.target.value)}
        />
        <p className="field-hint">
          {body.trim().length}/{BODY_MAX}
        </p>
      </div>
      <Button className="console-button" disabled={!valid || pending || disabled}>
        <Send size={16} /> {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

function SentList({ messages, empty }: { messages: SentMessage[]; empty: string }) {
  if (!messages.length)
    return (
      <div className="console-empty">
        <p>{empty}</p>
      </div>
    );
  return (
    <ol className="message-list">
      {messages.map((message) => (
        <li key={message.id}>
          <span className={`message-icon ${message.audience}`}>
            {message.audience === "all" ? <Megaphone size={16} /> : <Mail size={16} />}
          </span>
          <div>
            <strong>{message.title}</strong>
            <p>{message.body}</p>
            <small>
              {message.audience === "all"
                ? `Announcement · ${message.recipients} travellers`
                : `To ${message.recipient_email ?? "a deleted account"}`}
              {message.sender_email ? ` · by ${message.sender_email}` : ""} ·{" "}
              {timeLabel(message.created_at)}
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Admin: announce to every traveller, and see everything sent. */
export function MessagesPage() {
  const { user, preview } = useConsole();
  const client = useQueryClient();
  const [sentNote, setSentNote] = useState("");
  const history = useQuery({
    queryKey: ["admin-messages", user.id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve({ messages: previewSentMessages, total: previewSentMessages.length })
        : api<SentPage>("admin/messages?limit=100", { signal }),
    enabled: user.role === "admin",
  });
  const announce = useMutation({
    mutationFn: (message: { title: string; body: string }) =>
      api<SentMessage>("admin/messages", { method: "POST", body: JSON.stringify(message) }),
    onSuccess: (sent) => {
      setSentNote(`Sent to ${sent.recipients} travellers.`);
      client.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  if (user.role !== "admin")
    return (
      <div className="console-empty">
        <p>Messages are sent by administrators.</p>
      </div>
    );

  return (
    <>
      <PageHeading
        title="Messages"
        description="Announce something to every traveller. It appears in their app’s notifications at once, with a badge. To message one person, open them from Travellers."
      />
      <div className="detail-columns">
        <section className="console-card">
          <div className="card-heading">
            <h2>New announcement</h2>
            <Megaphone size={18} />
          </div>
          {sentNote && (
            <p className="console-alert" role="status">
              {sentNote}
            </p>
          )}
          <ComposeForm
            submitLabel="Send to all travellers"
            pending={announce.isPending}
            error={announce.isError ? announce.error.message : undefined}
            disabled={preview}
            onSend={(message, reset) => {
              setSentNote("");
              announce.mutate(message, { onSuccess: reset });
            }}
          />
        </section>
        <section className="console-card">
          <div className="card-heading">
            <h2>
              Sent <span className="count-badge">{history.data?.total ?? 0}</span>
            </h2>
          </div>
          {history.isPending ? (
            <LoadingState />
          ) : history.isError ? (
            <ErrorState message={history.error.message} retry={() => history.refetch()} />
          ) : (
            <SentList messages={history.data.messages} empty="Nothing sent yet." />
          )}
        </section>
      </div>
    </>
  );
}

/** "Send message" on a traveller: a dialog, then the conversation so far below. */
export function TravellerMessages({ travellerId, name }: { travellerId: string; name: string }) {
  const { preview } = useConsole();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const history = useQuery({
    queryKey: ["admin-messages", "traveller", travellerId, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve({
            messages: previewSentMessages.filter((message) => message.recipient_id === travellerId),
            total: 0,
          })
        : api<SentPage>(`admin/messages?recipient_id=${travellerId}&limit=50`, { signal }),
  });
  const send = useMutation({
    mutationFn: (message: { title: string; body: string }) =>
      api<SentMessage>(`admin/travellers/${travellerId}/messages`, {
        method: "POST",
        body: JSON.stringify(message),
      }),
    onSuccess: () => {
      setOpen(false);
      client.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  return (
    <section className="console-card">
      <div className="card-heading">
        <h2>Messages</h2>
        <Button
          className="console-button"
          disabled={preview}
          onClick={() => {
            send.reset();
            setOpen(true);
          }}
        >
          <Send size={16} /> Send message
        </Button>
      </div>
      {history.isPending ? (
        <LoadingState />
      ) : history.isError ? (
        <ErrorState message={history.error.message} retry={() => history.refetch()} />
      ) : (
        <SentList messages={history.data.messages} empty="No messages sent to this traveller." />
      )}
      <Dialog open={open} onOpenChange={(next) => !send.isPending && setOpen(next)}>
        <DialogContent className="console-dialog">
          <DialogHeader>
            <DialogTitle>Message {name}</DialogTitle>
            <DialogDescription>
              It appears in their Amortrav app’s notifications right away, with a badge. Keep it
              to what they need to know; it’s recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <ComposeForm
            submitLabel="Send message"
            pending={send.isPending}
            error={send.isError ? send.error.message : undefined}
            onSend={(message) => send.mutate(message)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
