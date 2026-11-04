import { LoaderCircle, AlertCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="console-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="console-actions">{children}</div>
    </header>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`device-status ${status}`}>{status.replaceAll("_", " ")}</span>;
}

export function LoadingState() {
  return (
    <div className="console-empty" role="status">
      <LoaderCircle className="animate-spin" size={24} />
      <p>Loading your workspace…</p>
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="console-empty" role="alert">
      <AlertCircle size={28} />
      <h2>We couldn’t load this.</h2>
      <p>{message}</p>
      <button className="console-button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function dateLabel(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "—";
}

/** "Oct 24, 06:12 PM UTC". */
export function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

/** Shown in place of an admin-only page to other staff. */
export function AdminOnly({ what }: { what: string }) {
  return (
    <div className="console-empty">
      <ShieldCheck size={28} />
      <h2>Administrators only</h2>
      <p>{what} are visible to administrators.</p>
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented trace-tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
