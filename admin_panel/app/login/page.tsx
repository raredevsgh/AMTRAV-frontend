import { Suspense } from "react";
import { LoginForm } from "@/features/login-form";
import { demoEnabled } from "@/lib/console-session";
export const metadata = { title: "Sign in" };
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const enabled = await demoEnabled();
  const { reason } = await searchParams;
  return <LoginForm enabled={enabled} reason={reason} />;
}
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <main id="main-content" className="login-layout">
      <section className="login-brand" aria-label="Amortrav Console">
        <div className="brand">
          AMORTRAV <small>Console</small>
        </div>
        <svg
          aria-hidden="true"
          className="login-route"
          viewBox="0 0 720 900"
          preserveAspectRatio="none"
        >
          <path
            d="M 40 810 C 190 650 300 590 455 540 S 640 440 735 260"
            fill="none"
            stroke="#536b9d"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
        </svg>
        <div className="login-hero">
          <h2>
            The registry
            <br />
            behind every
            <br />
            Amortrav bag.
          </h2>
          <p>
            Register serials, hand off claim codes and keep the record clean.
          </p>
        </div>
        <div className="login-audience">
          <span>For manufacturers</span>
          <span>For Amortrav staff</span>
        </div>
      </section>
      <section className="login-form-wrap" aria-label="Staff sign-in">
        <Suspense fallback={<p role="status">Loading sign-in…</p>}>
          <Content searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
