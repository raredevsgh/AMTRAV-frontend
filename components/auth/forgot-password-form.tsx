"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/console/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 12;

/**
 * Self-service password reset: an emailed six-digit code sets a new password. The reset
 * signs the account out everywhere; two-step verification still applies at sign-in.
 */
export function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const send = () =>
    run(async () => {
      await api("auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setStep("code");
    });

  const reset = (event: FormEvent) => {
    event.preventDefault();
    return run(async () => {
      await api("auth/password/reset", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), code: code.replace(/\D/g, ""), password }),
      });
      setPassword("");
      setStep("done");
    });
  };

  if (step === "done")
    return (
      <section className="auth-form">
        <span className="auth-lock">
          <KeyRound size={22} />
        </span>
        <div className="auth-heading">
          <h2>Password changed.</h2>
          <p>
            Every device signed in to your account has been signed out. Sign in with your
            new password; two-step verification still applies.
          </p>
        </div>
        <Link className="console-button auth-submit" href="/sign-in">
          Sign in <ArrowRight size={18} />
        </Link>
      </section>
    );

  if (step === "code")
    return (
      <form className="auth-form" onSubmit={reset} noValidate>
        <span className="auth-lock">
          <MailCheck size={22} />
        </span>
        <div className="auth-heading">
          <h2>Check your email</h2>
          <p>
            If {email.trim()} has an Amortrav account, we’ve sent it a six-digit code. It
            expires in 15 minutes.
          </p>
        </div>
        {error && (
          <div className="console-alert error" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <Label htmlFor="reset-code">Code</Label>
          <Input
            id="reset-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123 456"
            maxLength={7}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </div>
        <div className="field">
          <Label htmlFor="new-password">New password</Label>
          <div className="password-input">
            <Input
              id="new-password"
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 12 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="field-hint">
            {password.length >= MIN_PASSWORD
              ? "Strong enough."
              : `At least ${MIN_PASSWORD} characters. A long phrase works well.`}
          </p>
        </div>
        <Button
          type="submit"
          className="console-button auth-submit"
          disabled={busy || code.replace(/\D/g, "").length !== 6 || password.length < MIN_PASSWORD}
        >
          {busy ? (
            <>
              <LoaderCircle className="animate-spin" size={18} /> Saving…
            </>
          ) : (
            <>
              Set new password <ArrowRight size={18} />
            </>
          )}
        </Button>
        <button type="button" className="auth-help" disabled={busy} onClick={send}>
          Send a new code
        </button>
        <button
          type="button"
          className="auth-help"
          onClick={() => {
            setError("");
            setCode("");
            setStep("email");
          }}
        >
          Use a different email
        </button>
      </form>
    );

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (EMAIL.test(email.trim())) send();
      }}
      noValidate
    >
      <span className="auth-lock">
        <KeyRound size={22} />
      </span>
      <div className="auth-heading">
        <h2>Forgot your password?</h2>
        <p>Enter your work email. We’ll send a six-digit code to set a new password.</p>
      </div>
      {error && (
        <div className="console-alert error" role="alert">
          {error}
        </div>
      )}
      <div className="field">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="console-button auth-submit"
        disabled={busy || !EMAIL.test(email.trim())}
      >
        {busy ? (
          <>
            <LoaderCircle className="animate-spin" size={18} /> Sending…
          </>
        ) : (
          <>
            Send code <ArrowRight size={18} />
          </>
        )}
      </Button>
      <Link href="/sign-in" className="auth-help">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </form>
  );
}
