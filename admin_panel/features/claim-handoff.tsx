"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProvisionedDevice } from "@/lib/api/types";
import { ConfirmDialog, Notice } from "@/components/console-ui";
export function ClaimHandoff({
  result,
  onAnother,
  secondaryLabel = "Register another",
}: {
  result: ProvisionedDevice;
  onAnother?: () => void;
  secondaryLabel?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState("");
  const [leaving, setLeaving] = useState<string | null>(null);
  useEffect(() => {
    if (saved) return;
    const unload = (e: BeforeUnloadEvent) => e.preventDefault();
    const click = (e: MouseEvent) => {
      const link =
        e.target instanceof Element
          ? e.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      const href = link?.getAttribute("href");
      if (href?.startsWith("/") && !href.startsWith("//")) {
        e.preventDefault();
        link?.focus();
        setLeaving(href);
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [saved]);
  return (
    <div className="split">
      <section className="panel panel-body stack">
        <span className="status-badge status-claimed">
          Example device registered
        </span>
        <h2>Ready for a secure handoff</h2>
        <p className="muted small">
          The record is registered and has no owner. Give the buyer the serial
          number and this one-time code securely.
        </p>
        <div>
          <p className="small muted">Serial number</p>
          <p className="mono mt-2">{result.device.serial_number}</p>
        </div>
        <div>
          <p className="small muted">One-time claim code · EXAMPLE ONLY</p>
          <p className="secret-code mt-2" data-testid="claim-code">
            {result.claim_code}
          </p>
        </div>
        <div>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `EXAMPLE ONLY\n${result.device.serial_number}\n${result.claim_code}`,
                );
                setCopied("Example serial and code copied.");
              } catch {
                setCopied(
                  "Copy is unavailable. Select and copy the example code manually.",
                );
              }
            }}
          >
            Copy serial + code
          </button>
          <p className="small muted mt-2" role="status">
            {copied}
          </p>
        </div>
        <Notice title="Save it securely now" tone="warning">
          Only the code hash is stored by the real backend. The code cannot be
          retrieved if lost. Replace it only while the device remains eligible
          and unclaimed. This demo never stores it in browser storage.
        </Notice>
        <label className="row">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
          />
          I have saved this example code securely
        </label>
        <div className="form-actions">
          <button
            className="btn"
            disabled={!saved}
            onClick={() => router.push(`/devices/${result.device.id}`)}
          >
            View device
          </button>
          {onAnother && (
            <button
              className="btn btn-secondary"
              disabled={!saved}
              onClick={onAnother}
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </section>
      <aside className="panel panel-body stack">
        <h2>What happens next</h2>
        <ol className="steps">
          <li>
            Share the serial and one-time ownership proof privately with the
            intended buyer.
          </li>
          <li>The buyer enters both in the Amortrav mobile app.</li>
          <li>
            Successful claiming assigns ownership and invalidates the code.
          </li>
        </ol>
        <p className="small muted">
          A claim code is not a hardware credential. No buyer claiming or
          physical device action is performed by this demo.
        </p>
      </aside>
      {leaving && (
        <ConfirmDialog
          title="Leave the one-time code?"
          description="Save the example code first. This view will be cleared when you leave; the original code cannot be retrieved later."
          confirm="Leave and clear"
          onClose={() => setLeaving(null)}
          onConfirm={async () => {
            setSaved(true);
            router.push(leaving);
          }}
        />
      )}
    </div>
  );
}
