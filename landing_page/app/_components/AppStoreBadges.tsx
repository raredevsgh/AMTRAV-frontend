"use client";

import React from "react";
import Link from "next/link";
import { GET_THE_APP_HREF } from "./nav";

interface AppStoreBadgesProps {
  className?: string;
  variant?: "hero" | "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function AppleAppStoreBadge({
  variant = "dark",
  size = "md",
  className = "",
}: {
  variant?: "hero" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const isHero = variant === "hero";
  const isLight = variant === "light";

  const heightClasses = {
    sm: "h-10 px-3.5 gap-2.5",
    md: "h-12 px-4 gap-3",
    lg: "h-13 px-5 gap-3.5",
  }[size];

  const bgClasses = isHero
    ? "bg-black/60 hover:bg-black/80 text-white border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg shadow-black/20"
    : isLight
    ? "bg-white hover:bg-slate-50 text-navy border border-divider shadow-xs hover:border-navy/30"
    : "bg-black hover:bg-neutral-900 text-white border border-white/10 shadow-md";

  return (
    <Link
      href={GET_THE_APP_HREF}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 select-none ${heightClasses} ${bgClasses} ${className}`}
      aria-label="Download on the Apple App Store"
    >
      {/* Apple Logo SVG */}
      <svg
        className={size === "sm" ? "size-5 shrink-0" : "size-6 shrink-0"}
        viewBox="0 0 170 170"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.36-8.23-9.67-17.51-12.93-27.84-3.26-10.33-4.89-20.2-4.89-29.61 0-13.15 3.37-24.12 10.12-32.92 6.74-8.79 15.22-13.3 25.43-13.51 4.57 0 9.77 1.25 15.61 3.75 5.83 2.5 9.73 3.8 11.71 3.91 1.74-.11 5.86-1.47 12.37-4.08 6.52-2.61 12.11-3.8 16.76-3.58 12.63.66 22.33 5.37 29.11 14.13-11.1 6.74-16.54 16.03-16.32 27.88.22 9.24 3.8 16.96 10.74 23.16 4.35 3.91 9.46 6.69 15.33 8.33-2.18 6.31-4.84 12.56-7.97 18.76zM119.22 31.84c0-7.39 2.66-14.02 7.97-19.89 5.32-5.87 11.79-9.35 19.41-10.45.11 1.09.16 2.07.16 2.94 0 7.39-2.77 14.18-8.31 20.38-5.54 6.19-12.23 9.67-20.06 10.43-.22-1.08-.34-2.22-.34-3.41z" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className={`font-medium tracking-tight ${isLight ? "text-slate-500" : "text-white/70"} ${size === "sm" ? "text-[8.5px]" : "text-[9.5px]"}`}>
          Download on the
        </span>
        <span className={`font-bold tracking-tight ${isLight ? "text-navy" : "text-white"} ${size === "sm" ? "text-[13px]" : "text-[15px]"}`}>
          App Store
        </span>
      </div>
    </Link>
  );
}

export function GooglePlayBadge({
  variant = "dark",
  size = "md",
  className = "",
}: {
  variant?: "hero" | "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const isHero = variant === "hero";
  const isLight = variant === "light";

  const heightClasses = {
    sm: "h-10 px-3.5 gap-2.5",
    md: "h-12 px-4 gap-3",
    lg: "h-13 px-5 gap-3.5",
  }[size];

  const bgClasses = isHero
    ? "bg-black/60 hover:bg-black/80 text-white border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg shadow-black/20"
    : isLight
    ? "bg-white hover:bg-slate-50 text-navy border border-divider shadow-xs hover:border-navy/30"
    : "bg-black hover:bg-neutral-900 text-white border border-white/10 shadow-md";

  return (
    <Link
      href={GET_THE_APP_HREF}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 select-none ${heightClasses} ${bgClasses} ${className}`}
      aria-label="Get it on Google Play"
    >
      {/* Official Google Play Triangle Logo */}
      <svg
        className={size === "sm" ? "size-5 shrink-0" : "size-6 shrink-0"}
        viewBox="0 0 512 512"
        aria-hidden="true"
      >
        <path
          d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"
          fill="#4285F4"
        />
        <path
          d="M47 0C44 3.2 42.4 7.6 42.4 13v486c0 5.4 1.6 9.8 4.6 13l240.2-256L47 0z"
          fill="#00E676"
        />
        <path
          d="M325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"
          fill="#EA4335"
        />
        <path
          d="M451.8 232.3l-66.4-38.1-60.1 61.8 60.1 60.1 66.4-38.1c19-10.9 19-28.7 0-39.6z"
          fill="#FBBC04"
        />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className={`font-semibold tracking-wider uppercase ${isLight ? "text-slate-500" : "text-white/70"} ${size === "sm" ? "text-[8px]" : "text-[8.5px]"}`}>
          GET IT ON
        </span>
        <span className={`font-bold tracking-tight ${isLight ? "text-navy" : "text-white"} ${size === "sm" ? "text-[13px]" : "text-[15px]"}`}>
          Google Play
        </span>
      </div>
    </Link>
  );
}

export default function AppStoreBadges({
  className = "",
  variant = "hero",
  size = "md",
}: AppStoreBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}>
      <AppleAppStoreBadge variant={variant} size={size} />
      <GooglePlayBadge variant={variant} size={size} />
    </div>
  );
}
