import Link from "next/link";
import { Building2, ArrowLeft, Smartphone } from "lucide-react";
export const metadata = { title: "Account help" };

export default function AccountHelpPage() {
  return (
    <section className="auth-form">
      <span className="auth-lock">
        <Building2 size={22} />
      </span>
      <div className="auth-heading">
        <h2>Let’s get you access.</h2>
        <p>
          Manufacturer accounts are created by an Amortrav administrator. There is no
          public staff signup.
        </p>
      </div>
      <article className="help-card">
        <h3>New manufacturer?</h3>
        <p>
          Contact your Amortrav representative to have your work email added. They will
          share your sign-in details privately.
        </p>
      </article>
      <article className="help-card">
        <h3>Forgot your password?</h3>
        <p>
          <Link href="/forgot-password">Reset it with a code sent to your email.</Link> If
          you can no longer reach that inbox, contact your Amortrav administrator.
        </p>
      </article>
      <article className="help-card">
        <Smartphone size={20} />
        <h3>Traveling with Amortrav?</h3>
        <p>
          Sign up or sign in in the mobile app, with Google or your email. Forgot your
          password? Choose “Forgot password?” in the app.
        </p>
      </article>
      <Link className="console-button" href="/sign-in">
        <ArrowLeft size={16} /> Back to sign in
      </Link>
    </section>
  );
}
