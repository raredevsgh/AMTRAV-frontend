"use client";

import Image from "next/image";
import { useState } from "react";

// Figma "App signup / Desktop" (2020:591) and "/ Mobile" (2020:619): email capture shared by all
// pages. There is no waitlist endpoint yet, so a valid submission only shows a notice and sends nothing.
export default function AppSignup() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="signup"
      className="relative flex scroll-mt-[88px] flex-col items-center gap-6 overflow-clip rounded-3xl bg-navy px-5 py-10 xl:scroll-mt-[108px] xl:gap-5 xl:rounded-[32px] xl:px-14 xl:py-20"
    >
      <Image src="/img/signup-bg-mobile.svg" alt="" fill className="pointer-events-none xl:hidden" />
      <Image src="/img/signup-bg-desktop.svg" alt="" fill className="pointer-events-none hidden xl:block" />

      <Image src="/img/cta-mark.png" alt="" width={64} height={52} className="relative h-[51.81px] w-16 object-cover" />

      <div className="relative flex w-full flex-col items-center gap-3 text-center xl:w-auto xl:gap-2">
        <h2 className="text-h1-m font-bold text-white xl:min-w-[512px] xl:text-h1 xl:whitespace-nowrap">
          Ready when <br className="xl:hidden" />
          your flight is.
        </h2>
        <p className="text-small text-stale xl:w-[520px] xl:text-lead">
          AMORTRAV is in development. Leave your email and we will write when it is ready to order.
        </p>
      </div>

      <form
        className="relative flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-start xl:gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <label className="flex w-full items-center gap-3.5 rounded-xl bg-white px-5 py-4 xl:h-[53px] xl:w-[421px] xl:py-2.5">
          <Image src="/icons/mail.svg" alt="" width={21} height={18} />
          <span className="sr-only">Your email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            onChange={() => setSubmitted(false)}
            className="min-w-0 flex-1 bg-transparent text-small text-navy outline-none placeholder:text-mid xl:text-caption"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-2xl bg-brand px-5 py-4 text-btn-sm font-bold whitespace-nowrap text-surface xl:w-auto xl:text-btn"
        >
          Join the Experience
        </button>
      </form>

      <p role="status" className="relative text-caption text-blue-pale empty:hidden">
        {submitted ? "Sign-up isn't open yet. Please check back soon." : ""}
      </p>
    </section>
  );
}
