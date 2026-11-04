"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Download,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { api } from "@/lib/console/api";
import { previewMfa } from "@/lib/console/demo";
import type { MfaStatus, PasskeySummary, TotpSetup } from "@/lib/console/types";
import { createPasskey, usePasskeySupport } from "@/lib/console/webauthn";
import { OtpInput } from "./otp-input";
import { useConsole } from "./provider";
import { dateLabel, ErrorState, LoadingState } from "./shared";

const svgSource = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export function useMfaStatus(enabled = true) {
  const { user, preview } = useConsole();
  return useQuery({
    queryKey: ["mfa", user.id, preview],
    queryFn: ({ signal }) =>
      preview ? Promise.resolve(previewMfa) : api<MfaStatus>("auth/mfa", { signal }),
    enabled,
  });
}

function saveFile(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function RecoveryCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = `Amortrav recovery codes\nEach code works once.\n\n${codes.join("\n")}\n`;
  return (
    <div className="mfa-panel" role="region" aria-label="Recovery codes">
      <h3>Save your recovery codes</h3>
      <p>
        If you lose your authenticator or passkey, each code signs you in once. They are
        shown only now. Store them somewhere safe and offline.
      </p>
      <ol className="recovery-codes">
        {codes.map((code) => (
          <li key={code} className="mono">
            {code}
          </li>
        ))}
      </ol>
      <div className="console-actions">
        <button
          className="console-secondary"
          onClick={() =>
            navigator.clipboard.writeText(codes.join("\n")).then(() => setCopied(true))
          }
        >
          <Copy size={16} /> {copied ? "Copied" : "Copy"}
        </button>
        <button
          className="console-secondary"
          onClick={() => saveFile("amortrav-recovery-codes.txt", text)}
        >
          <Download size={16} /> Download
        </button>
        <button className="console-button" onClick={onDone}>
          I’ve saved them
        </button>
      </div>
    </div>
  );
}

export function TotpEnrolment({
  onEnrolled,
}: {
  onEnrolled: (codes: string[] | null) => void;
}) {
  const { preview } = useConsole();
  const [code, setCode] = useState("");
  const setup = useMutation({
    mutationFn: () => api<TotpSetup>("auth/mfa/totp/setup", { method: "POST" }),
  });
  const confirm = useMutation({
    mutationFn: () =>
      api<{ recovery_codes: string[] | null }>("auth/mfa/totp/confirm", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: (result) => onEnrolled(result.recovery_codes),
  });
  if (!setup.data)
    return (
      <div className="mfa-option">
        <Smartphone size={22} />
        <div>
          <strong>Authenticator app</strong>
          <p>Use 1Password, Google Authenticator, Microsoft Authenticator or similar.</p>
          {setup.isError && <p className="field-error">{setup.error.message}</p>}
        </div>
        <button
          className="console-button"
          disabled={preview || setup.isPending}
          onClick={() => setup.mutate()}
        >
          {setup.isPending ? "Preparing…" : "Set up"}
        </button>
      </div>
    );
  return (
    <form
      className="mfa-panel totp-setup"
      onSubmit={(event) => {
        event.preventDefault();
        confirm.mutate();
      }}
    >
      <h3>Scan with your authenticator app</h3>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated data-URI SVG; an <img> cannot run scripts */}
      <img
        src={svgSource(setup.data.qr_svg)}
        alt="QR code for your authenticator app"
        width={176}
        height={176}
      />
      <details>
        <summary>Can’t scan? Enter the key manually</summary>
        <code className="mono secret-key">{setup.data.secret}</code>
      </details>
      <label htmlFor="totp-code" className="mfa-label">
        Six-digit code from the app
      </label>
      <div className="mfa-inline">
        <OtpInput
          id="totp-code"
          label="Six-digit code from the app"
          value={code}
          onChange={setCode}
          disabled={confirm.isPending}
        />
        <button
          className="console-button"
          disabled={code.length !== 6 || confirm.isPending}
        >
          {confirm.isPending ? "Checking…" : "Turn on"}
        </button>
      </div>
      {confirm.isError && (
        <p className="field-error" role="alert">
          {confirm.error.message}
        </p>
      )}
    </form>
  );
}

export function PasskeyEnrolment({
  onEnrolled,
}: {
  onEnrolled: (codes: string[] | null) => void;
}) {
  const { preview } = useConsole();
  const [name, setName] = useState("");
  const supported = usePasskeySupport();
  const add = useMutation({
    mutationFn: async () => {
      const options = await api<{ publicKey: Record<string, unknown> }>(
        "auth/passkeys/register/start",
        { method: "POST" },
      );
      const credential = await createPasskey(options);
      return api<{ passkey: PasskeySummary; recovery_codes: string[] | null }>(
        "auth/passkeys/register/finish",
        {
          method: "POST",
          body: JSON.stringify({ name: name.trim() || "Passkey", credential }),
        },
      );
    },
    onSuccess: (result) => {
      setName("");
      onEnrolled(result.recovery_codes);
    },
  });
  if (!supported) return null;
  return (
    <form
      className="mfa-option"
      onSubmit={(event) => {
        event.preventDefault();
        add.mutate();
      }}
    >
      <Fingerprint size={22} />
      <div>
        <strong>Passkey</strong>
        <p>Touch ID, Windows Hello, your phone or a security key. Phishing-resistant.</p>
        <div className="mfa-inline">
          <input
            className="console-input"
            aria-label="Passkey name"
            placeholder="Name, e.g. Work laptop"
            maxLength={64}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button className="console-button" disabled={preview || add.isPending}>
            {add.isPending ? "Waiting…" : "Add passkey"}
          </button>
        </div>
        {add.isError && (
          <p className="field-error" role="alert">
            {add.error.message}
          </p>
        )}
      </div>
    </form>
  );
}

/** Security page section: manage every second factor. */
export function MfaSettings() {
  const { preview } = useConsole();
  const client = useQueryClient();
  const status = useMfaStatus();
  const [codes, setCodes] = useState<string[] | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [disableWithRecovery, setDisableWithRecovery] = useState(false);
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["mfa"] });
    client.invalidateQueries({ queryKey: ["session"] });
  };
  const enrolled = (fresh: string[] | null) => {
    if (fresh) setCodes(fresh);
    refresh();
  };
  const removePasskey = useMutation({
    mutationFn: (id: string) => api(`auth/passkeys/${id}/delete`, { method: "POST" }),
    onSuccess: refresh,
  });
  const disableTotp = useMutation({
    mutationFn: () =>
      api("auth/mfa/totp/disable", {
        method: "POST",
        body: JSON.stringify({ code: disableCode }),
      }),
    onSuccess: () => {
      setDisableCode("");
      refresh();
    },
  });
  const regenerate = useMutation({
    mutationFn: () =>
      api<{ recovery_codes: string[] }>("auth/mfa/recovery-codes", { method: "POST" }),
    onSuccess: (result) => {
      setCodes(result.recovery_codes);
      refresh();
    },
  });

  return (
    <section className="console-card">
      <div className="card-heading">
        <h2>Two-step verification</h2>
        {status.data?.enabled ? (
          <span className="device-status claimed">On</span>
        ) : (
          <span className="device-status revoked">Off</span>
        )}
      </div>
      {status.isPending ? (
        <LoadingState />
      ) : status.isError ? (
        <ErrorState message={status.error.message} retry={() => status.refetch()} />
      ) : codes ? (
        <RecoveryCodes codes={codes} onDone={() => setCodes(null)} />
      ) : (
        <div className="mfa-settings">
          <p className="field-hint">
            {status.data.required
              ? "Your role requires a second step at sign-in."
              : "Add a second step at sign-in to protect your account if your password leaks."}
          </p>
          {status.data.totp ? (
            <form
              className="mfa-option"
              onSubmit={(event) => {
                event.preventDefault();
                disableTotp.mutate();
              }}
            >
              <Smartphone size={22} />
              <div>
                <strong>Authenticator app</strong>
                <p>
                  On. Enter a current {disableWithRecovery ? "recovery code" : "code"} to
                  remove it.
                </p>
                <div className="mfa-inline">
                  {disableWithRecovery ? (
                    <input
                      className="console-input"
                      aria-label="Recovery code to remove the authenticator app"
                      placeholder="xxxxx-xxxxx"
                      value={disableCode}
                      onChange={(event) => setDisableCode(event.target.value)}
                    />
                  ) : (
                    <OtpInput
                      label="Code to remove the authenticator app"
                      value={disableCode}
                      onChange={setDisableCode}
                      disabled={disableTotp.isPending}
                    />
                  )}
                  <button
                    className="console-danger"
                    disabled={
                      preview ||
                      (disableWithRecovery ? !disableCode.trim() : disableCode.length !== 6) ||
                      disableTotp.isPending
                    }
                  >
                    Remove
                  </button>
                </div>
                <button
                  type="button"
                  className="auth-help mfa-switch"
                  onClick={() => {
                    setDisableWithRecovery(!disableWithRecovery);
                    setDisableCode("");
                  }}
                >
                  {disableWithRecovery ? "Use a code from the app" : "Use a recovery code instead"}
                </button>
                {disableTotp.isError && (
                  <p className="field-error" role="alert">
                    {disableTotp.error.message}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <TotpEnrolment onEnrolled={enrolled} />
          )}
          {status.data.passkeys_available ? (
            <>
              {status.data.passkeys.map((passkey) => (
                <div className="mfa-option" key={passkey.id}>
                  <KeyRound size={22} />
                  <div>
                    <strong>{passkey.name}</strong>
                    <p>
                      Added {dateLabel(passkey.created_at)} · last used{" "}
                      {dateLabel(passkey.last_used_at)}
                    </p>
                  </div>
                  <button
                    className="console-danger"
                    disabled={preview || removePasskey.isPending}
                    onClick={() => removePasskey.mutate(passkey.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <PasskeyEnrolment onEnrolled={enrolled} />
            </>
          ) : (
            <p className="field-hint">Passkeys aren’t configured on this server yet.</p>
          )}
          {removePasskey.isError && (
            <p className="console-alert error" role="alert">
              {removePasskey.error.message}
            </p>
          )}
          {status.data.enabled && (
            <div className="mfa-option">
              <ShieldCheck size={22} />
              <div>
                <strong>Recovery codes</strong>
                <p>{status.data.recovery_codes_remaining} unused codes left.</p>
              </div>
              <button
                className="console-secondary"
                disabled={preview || regenerate.isPending}
                onClick={() => regenerate.mutate()}
              >
                Generate new codes
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Shown instead of the workspace until a role that requires MFA enrols a factor. */
export function MfaEnrolmentGate({ onComplete }: { onComplete: () => void }) {
  const status = useMfaStatus();
  const [codes, setCodes] = useState<string[] | null>(null);
  const [done, setDone] = useState(false);
  const enrolled = (fresh: string[] | null) => {
    setDone(true);
    if (fresh) setCodes(fresh);
    else onComplete();
  };
  return (
    <div className="console-gate mfa-gate">
      <ShieldAlert size={32} />
      <h1>Set up two-step verification</h1>
      <p>
        Your account needs a second step at sign-in before you can use the console. Choose
        one now; you can add more later on the Security page.
      </p>
      {codes ? (
        <RecoveryCodes codes={codes} onDone={onComplete} />
      ) : done ? null : (
        <div className="mfa-settings">
          <TotpEnrolment onEnrolled={enrolled} />
          {status.data?.passkeys_available && <PasskeyEnrolment onEnrolled={enrolled} />}
        </div>
      )}
    </div>
  );
}
