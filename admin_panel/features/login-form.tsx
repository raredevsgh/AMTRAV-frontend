"use client";
import {useState,useTransition,type FormEvent} from "react";
import {enterDemo} from "@/app/login/actions";
import {validEmail} from "@/lib/api/validation";
import {Field,Notice} from "@/components/console-ui";

export function LoginForm({enabled,reason}:{enabled:boolean;reason?:string}) {
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [message,setMessage]=useState("");
  const [pending,startTransition]=useTransition();
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(pending)return;
    const form=new FormData(event.currentTarget);
    const email=String(form.get("email") ?? "");
    const password=String(form.get("password") ?? "");
    const next:Record<string,string>={};
    if(!validEmail(email))next.email="Enter a valid work email address.";
    if(!password)next.password="Enter your password.";
    setErrors(next);setMessage("");
    if(Object.keys(next).length)return;
    if(!enabled){setMessage("Staff sign-in is not connected yet.");return;}
    startTransition(async()=>{await enterDemo("admin");});
  }
  return <div className="login-form">
    <h1>Sign in</h1>
    <p>Access the AMORTRAV Admin Console.</p>
    {enabled && <p className="login-sample-note">Demo login opens temporary sample data. Backend sign-in is not connected.</p>}
    {reason==="session" && <Notice title="Sign in to continue">Your session is missing or expired.</Notice>}
    {!enabled && <Notice title="Staff sign-in is not connected yet" tone="warning">Contact an administrator to request access.</Notice>}
    <form onSubmit={submit} noValidate>
      {message && <Notice title={message} tone="error" />}
      <Field label="Work email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" required autoComplete={enabled ? "off" : "username"} defaultValue={enabled ? "ops@amortrav.example.invalid" : undefined} placeholder="name@company.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} disabled={pending} />
      </Field>
      <Field label="Password" name="password" error={errors.password}>
        <input id="password" name="password" type="password" required autoComplete={enabled ? "off" : "current-password"} defaultValue={enabled ? "sample-access" : undefined} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} disabled={pending} />
      </Field>
      <button className="btn" disabled={pending} aria-busy={pending} type="submit">{pending ? "Signing in…" : enabled ? "Demo login" : "Sign in"}</button>
    </form>
    <div className="login-help">Need access? Contact an administrator. Travellers sign in through the AMORTRAV mobile app.</div>
  </div>;
}
