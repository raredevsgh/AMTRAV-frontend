"use client";
import { useState, useTransition } from "react";
import { enterDemo } from "@/app/login/actions";
import { validEmail } from "@/lib/api/validation";
import { Field, Notice } from "@/components/console-ui";
export function LoginForm({
  enabled,
  reason,
}: {
  enabled: boolean;
  reason?: string;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("admin");
  const [state, setState] = useState("normal");
  const [pending, startTransition] = useTransition();
  return (
    <div className="login-form">
      <h1>Sign in</h1>
      <p>Use your staff email and password to access the console.</p>
      {reason === "session" && (
        <Notice title="Sign in to continue">
          Your session is missing or expired.
        </Notice>
      )}
      {!enabled && (
        <Notice title="Staff sign-in is not connected yet" tone="warning">
          Contact an administrator. No credentials are sent or session granted.
        </Notice>
      )}
      <form
        className="mt-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const email = String(form.get("email") || "");
          const password = String(form.get("password") || "");
          const next: Record<string, string> = {};
          if (!validEmail(email))
            next.email = "Enter a valid work email address.";
          if (!password) next.password = "Enter your password.";
          if (enabled && validEmail(email) && !email.endsWith(".invalid"))
            next.email = "Use a fictional .invalid email in this demo.";
          setErrors(next);
          setMessage("");
          if (Object.keys(next).length) return;
          if (!enabled) {
            setMessage(
              "Service temporarily unavailable. Staff sign-in is not connected.",
            );
            return;
          }
          if (state === "invalid") {
            setMessage(
              "Email or password is incorrect. Check your details and try again.",
            );
            return;
          }
          if (state === "rate") {
            setMessage(
              "Too many sign-in attempts. Try again when the service allows. No Retry-After timing was supplied.",
            );
            return;
          }
          if (state === "unavailable") {
            setMessage("We can’t connect right now. Please try again.");
            return;
          }
          startTransition(async () => {
            await enterDemo(role);
          });
        }}
      >
        {message && <Notice title={message} tone="error" />}
        <Field label="Work email · Required" name="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete={enabled ? "off" : "username"}
            placeholder={
              enabled ? "ops@amortrav.example.invalid" : "name@company.com"
            }
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={pending}
          />
        </Field>
        <Field
          label="Password · Required"
          name="password"
          error={errors.password}
        >
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={enabled ? "off" : "current-password"}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={pending}
          />
        </Field>
        {enabled && (
          <div className="demo-controls stack">
            <strong>Fictional demo only · No real credentials</strong>
            <p>
              Email/password are validated locally and never submitted. Enter
              any fictional password. Workspace switching is not authentication.
            </p>
            <label>
              Demo role
              <select
                aria-label="Demo role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Administrator</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </label>
            <label>
              Sign-in state
              <select
                aria-label="Sign-in state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="normal">Success (demo only)</option>
                <option value="invalid">Invalid credentials</option>
                <option value="rate">Rate limited</option>
                <option value="unavailable">Service unavailable</option>
              </select>
            </label>
          </div>
        )}
        <button className="btn" disabled={pending} type="submit">
          {pending
            ? "Signing in…"
            : enabled
              ? "Enter demo workspace"
              : "Sign in"}
        </button>
        {pending && (
          <p role="status" className="small muted">
            Opening the fictional workspace. Please wait.
          </p>
        )}
      </form>
      <div className="login-help">
        Need access? Contact an administrator. Travellers sign in from the
        Amortrav mobile app, not here. Your administrator can help with password
        recovery.
      </div>
    </div>
  );
}
