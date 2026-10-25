import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="min-h-screen" />
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
