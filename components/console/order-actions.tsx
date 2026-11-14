"use client";
// After the sale, on the Shop page: refunding an order (in part or in full), settling one
// held for review, and buyers' returns and exchanges from request to completion. Refunds go
// back through the payment provider that took the money.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageOpen, Undo2 } from "lucide-react";
import { api } from "@/lib/console/api";
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
import { useConsole } from "./provider";
import { ErrorState, LoadingState, Tabs, timeLabel } from "./shared";
import "@/app/order-actions.css";

export type OrderSummary = {
  id: string;
  reference: string;
  status: string;
  email: string;
  total_minor: number;
  refunded_minor: number;
  currency: string;
  review_reason: string | null;
};

type ReturnRow = {
  id: string;
  order_id: string;
  kind: "return" | "exchange";
  reason: "changed_mind" | "damaged" | "wrong_item" | "not_as_described" | "other";
  details: string | null;
  exchange_sku: string | null;
  status: "requested" | "approved" | "rejected" | "received" | "completed";
  note: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  order_status: string;
  total_minor: number;
  refunded_minor: number;
  currency: string;
  shipped_at: string | null;
};

export const money = (minor: number, currency: string) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(minor / 100);

const reasons: Record<ReturnRow["reason"], string> = {
  changed_mind: "Changed their mind",
  damaged: "Arrived damaged",
  wrong_item: "Wrong item",
  not_as_described: "Not as described",
  other: "Other",
};
const steps: Record<ReturnRow["status"], string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  completed: "Completed",
};

/** Minor units from what staff typed ("12.50" → 1250), or null if it isn't an amount. */
function minorFrom(value: string) {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
}

function useRefresh() {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: ["shop-orders"] });
    client.invalidateQueries({ queryKey: ["shop-returns"] });
  };
}

export function RefundDialog({
  order,
  onClose,
}: {
  order: OrderSummary | null;
  onClose: () => void;
}) {
  const refresh = useRefresh();
  const remaining = order ? order.total_minor - order.refunded_minor : 0;
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const refund = useMutation({
    mutationFn: (amount_minor: number) =>
      api(`admin/shop/orders/${order!.id}/refund`, {
        method: "POST",
        body: JSON.stringify({ amount_minor, reason: reason.trim() }),
      }),
    onSuccess: () => {
      refresh();
      setAmount("");
      setReason("");
      onClose();
    },
  });
  const minor = amount.trim() ? minorFrom(amount) : remaining;
  const valid = !!minor && minor <= remaining && !!reason.trim();
  return (
    <Dialog
      open={!!order}
      onOpenChange={(open) => !open && !refund.isPending && onClose()}
    >
      <DialogContent className="console-dialog">
        {order ? (
          <form
            className="console-form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              if (valid) refund.mutate(minor!);
            }}
          >
            <DialogHeader>
              <DialogTitle>Refund {order.reference}?</DialogTitle>
              <DialogDescription>
                {money(remaining, order.currency)} of{" "}
                {money(order.total_minor, order.currency)} can still be refunded. The
                money goes back to the card or wallet {order.email} paid with, and
                they&rsquo;re told in the app if they have an account. This can&rsquo;t be
                undone.
              </DialogDescription>
            </DialogHeader>
            <Label htmlFor="refund-amount">Amount ({order.currency.toUpperCase()})</Label>
            <Input
              id="refund-amount"
              inputMode="decimal"
              placeholder={(remaining / 100).toFixed(2)}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <small className="field-hint">
              Leave it empty to refund everything left.
            </small>
            <Label htmlFor="refund-reason">Reason</Label>
            <Input
              id="refund-reason"
              maxLength={500}
              placeholder="e.g. Arrived damaged; customer keeps the bag"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            {minor && minor > remaining ? (
              <p className="field-error">That&rsquo;s more than is left to refund.</p>
            ) : null}
            {refund.isError ? (
              <p className="console-alert error" role="alert">
                {refund.error.message}
              </p>
            ) : null}
            <div className="console-actions">
              <Button
                type="button"
                className="console-secondary"
                onClick={onClose}
                disabled={refund.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="console-danger"
                disabled={!valid || refund.isPending}
              >
                {refund.isPending
                  ? "Refunding…"
                  : `Refund ${money(minor && minor <= remaining ? minor : remaining, order.currency)}`}
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function ResolveDialog({
  order,
  onClose,
}: {
  order: OrderSummary | null;
  onClose: () => void;
}) {
  const refresh = useRefresh();
  const [note, setNote] = useState("");
  const resolve = useMutation({
    mutationFn: (decision: "fulfil" | "refund") =>
      api(`admin/shop/orders/${order!.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ decision, note: note.trim() }),
      }),
    onSuccess: () => {
      refresh();
      setNote("");
      onClose();
    },
  });
  return (
    <Dialog
      open={!!order}
      onOpenChange={(open) => !open && !resolve.isPending && onClose()}
    >
      <DialogContent className="console-dialog">
        {order ? (
          <div className="console-form">
            <DialogHeader>
              <DialogTitle>Resolve {order.reference}</DialogTitle>
              <DialogDescription>
                The payment arrived, but something didn&rsquo;t match, so it&rsquo;s
                waiting for a decision. Fulfil it to ship it as it is, or refund{" "}
                {money(order.total_minor - order.refunded_minor, order.currency)} in full
                and put its bags back on sale.
              </DialogDescription>
            </DialogHeader>
            <Label htmlFor="resolve-note">Why (for the record)</Label>
            <Input
              id="resolve-note"
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Checked with Stripe: the full amount was paid"
            />
            {resolve.isError ? (
              <p className="console-alert error" role="alert">
                {resolve.error.message}
              </p>
            ) : null}
            <div className="console-actions">
              <Button
                className="console-secondary"
                disabled={!note.trim() || resolve.isPending}
                onClick={() => resolve.mutate("refund")}
              >
                Refund in full
              </Button>
              <Button
                className="console-button"
                disabled={!note.trim() || resolve.isPending}
                onClick={() => resolve.mutate("fulfil")}
              >
                Fulfil the order
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type View = "open" | "completed" | "rejected" | "all";

export function ReturnsCard() {
  const { preview, user } = useConsole();
  // Support or finance decide; whoever ships can log a bag coming back; refunds are finance's.
  const decides = can(user.role, "support") || can(user.role, "money");
  const logs = decides || can(user.role, "fulfil");
  const refunds = can(user.role, "money");
  const [view, setView] = useState<View>("open");
  const [working, setWorking] = useState<{
    row: ReturnRow;
    action: "approve" | "reject" | "receive" | "complete";
  } | null>(null);
  const returns = useQuery({
    queryKey: ["shop-returns", view, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve([] as ReturnRow[])
        : api<ReturnRow[]>(`admin/shop/returns?status=${view}`, { signal }),
  });
  const rows = returns.data ?? [];
  return (
    <section className="console-card inventory-card">
      <div className="card-heading">
        <h2>Returns and exchanges</h2>
        <Tabs
          label="Filter returns"
          value={view}
          onChange={setView}
          options={[
            { value: "open" as const, label: "In progress" },
            { value: "completed" as const, label: "Completed" },
            { value: "rejected" as const, label: "Rejected" },
            { value: "all" as const, label: "All" },
          ]}
        />
      </div>
      {returns.isPending ? (
        <LoadingState />
      ) : returns.isError ? (
        <ErrorState message={returns.error.message} retry={() => returns.refetch()} />
      ) : !rows.length ? (
        <div className="console-empty">
          <PackageOpen size={30} />
          <p>No returns here. Buyers ask for them from their order in the app.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="console-table">
            <thead>
              <tr>
                <th>Asked</th>
                <th>Order</th>
                <th>Buyer</th>
                <th>Request</th>
                <th>Paid</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{timeLabel(row.created_at)}</td>
                  <td className="mono">
                    AMT-{row.order_id.replaceAll("-", "").slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <a className="serial-link" href={`mailto:${row.email}`}>
                      {row.email}
                    </a>
                  </td>
                  <td className="message-cell" title={row.details ?? undefined}>
                    <strong>{row.kind === "exchange" ? "Exchange" : "Return"}</strong> ·{" "}
                    {reasons[row.reason]}
                    {row.exchange_sku ? ` · for ${row.exchange_sku}` : ""}
                    {row.details ? <div className="field-hint">{row.details}</div> : null}
                  </td>
                  <td>
                    {money(row.total_minor, row.currency)}
                    {row.refunded_minor ? (
                      <div className="field-hint">
                        {money(row.refunded_minor, row.currency)} refunded
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <span
                      className={`trace-badge ${row.status === "completed" ? "sky" : row.status === "rejected" ? "info" : "warn"}`}
                    >
                      {steps[row.status]}
                    </span>
                    {row.note ? <div className="field-hint">{row.note}</div> : null}
                  </td>
                  <td className="row-actions">
                    {row.status === "requested" ? (
                      decides ? (
                        <>
                          <button
                            className="console-secondary"
                            onClick={() => setWorking({ row, action: "approve" })}
                          >
                            Approve
                          </button>
                          <button
                            className="console-secondary"
                            onClick={() => setWorking({ row, action: "reject" })}
                          >
                            Reject
                          </button>
                        </>
                      ) : null
                    ) : row.status === "approved" ? (
                      <>
                        {logs && row.kind === "return" ? (
                          <button
                            className="console-secondary"
                            onClick={() => setWorking({ row, action: "receive" })}
                          >
                            Received
                          </button>
                        ) : null}
                        {(row.kind === "return" ? refunds : logs) ? (
                          <button
                            className="console-secondary"
                            onClick={() => setWorking({ row, action: "complete" })}
                          >
                            Complete
                          </button>
                        ) : null}
                      </>
                    ) : row.status === "received" &&
                      (row.kind === "return" ? refunds : logs) ? (
                      <button
                        className="console-secondary"
                        onClick={() => setWorking({ row, action: "complete" })}
                      >
                        <Undo2 size={15} /> Refund and complete
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ReturnStepDialog working={working} onClose={() => setWorking(null)} />
    </section>
  );
}

function ReturnStepDialog({
  working,
  onClose,
}: {
  working: {
    row: ReturnRow;
    action: "approve" | "reject" | "receive" | "complete";
  } | null;
  onClose: () => void;
}) {
  const refresh = useRefresh();
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const step = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api(`admin/shop/returns/${working!.row.id}`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      refresh();
      setNote("");
      setAmount("");
      onClose();
    },
  });
  if (!working) return <Dialog open={false} />;
  const { row, action } = working;
  const refunding = action === "complete" && row.kind === "return";
  const remaining = row.total_minor - row.refunded_minor;
  const minor = amount.trim() ? minorFrom(amount) : remaining;
  const titles = {
    approve: `Approve this ${row.kind}?`,
    reject: `Reject this ${row.kind}?`,
    receive: "Mark the bag received?",
    complete: refunding ? "Refund and complete the return?" : "Complete the exchange?",
  };
  const hints = {
    approve: "Tell the buyer how to send the bag back, e.g. the label you've emailed.",
    reject: "Tell the buyer why, so they know what to do next.",
    receive: "Optional: anything about the bag's condition.",
    complete: refunding
      ? "The refund goes back to how they paid. This can't be undone."
      : "Confirm the replacement has been sent, with its tracking if you have it.",
  };
  return (
    <Dialog open onOpenChange={(open) => !open && !step.isPending && onClose()}>
      <DialogContent className="console-dialog">
        <form
          className="console-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            step.mutate({
              action,
              ...(note.trim() ? { note: note.trim() } : {}),
              ...(refunding && minor ? { refund_minor: minor } : {}),
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{titles[action]}</DialogTitle>
            <DialogDescription>
              {row.email} · {reasons[row.reason]}. {hints[action]}
            </DialogDescription>
          </DialogHeader>
          {refunding ? (
            <>
              <Label htmlFor="return-amount">Refund ({row.currency.toUpperCase()})</Label>
              <Input
                id="return-amount"
                inputMode="decimal"
                placeholder={(remaining / 100).toFixed(2)}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <small className="field-hint">
                Leave it empty to refund everything left: {money(remaining, row.currency)}
                .
              </small>
            </>
          ) : null}
          <Label htmlFor="return-note">
            Message to the buyer
            {action === "reject" || action === "approve" ? "" : " (optional)"}
          </Label>
          <Input
            id="return-note"
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          {step.isError ? (
            <p className="console-alert error" role="alert">
              {step.error.message}
            </p>
          ) : null}
          <div className="console-actions">
            <Button
              type="button"
              className="console-secondary"
              onClick={onClose}
              disabled={step.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={
                action === "reject" || refunding ? "console-danger" : "console-button"
              }
              disabled={step.isPending || (refunding && (!minor || minor > remaining))}
            >
              {step.isPending
                ? "Saving…"
                : refunding
                  ? `Refund ${money(minor && minor <= remaining ? minor : remaining, row.currency)}`
                  : titles[action].replace("?", "")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
