import { Suspense } from "react";
import { ConsoleBrand } from "@/components/console-brand";
import { LoginFlight } from "@/components/login-flight";
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
          <ConsoleBrand light consoleLabel />
        </div>
        <LoginFlight />
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
