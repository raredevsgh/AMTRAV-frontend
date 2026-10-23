"use client";

import Image from "next/image";
import { useState } from "react";

// Figma "Claim panel" (2045:1465): pairing demo with a serial and a one-time code.
// Tapping "Claim this bag" flips it to Claimed; tapping again resets it.
export default function ClaimPanel() {
  const [claimed, setClaimed] = useState(false);
  const field = "flex h-11 w-full items-center overflow-clip rounded-full bg-surface px-[18px] font-mono text-mono-m font-medium whitespace-nowrap text-navy xl:h-[47px] xl:text-mono";

  return (
    <div className="flex w-full flex-col gap-3 rounded-[20px] bg-white p-4 xl:min-w-0 xl:flex-1 xl:rounded-[22px] xl:p-5">
      <p className={field}>AMT-CO55-00F3A1</p>
      <p className={field} aria-label="One-time code, hidden">
        •••••••••
      </p>
      <button
        type="button"
        aria-pressed={claimed}
        onClick={() => setClaimed(!claimed)}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-full text-caption-m whitespace-nowrap text-white xl:h-12 xl:text-caption ${
          claimed ? "bg-navy" : "bg-brand"
        }`}
      >
        {claimed && <Image src="/icons/check.svg" alt="" width={18} height={18} />}
        {claimed ? "Claimed" : "Claim this bag"}
      </button>
    </div>
  );
}
