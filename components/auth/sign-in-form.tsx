"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/console/otp-input";
import { api, ApiError } from "@/lib/console/api";
import type { User } from "@/lib/console/types";
import { getPasskey, usePasskeySupport } from "@/lib/console/webauthn";

const schema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Enter your password."),
});

type SignInResult = { user: User } | { mfa_required: true; methods: string[] };

export function SignInForm() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [methods, setMethods] = useState<string[] | null>(null);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const passkeys = usePasskeySupport();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function attempt(step: () => Promise<SignInResult | void>) {
    setError("");
    setBusy(true);
    try {
      const result = await step();
      if (result && "mfa_required" in result) {
        setMethods(result.methods);
      } else {
        router.replace("/console");
      }
    } catch (error) {
      // The second-factor challenge lasts five minutes; once it's gone, only signing in
      // again helps, so go back to the password step instead of failing every code.
      if (error instanceof ApiError && error.status === 410) {
        setMethods(null);
        setCode("");
        setRecovery(false);
      }
      setError(
        error instanceof Error ? error.message : "Could not sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const signIn = (values: z.infer<typeof schema>) =>
    attempt(() =>
      api<SignInResult>("auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    );

  // The challenge token stays in an HttpOnly cookie; the gateway attaches it.
  const verifyCode = (value = code) =>
    attempt(() =>
      api<SignInResult>("auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({ code: value.trim() }),
      }),
    );

  const verifyPasskey = () =>
    attempt(async () => {
      const options = await api<{ publicKey: Record<string, unknown> }>(
        "auth/mfa/passkey/start",
        { method: "POST", body: "{}" },
      );
      const credential = await getPasskey(options);
      return api<SignInResult>("auth/mfa/passkey/finish", {
        method: "POST",
        body: JSON.stringify({ credential }),
      });
    });

  const passkeySignIn = () =>
    attempt(async () => {
      const { login_id, options } = await api<{
        login_id: string;
        options: { publicKey: Record<string, unknown> };
      }>("auth/passkeys/login/start", { method: "POST" });
      const credential = await getPasskey(options);
      return api<SignInResult>("auth/passkeys/login/finish", {
        method: "POST",
        body: JSON.stringify({ login_id, credential }),
      });
    });

  if (methods)
    return (
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          verifyCode();
        }}
        noValidate
      >
        <span className="auth-lock">
          <ShieldCheck size={22} />
        </span>
        <div className="auth-heading">
          <h2>Two-step verification</h2>
          <p>
            {methods.includes("totp")
              ? "Enter the six-digit code from your authenticator app, or a recovery code."
              : "Use your passkey or a recovery code to finish signing in."}
          </p>
        </div>
        {error && (
          <div className="console-alert error" role="alert">
            {error}
          </div>
        )}
        {methods.includes("passkey") && passkeys && (
          <Button
            type="button"
            className="console-button auth-submit"
            onClick={verifyPasskey}
            disabled={busy}
          >
            <Fingerprint size={18} /> Use a passkey
          </Button>
        )}
        {methods.includes("totp") && !recovery ? (
          <div className="field">
            <Label htmlFor="mfa-code">Six-digit code</Label>
            <OtpInput
              id="mfa-code"
              label="Six-digit code from your authenticator app"
              value={code}
              onChange={setCode}
              onComplete={(value) => {
                if (!busy) verifyCode(value);
              }}
              disabled={busy}
              autoFocus
            />
          </div>
        ) : (
          <div className="field">
            <Label htmlFor="mfa-code">Recovery code</Label>
            <Input
              id="mfa-code"
              autoComplete="one-time-code"
              placeholder="xxxxx-xxxxx"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoFocus
            />
          </div>
        )}
        {methods.includes("totp") && (
          <button
            type="button"
            className="auth-help"
            onClick={() => {
              setRecovery(!recovery);
              setCode("");
              setError("");
            }}
          >
            {recovery ? "Use my authenticator app" : "Use a recovery code instead"}
          </button>
        )}
        <Button
          type="submit"
          className="console-button auth-submit"
          disabled={busy || (methods.includes("totp") && !recovery ? code.length !== 6 : !code.trim())}
        >
          {busy ? (
            <>
              <LoaderCircle className="animate-spin" size={18} /> Verifying…
            </>
          ) : (
            <>
              Verify <ArrowRight size={18} />
            </>
          )}
        </Button>
        <button
          type="button"
          className="auth-help"
          onClick={() => {
            setMethods(null);
            setCode("");
            setRecovery(false);
            setError("");
          }}
        >
          Start over
        </button>
      </form>
    );

  return (
    <form className="auth-form" onSubmit={handleSubmit(signIn)} noValidate>
      <span className="auth-lock">
        <LockKeyhole size={22} />
      </span>
      <div className="auth-heading">
        <h2>Welcome back</h2>
        <p>
          Sign in with the email and password your admin set up. Travelers use the mobile
          app.
        </p>
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
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p className="field-error" id="email-error">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="field">
        <Label htmlFor="password">Password</Label>
        <div className="password-input">
          <Input
            id="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
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
        {errors.password && (
          <p className="field-error" id="password-error">
            {errors.password.message}
          </p>
        )}
        <Link href="/forgot-password" className="auth-forgot">
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        className="console-button auth-submit"
        disabled={isSubmitting || busy}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" size={18} /> Signing in…
          </>
        ) : (
          <>
            Sign in <ArrowRight size={18} />
          </>
        )}
      </Button>
      {passkeys && (
        <Button
          type="button"
          className="console-secondary auth-submit"
          onClick={passkeySignIn}
          disabled={isSubmitting || busy}
        >
          <Fingerprint size={18} /> Sign in with a passkey
        </Button>
      )}
      <Link href="/account-help" className="auth-help">
        Need an account or help signing in?
      </Link>
    </form>
  );
}
