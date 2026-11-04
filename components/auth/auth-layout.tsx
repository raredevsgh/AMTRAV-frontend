import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeSwitcher } from "@/components/marketing/theme-switcher";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-frame">
        <aside className="auth-brand">
          <Image
            src="/images/terminal-sunset.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 760px) 100vw, 40vw"
            className="auth-photo"
          />
          <Link href="/" aria-label="Amortrav home" className="auth-mark">
            <Image src="/images/brand-mark.png" alt="Amortrav" width={252} height={204} />
          </Link>
          <div>
            <span className="auth-eyebrow">EVERY JOURNEY STARTS HERE</span>
            <h1>
              Amortrav <br />
              console
            </h1>
            <p>
              Register smart luggage, hand off claim codes and keep the device registry
              clean.
            </p>
          </div>
          <div className="auth-audiences">
            <span>For manufacturers</span>
            <span>For Amortrav staff</span>
          </div>
        </aside>
        <main className="auth-main">
          <Link className="auth-back" href="/">
            <ArrowLeft size={16} /> Back to Amortrav
          </Link>
          <div className="auth-theme">
            <ThemeSwitcher />
          </div>
          {children}
          <p className="auth-footnote">Your bags. Your team. One connected workspace.</p>
        </main>
      </div>
    </div>
  );
}
