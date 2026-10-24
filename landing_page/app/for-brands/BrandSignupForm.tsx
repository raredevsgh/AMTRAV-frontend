"use client";

import Image from "next/image";
import { useState } from "react";

export default function BrandSignupForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-3 pt-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:gap-3"
      >
        <label className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-[#DCE1EA] bg-white px-4 py-2 text-sm text-[#0B1B3D] shadow-sm transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 sm:h-[50px]">
          <Image src="/icons/mail.svg" alt="" width={18} height={16} className="opacity-60" />
          <span className="sr-only">Your email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            onChange={() => setSubmitted(false)}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0B1B3D] outline-none placeholder:text-[#8D96A8]"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-6 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-sky hover:text-navy active:scale-[0.98] sm:h-[50px] sm:px-7 sm:text-base whitespace-nowrap"
        >
          Join the Experience
        </button>
      </form>
      {submitted && (
        <p role="status" className="text-sm font-medium text-brand">
          Sign-up isn&apos;t open yet. Please check back soon.
        </p>
      )}
    </div>
  );
}
