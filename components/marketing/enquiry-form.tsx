"use client";

// The partner and investor enquiry form (on the home page and the Contact page), and the
// helpers both forms use to send a lead to the API's public leads endpoint.
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };

export async function sendLead(
  body: Record<string, string>,
  messages: { failed: string; offline: string },
): Promise<Status> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { state: "sent" };
    const error = await response
      .json()
      .then((value: { error?: string }) => value.error)
      .catch(() => undefined);
    return { state: "error", message: error ?? messages.failed };
  } catch {
    return { state: "error", message: messages.offline };
  }
}

export function fields(form: HTMLFormElement) {
  return Object.fromEntries(
    [...new FormData(form).entries()].map(([key, value]) => [key, String(value)]),
  ) as Record<string, string>;
}

/** Hidden from people; bots that fill it in are ignored by the API. */
export function Honeypot() {
  return (
    <label className="trace-honeypot" aria-hidden>
      Website
      <input name="website" tabIndex={-1} autoComplete="off" />
    </label>
  );
}

export function EnquiryForm() {
  const { m } = useI18n();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [kind, setKind] = useState<"investor" | "partner">("partner");

  async function enquire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "sending" });
    setStatus(
      await sendLead(
        { ...fields(event.currentTarget), kind },
        { failed: m.contact.failed, offline: m.contact.offline },
      ),
    );
  }

  if (status.state === "sent")
    return (
      <p className="trace-form-done" role="status">
        <Check size={18} /> {m.contact.sent}
      </p>
    );
  return (
    <form onSubmit={enquire} className="trace-form">
      <div className="trace-kind" role="radiogroup" aria-label={m.contact.as}>
        {(["partner", "investor"] as const).map((value) => (
          <button
            type="button"
            key={value}
            role="radio"
            aria-checked={kind === value}
            onClick={() => setKind(value)}
          >
            {value === "partner" ? m.contact.partner : m.contact.investor}
          </button>
        ))}
      </div>
      <label>
        {m.contact.name}
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      <label>
        {m.contact.email}
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label>
        {m.contact.company}
        <input name="company" maxLength={120} autoComplete="organization" />
      </label>
      <label>
        {m.contact.country}
        <input name="country" maxLength={60} autoComplete="country-name" />
      </label>
      <label className="wide">
        {m.contact.message}
        <textarea name="message" rows={4} maxLength={2000} />
      </label>
      <Honeypot />
      {status.state === "error" ? (
        <p className="trace-form-error" role="alert">
          {status.message}
        </p>
      ) : null}
      <button className="trace-button ink" disabled={status.state === "sending"}>
        {status.state === "sending" ? m.contact.sending : m.contact.send}
      </button>
    </form>
  );
}
