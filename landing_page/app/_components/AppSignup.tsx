"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GET_THE_APP_HREF } from "./nav";

// Figma "App signup / Desktop" (2020:591) and "/ Mobile" (2020:619): email capture shared by all
// pages. There is no waitlist endpoint yet, so a valid submission only shows a notice and sends nothing.
export default function AppSignup() {
  const pathname = usePathname();
  const shop = pathname === "/shop";
  const [submitted, setSubmitted] = useState(false);
  const email = useRef<HTMLInputElement>(null);

  // "Get the app" links scroll here; with a mouse or trackpad, also put the cursor in the email
  // field. Touch screens are left alone so the keyboard doesn't open mid-scroll.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element && e.target.closest(`a[href="${GET_THE_APP_HREF}"]`);
      if (link && matchMedia("(pointer: fine)").matches) email.current?.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section
      id="signup"
      className="relative flex scroll-mt-[88px] flex-col items-center gap-6 overflow-clip rounded-3xl bg-navy px-5 py-10 xl:scroll-mt-[108px] xl:gap-5 xl:rounded-[32px] xl:px-14 xl:py-20"
    >
      {/* Mobile Animated Sky Background */}
      <svg
        viewBox="0 0 366 446"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full xl:hidden"
      >
        {/* Soft Background Clouds */}
        <g opacity="0.1">
          <path d="M90.1 122.157C102.526 122.157 112.6 107.489 112.6 89.3961C112.6 71.3029 102.526 56.6355 90.1 56.6355C77.6736 56.6355 67.6 71.3029 67.6 89.3961C67.6 107.489 77.6736 122.157 90.1 122.157Z" fill="white" />
          <path d="M101.4 104.206C108.58 104.206 114.4 86.8861 114.4 65.5212C114.4 44.1564 108.58 26.8368 101.4 26.8368C94.2203 26.8368 88.4 44.1564 88.4 65.5212C88.4 86.8861 94.2203 104.206 101.4 104.206Z" fill="white" />
        </g>
        <g opacity="0.08">
          <path d="M230.9 393.127C246.474 393.127 259.1 377.134 259.1 357.405C259.1 337.676 246.474 321.682 230.9 321.682C215.326 321.682 202.7 337.676 202.7 357.405C202.7 377.134 215.326 393.127 230.9 393.127Z" fill="white" />
        </g>

        {/* Dotted Flight Path */}
        <path
          d="M -30 410 C 50 360, 90 258, 180 262 C 270 266, 320 180, 390 80"
          fill="none"
          stroke="#416196"
          strokeWidth="2"
          strokeDasharray="3 8"
          strokeLinecap="round"
        />

        {/* Smooth Animated Plane */}
        <g>
          <path
            d="M12 0 C12 -1.5 10.5 -2 9 -2 L3 -2 L-4 -10 L-7 -10 L-3 -2 L-8 -2 L-10 -5 L-12 -5 L-11 0 L-12 5 L-10 5 L-8 2 L-3 2 L-7 10 L-4 10 L3 2 L9 2 C10.5 2 12 1.5 12 0 Z"
            fill="#FFFFFF"
            transform="scale(1.15)"
          />
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            rotate="auto"
            path="M -30 410 C 50 360, 90 258, 180 262 C 270 266, 320 180, 390 80"
          />
        </g>
      </svg>

      {/* Desktop Animated Sky Background */}
      <svg
        viewBox="0 0 1400 420"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden size-full xl:block"
      >
        {/* Soft Background Clouds */}
        <g opacity="0.1">
          <path d="M344.6 114.784C392.207 114.784 430.8 101 430.8 83.9969C430.8 66.9939 392.207 53.2103 344.6 53.2103C296.993 53.2103 258.4 66.9939 258.4 83.9969C258.4 101 296.993 114.784 344.6 114.784Z" fill="white" />
          <path d="M387.7 97.9658C415.038 97.9658 437.2 81.6723 437.2 61.5732C437.2 41.4742 415.038 25.1807 387.7 25.1807C360.362 25.1807 338.2 41.4742 338.2 61.5732C338.2 81.6723 360.362 97.9658 387.7 97.9658Z" fill="white" />
        </g>
        <g opacity="0.08">
          <path d="M883.1 369.347C942.581 369.347 990.8 354.329 990.8 335.804C990.8 317.278 942.581 302.26 883.1 302.26C823.619 302.26 775.4 317.278 775.4 335.804C775.4 354.329 823.619 369.347 883.1 369.347Z" fill="white" />
        </g>

        {/* Dotted Flight Path */}
        <path
          d="M -60 380 C 240 375, 480 244, 780 247 C 1080 250, 1280 170, 1460 70"
          fill="none"
          stroke="#416196"
          strokeWidth="2"
          strokeDasharray="3 9"
          strokeLinecap="round"
        />

        {/* Smooth Animated Plane */}
        <g>
          <path
            d="M12 0 C12 -1.5 10.5 -2 9 -2 L3 -2 L-4 -10 L-7 -10 L-3 -2 L-8 -2 L-10 -5 L-12 -5 L-11 0 L-12 5 L-10 5 L-8 2 L-3 2 L-7 10 L-4 10 L3 2 L9 2 C10.5 2 12 1.5 12 0 Z"
            fill="#FFFFFF"
            transform="scale(1.25)"
          />
          <animateMotion
            dur="12s"
            repeatCount="indefinite"
            rotate="auto"
            path="M -60 380 C 240 375, 480 244, 780 247 C 1080 250, 1280 170, 1460 70"
          />
        </g>
      </svg>

      <Image data-reveal src="/img/cta-mark.png" alt="" width={64} height={52} className="relative h-[51.81px] w-16 object-cover" />

      <div data-reveal className="relative flex w-full flex-col items-center gap-3 text-center [--motion-delay:80ms] xl:w-auto xl:gap-2">
        <h2 className="text-h1-m font-bold text-white xl:min-w-[512px] xl:text-h1 xl:whitespace-nowrap">
          {shop ? "Not ready to pre-order?" : <>Ready when <br className="xl:hidden" />your flight is.</>}
        </h2>
        <p className="text-small text-stale xl:w-[520px] xl:text-lead">
          {shop ? "Join the Founding Traveller List and we’ll email you when TRACE ships, so you can order then." : "AMORTRAV is in development. Leave your email and we will write when it is ready to order."}
        </p>
      </div>

      <form
        data-reveal
        className="relative flex w-full flex-col gap-3 [--motion-delay:160ms] xl:w-auto xl:flex-row xl:items-start xl:gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <label className="flex w-full items-center gap-3.5 rounded-xl bg-white px-5 py-4 transition-[outline-color] duration-200 outline-2 outline-offset-2 outline-transparent focus-within:outline-sky xl:h-[53px] xl:w-[421px] xl:py-2.5">
          <Image src="/icons/mail.svg" alt="" width={21} height={18} />
          <span className="sr-only">Your email</span>
          <input
            ref={email}
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
          className="w-full rounded-2xl bg-brand px-5 py-4 text-btn-sm font-bold whitespace-nowrap text-surface transition-[background-color,color,scale] duration-200 ease-out-soft hover:bg-sky hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky motion-safe:active:scale-[0.97] xl:w-auto xl:text-btn"
        >
          Join the list
        </button>
      </form>

      <p role="status" className="relative text-caption text-blue-pale empty:hidden">
        {submitted ? "Sign-up isn't open yet. Please check back soon." : ""}
      </p>
    </section>
  );
}
