import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ConsoleProvider } from "@/features/console-context";
import { requireConsoleSession } from "@/lib/console-session";
async function StaffBoundary({ children }: { children: React.ReactNode }) {
  const user = await requireConsoleSession();
  return (
    <ConsoleProvider key={user.id} user={user}>
      <AppShell user={user}>{children}</AppShell>
    </ConsoleProvider>
  );
}
export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="page-content" role="status">
          Loading workspace…
        </main>
      }
    >
      <StaffBoundary>{children}</StaffBoundary>
    </Suspense>
  );
}
