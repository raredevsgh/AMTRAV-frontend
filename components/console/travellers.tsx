"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Luggage,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
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
import { can } from "@/lib/console/roles";
import { api } from "@/lib/console/api";
import { previewTravellerDetail, previewTravellers } from "@/lib/console/demo";
import type {
  BagActivity,
  Traveller,
  TravellerDetail,
  TravellerPage,
} from "@/lib/console/types";
import { TravellerMessages } from "./messages";
import { useConsole } from "./provider";
import {
  dateLabel,
  ErrorState,
  LoadingState,
  PageHeading,
  StatusBadge,
  timeLabel,
} from "./shared";

const PAGE_SIZE = 25;

function nameOf(traveller: Traveller) {
  return traveller.display_name || traveller.email.split("@")[0];
}

/**
 * A photo the traveller uploaded (served by our API through the gateway), else initials.
 * Google photos are not shown: the console makes no third-party image requests.
 */
function Initials({ traveller }: { traveller: Traveller }) {
  const { preview } = useConsole();
  if (traveller.photo_path && !preview)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- authenticated same-origin image; next/image would proxy it
      <img
        className="traveller-initials"
        src={`/api/console/users/${traveller.id}/photo`}
        alt=""
        width={36}
        height={36}
      />
    );
  const letters = nameOf(traveller)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="traveller-initials" aria-hidden="true">
      {letters || "?"}
    </span>
  );
}

function SignInMethods({ traveller }: { traveller: Traveller }) {
  return (
    <span className="method-pills">
      {traveller.google && <span className="subtle-pill">Google</span>}
      {traveller.password && <span className="subtle-pill">Email</span>}
    </span>
  );
}

function AdminOnly() {
  return (
    <div className="console-empty">
      <ShieldCheck size={28} />
      <h2>Administrators only</h2>
      <p>Traveller accounts are visible to administrators.</p>
    </div>
  );
}

function previewPage(search: string, page: number): TravellerPage {
  const q = search.toLowerCase().replace(/^@/, "");
  const matches = previewTravellers.filter((traveller) =>
    `${traveller.email} ${traveller.display_name ?? ""} ${traveller.username ?? ""}`
      .toLowerCase()
      .includes(q),
  );
  return {
    travellers: matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    total: matches.length,
  };
}

export function TravellersPage() {
  const { user, preview, base } = useConsole();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Search on the server a moment after typing stops.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const travellers = useQuery({
    queryKey: ["travellers", user.id, search, page, preview],
    queryFn: ({ signal }) => {
      if (preview) return Promise.resolve(previewPage(search, page));
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (search) params.set("q", search);
      return api<TravellerPage>(`admin/travellers?${params}`, { signal });
    },
    enabled: can(user.role, "read"),
    placeholderData: keepPreviousData,
  });

  if (!can(user.role, "read")) return <AdminOnly />;
  const total = travellers.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeading
        title="Travellers"
        description="People using the Amortrav app: how they sign in, their security and their bags. Opening an account is recorded in the security audit trail."
      />
      <section className="console-card inventory-card">
        <div className="card-heading">
          <h2>
            Accounts <span className="count-badge">{total}</span>
          </h2>
          <label className="console-search">
            <Search size={16} />
            <span className="sr-only">Search travellers</span>
            <input
              type="search"
              placeholder="Name, @username or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        {travellers.isPending ? (
          <LoadingState />
        ) : travellers.isError ? (
          <ErrorState
            message={travellers.error.message}
            retry={() => travellers.refetch()}
          />
        ) : !travellers.data.travellers.length ? (
          <div className="console-empty">
            <Users size={32} />
            <h3>{search ? "No travellers match." : "No travellers yet."}</h3>
            <p>
              {search
                ? "Try a name, a username or part of an email address."
                : "Accounts appear here when people sign up in the app."}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Traveller</th>
                  <th>Sign-in</th>
                  <th>Email</th>
                  <th>Two-step</th>
                  <th>Bags</th>
                  <th>Last sign-in</th>
                  <th>Joined</th>
                  <th>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {travellers.data.travellers.map((traveller) => (
                  <tr key={traveller.id}>
                    <td>
                      <Link
                        className="traveller-cell"
                        href={`${base}/travellers/${traveller.id}`}
                      >
                        <Initials traveller={traveller} />
                        <span>
                          <strong>{nameOf(traveller)}</strong>
                          <small>
                            {traveller.username ? `@${traveller.username} · ` : ""}
                            {traveller.email}
                          </small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <SignInMethods traveller={traveller} />
                    </td>
                    <td>
                      <StatusBadge
                        status={
                          traveller.suspended_at
                            ? "suspended"
                            : traveller.email_verified
                              ? "confirmed"
                              : "unconfirmed"
                        }
                      />
                    </td>
                    <td>{traveller.mfa_enabled ? "On" : "Off"}</td>
                    <td>{traveller.bags}</td>
                    <td>{dateLabel(traveller.last_sign_in)}</td>
                    <td>{dateLabel(traveller.created_at)}</td>
                    <td>
                      <Link
                        className="row-open"
                        href={`${base}/travellers/${traveller.id}`}
                        aria-label={`Open ${nameOf(traveller)}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <p>Deleted accounts are not listed.</p>
          <div>
            <span>
              Page {page + 1} of {pages}
            </span>
            {pages > 1 && (
              <>
                <button
                  aria-label="Previous page"
                  disabled={page === 0}
                  onClick={() => setPage((value) => value - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  aria-label="Next page"
                  disabled={page + 1 >= pages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

const distance = (metres: number) =>
  metres < 1000 ? `${Math.round(metres)} m` : `${Math.round(metres / 100) / 10} km`;

function activityLabel(entry: BagActivity) {
  switch (entry.kind) {
    case "claimed":
      return "Added to the account";
    case "first_fix":
      return "First position reported";
    case "moved":
      return entry.distance_m != null ? `Moved ${distance(entry.distance_m)}` : "Moved";
    case "located":
      return "Position updated";
    case "revoked":
      return "Tracker revoked";
    case "lost":
      return "Marked as lost by the owner";
    case "found":
      return "Marked as found";
  }
}

const position = (latitude: number, longitude: number, accuracy: number | null) =>
  `${latitude.toFixed(4)}, ${longitude.toFixed(4)}${accuracy != null ? ` ±${Math.round(accuracy)} m` : ""}`;

export function TravellerDetailPage({ id }: { id: string }) {
  const { user, preview, base } = useConsole();
  const detail = useQuery({
    queryKey: ["traveller", id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve(previewTravellerDetail(id))
        : api<TravellerDetail>(`admin/travellers/${id}`, { signal }),
    enabled: can(user.role, "read"),
    // Every fetch is an audited view of someone's account: don't refetch on a whim.
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  if (!can(user.role, "read")) return <AdminOnly />;
  if (detail.isPending) return <LoadingState />;
  if (detail.isError)
    return <ErrorState message={detail.error.message} retry={() => detail.refetch()} />;

  const { traveller, bags, activity, security } = detail.data;
  const bagNames = new Map(
    bags.map((bag) => [bag.id, bag.nickname || bag.serial_number]),
  );

  return (
    <>
      <Link href={`${base}/travellers`} className="console-back">
        <ArrowLeft size={16} /> Back to travellers
      </Link>
      <PageHeading
        title={nameOf(traveller)}
        description={
          traveller.username ? `@${traveller.username} · ${traveller.email}` : traveller.email
        }
      >
        <span className="subtle-pill">This view is recorded in the audit trail</span>
        {can(user.role, "support") ? <SuspendControl traveller={traveller} /> : null}
      </PageHeading>
      {traveller.suspended_at && (
        <p className="console-alert error" role="status">
          Suspended {timeLabel(traveller.suspended_at)}
          {traveller.suspended_reason ? `: ${traveller.suspended_reason}` : ""}. They can’t sign in
          until restored.
        </p>
      )}
      <div className="detail-columns">
        <section className="console-card">
          <h2>Account</h2>
          <dl className="record-list">
            {[
              ["Name", traveller.display_name || "—"],
              ["Username", traveller.username ? `@${traveller.username}` : "—"],
              ["Email", traveller.email],
              ["Email confirmed", traveller.email_verified ? "Yes" : "Not yet"],
              ["Sign-in", <SignInMethods key="methods" traveller={traveller} />],
              ["Two-step verification", traveller.mfa_enabled ? "On" : "Off"],
              ["Joined", dateLabel(traveller.created_at)],
              [
                "Last sign-in",
                traveller.last_sign_in ? timeLabel(traveller.last_sign_in) : "—",
              ],
              [
                "Accepted the Terms",
                traveller.terms_accepted_at ? timeLabel(traveller.terms_accepted_at) : "—",
              ],
              [
                "Confirmed 18 or older",
                traveller.adult_confirmed_at ? timeLabel(traveller.adult_confirmed_at) : "—",
              ],
              ["Account ID", <span key="id" className="mono">{traveller.id}</span>],
            ].map(([key, value]) => (
              <div key={String(key)}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="console-card">
          <div className="card-heading">
            <h2>
              Bags <span className="count-badge">{bags.length}</span>
            </h2>
            <Luggage size={18} />
          </div>
          {!bags.length ? (
            <div className="console-empty">
              <p>No bags on this account.</p>
            </div>
          ) : (
            <ul className="file-list">
              {bags.map((bag) => (
                <li key={bag.id}>
                  <span className="file-icon">
                    <Luggage size={22} />
                  </span>
                  <div>
                    <strong>{bag.nickname || bag.serial_number}</strong>
                    <p>
                      {bag.serial_number} · {bag.model} · claimed {dateLabel(bag.claimed_at)}
                    </p>
                    {bag.lost_at && (
                      <p className="lost-note">
                        Lost since {timeLabel(bag.lost_at)}
                        {bag.lost_note ? ` · “${bag.lost_note}”` : ""}
                      </p>
                    )}
                    <p>
                      {bag.latitude != null && bag.longitude != null
                        ? `Last seen ${position(bag.latitude, bag.longitude, bag.accuracy_m)}${
                            bag.recorded_at ? ` · ${timeLabel(bag.recorded_at)}` : ""
                          }`
                        : "No position reported yet"}
                    </p>
                  </div>
                  <StatusBadge status={bag.lost_at ? "lost" : bag.status} />
                  <Link
                    className="row-open"
                    href={`${base}/devices/${bag.id}`}
                    aria-label={`Open ${bag.serial_number}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <TravellerMessages travellerId={traveller.id} name={nameOf(traveller)} />
      <section className="console-card">
        <div className="card-heading">
          <h2>Bag activity</h2>
          <Clock3 size={18} />
        </div>
        {!activity.length ? (
          <div className="console-empty">
            <p>No bag activity yet.</p>
          </div>
        ) : (
          <ol className="audit-list">
            {activity.map((entry) => (
              <li key={entry.id}>
                <span className="audit-dot" />
                <div>
                  <strong>{activityLabel(entry)}</strong>
                  <p>
                    {bagNames.get(entry.device_id) ?? entry.device_id.slice(0, 8)}
                    {entry.latitude != null && entry.longitude != null
                      ? ` · ${position(entry.latitude, entry.longitude, entry.accuracy_m)}`
                      : ""}
                  </p>
                </div>
                <time>{timeLabel(entry.occurred_at)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
      <section className="console-card">
        <div className="card-heading">
          <h2>Security events</h2>
          <ShieldCheck size={18} />
        </div>
        {!security.length ? (
          <div className="console-empty">
            <p>No security events for this account.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="console-table">
              <thead>
                <tr>
                  <th>Time (UTC)</th>
                  <th>Action</th>
                  <th>Outcome</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {security.map((event) => (
                  <tr key={event.id}>
                    <td>{timeLabel(event.occurred_at)}</td>
                    <td className="mono">{event.action}</td>
                    <td>
                      <span className={`device-status ${event.outcome}`}>
                        {event.outcome}
                      </span>
                    </td>
                    <td>{event.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/** Suspend (with a reason) or restore a traveller; both are recorded in the audit trail. */
function SuspendControl({ traveller }: { traveller: Traveller }) {
  const { preview } = useConsole();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const change = useMutation({
    mutationFn: (action: "suspend" | "restore") =>
      api<Traveller>(`admin/travellers/${traveller.id}/${action}`, {
        method: "POST",
        body: JSON.stringify(action === "suspend" ? { reason: reason.trim() } : {}),
      }),
    onSuccess: () => {
      setOpen(false);
      setReason("");
      client.invalidateQueries({ queryKey: ["traveller", traveller.id] });
      client.invalidateQueries({ queryKey: ["travellers"] });
    },
  });
  if (traveller.suspended_at)
    return (
      <Button className="console-secondary" disabled={preview || change.isPending} onClick={() => change.mutate("restore")}>
        <ShieldCheck size={16} /> {change.isPending ? "Restoring…" : "Restore access"}
      </Button>
    );
  return (
    <>
      <Button className="console-danger" disabled={preview} onClick={() => { change.reset(); setOpen(true); }}>
        <Ban size={16} /> Suspend
      </Button>
      <Dialog open={open} onOpenChange={(next) => !change.isPending && setOpen(next)}>
        <DialogContent className="console-dialog">
          <DialogHeader>
            <DialogTitle>Suspend {nameOf(traveller)}?</DialogTitle>
            <DialogDescription>
              They are signed out everywhere and can’t sign in or use the app until you restore
              them. Their bags and data are kept.
            </DialogDescription>
          </DialogHeader>
          {change.isError && (
            <p role="alert" className="console-alert error">
              {change.error.message}
            </p>
          )}
          <form
            className="console-form compose-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (reason.trim()) change.mutate("suspend");
            }}
          >
            <div className="field">
              <Label htmlFor="suspend-reason">Reason (for the audit trail)</Label>
              <Input
                id="suspend-reason"
                value={reason}
                maxLength={280}
                placeholder="Reported for misuse of location sharing"
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
            <Button className="console-danger" disabled={!reason.trim() || change.isPending}>
              {change.isPending ? "Suspending…" : "Suspend traveller"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
