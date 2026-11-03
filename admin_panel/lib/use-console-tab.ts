"use client";
import {useSearchParams} from "next/navigation";

/** Keep detail/operations tabs shareable and refresh-safe without adding a history entry. */
export function useConsoleTab<T extends string>(allowed:readonly T[],fallback:T):readonly [T,(value:T)=>void] {
  const params=useSearchParams();
  const requested=params.get("tab");
  const value=allowed.find((item) => item === requested) ?? fallback;
  const select=(next:T) => {
    const url=new URL(window.location.href);
    if(next === fallback)url.searchParams.delete("tab");else url.searchParams.set("tab",next);
    window.history.replaceState(null,"",url.pathname+url.search+url.hash);
  };
  return [value,select];
}
