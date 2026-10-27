"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MockApiError } from "@/lib/api";
import type { DeviceStatus } from "@/lib/api/types";

export { SectionPage } from "./section-page";
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`btn ${secondary ? "btn-secondary" : ""}`} href={href}>
      {children}
    </Link>
  );
}
export function Notice({
  title,
  children,
  tone = "info",
}: {
  title: string;
  children?: React.ReactNode;
  tone?: "info" | "error" | "warning" | "success";
}) {
  return (
    <div
      className={`notice notice-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <strong>{title}</strong>
      {children && <div>{children}</div>}
    </div>
  );
}
export function LoadingState({
  label = "Loading records",
}: {
  label?: string;
}) {
  return (
    <div className="panel loading-state" role="status">
      <h2>{label}</h2>
      <p>Fetching the fictional workspace records…</p>
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function EmptyState({
  title = "No records yet",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function errorText(error: unknown): string {
  if (!(error instanceof MockApiError))
    return "We can’t connect right now. Please try again.";
  if (error.status === 401)
    return "Your session has expired. Sign in to continue.";
  if (error.status === 403) return "This page is not available to your role.";
  if (error.status === 404)
    return "The record could not be found in your accessible workspace.";
  if (error.status === 429)
    return error.retryAfterSeconds != null
      ? `Too many requests. The service asks you to retry after ${error.retryAfterSeconds} seconds.`
      : "Too many requests. Try again when the service allows.";
  if (error.status === 503)
    return "Service temporarily unavailable. Please try again.";
  return error.body.error;
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const delay =
    error instanceof MockApiError && error.status === 429
      ? error.retryAfterSeconds
      : null;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (delay == null) return;
    const timer = setTimeout(() => setReady(true), Math.max(0, delay) * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <Notice title={errorText(error)} tone="error">
      {retry && (
        <button
          className="btn btn-secondary"
          disabled={delay != null && !ready}
          onClick={retry}
        >
          {delay != null && !ready ? "Retry when allowed" : "Try again"}
        </button>
      )}
    </Notice>
  );
}
export function StatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "registered"
        ? "Unclaimed"
        : status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}
export function Pagination({
  offset,
  limit,
  count,
  onPage,
  onLimit,
}: {
  offset: number;
  limit: number;
  count: number;
  onPage: (offset: number) => void;
  onLimit?: (limit: number) => void;
}) {
  return (
    <div className="pagination">
      <p>
        {count} records on this page · Offset {offset}
      </p>
      <div>
        {onLimit && (
          <label>
            Page size{" "}
            <select
              aria-label="Page size"
              value={limit}
              onChange={(e) => onLimit(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={50}>50</option>
            </select>
          </label>
        )}
        <button
          className="btn btn-secondary"
          disabled={offset === 0}
          onClick={() => onPage(Math.max(0, offset - limit))}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          disabled={count < limit}
          onClick={() => onPage(offset + limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <p id={`${name}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
      {hint && (
        <p id={`${name}-hint`} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  drawer = false,
  restoreFocus,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  drawer?: boolean;
  restoreFocus?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const returnFocus = useRef(restoreFocus);
  useEffect(() => {
    const d = ref.current;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusAfterClose = returnFocus.current;
    d?.showModal();
    (
      d?.querySelector<HTMLElement>("[data-autofocus]") ??
      d?.querySelector<HTMLElement>("button,a[href],input")
    )?.focus();
    return () => {
      d?.close();
      if (focusAfterClose) focusAfterClose();
      else if (previous?.isConnected) previous.focus();
      if (document.activeElement === document.body)
        document.querySelector<HTMLElement>("main h1")?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={id}
      className={`console-dialog ${drawer ? "drawer-dialog" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const items = e.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]',
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="dialog-surface">
        <div className="dialog-heading">
          <h2 id={id}>{title}</h2>
          <button
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
export function ConfirmDialog({
  title,
  description,
  confirm = "Confirm",
  danger = false,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirm?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p>{description}</p>
      {error != null && <ErrorState error={error} />}
      <div className="dialog-actions">
        <button
          data-autofocus
          className="btn btn-secondary"
          disabled={busy}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={`btn ${danger ? "btn-danger" : ""}`}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              setError(e);
              setBusy(false);
            }
          }}
        >
          {busy ? "Working…" : confirm}
        </button>
      </div>
    </Modal>
  );
}
export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "—";
}
