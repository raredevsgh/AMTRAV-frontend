"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api, ApiError, listAll, listDevices } from "@/lib/console/api";
import { previewDevices, previewUser, previewUsers } from "@/lib/console/demo";
import type { MfaStatus, StaffRole, User } from "@/lib/console/types";
import { isStaff } from "@/lib/console/policy";
import { MfaEnrolmentGate } from "./mfa";
import { WorkspaceSkeleton } from "./workspace-skeleton";
import {
  OfflineProvider,
  restoreSavedWorkspace,
  useOnline,
  wipeLocalData,
} from "./offline";

const ConsoleContext = createContext<{
  user: User;
  preview: boolean;
  base: string;
} | null>(null);

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (!context) throw new Error("Console provider missing");
  return context;
}

function SessionGate({
  children,
  previewRole,
}: {
  children: ReactNode;
  previewRole?: StaffRole;
}) {
  const router = useRouter();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<User>("auth/me"),
    enabled: !previewRole,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
  const user = previewRole ? previewUser(previewRole) : session.data;
  const unauthorized = session.error instanceof ApiError && session.error.status === 401;
  const client = useQueryClient();
  const online = useOnline();
  // Shares the cache entry used by the Security page.
  const mfa = useQuery({
    queryKey: ["mfa", user?.id, false],
    queryFn: () => api<MfaStatus>("auth/mfa"),
    enabled: !previewRole && !!user && isStaff(user.role),
    retry: false,
  });
  const enrolmentPending = !previewRole && !!mfa.data?.required && !mfa.data.enabled;
  useEffect(() => {
    if (unauthorized || (user && !isStaff(user.role)))
      // An ended session must not leave its data readable on this device.
      wipeLocalData(client).finally(() => router.replace("/sign-in"));
  }, [unauthorized, user, router, client]);

  if (!previewRole && !user && !online) {
    return (
      <div className="console-gate">
        <h1>You’re offline.</h1>
        <p>This device has no saved workspace yet. Connect once to sign in.</p>
      </div>
    );
  }
  // With saved data, a failed check while offline still shows the workspace.
  if (!previewRole && session.isError && !unauthorized && !session.data) {
    return (
      <div className="console-gate">
        <h1>We couldn’t open your workspace.</h1>
        <p>{session.error.message}</p>
        <button className="console-button" onClick={() => session.refetch()}>
          Try again
        </button>
        <Link href="/sign-in">Back to sign in</Link>
      </div>
    );
  }
  if (
    !user ||
    !isStaff(user.role) ||
    unauthorized ||
    (!previewRole && mfa.isPending && online)
  ) {
    return <WorkspaceSkeleton />;
  }
  return (
    <ConsoleContext.Provider
      value={{
        user,
        preview: !!previewRole,
        base: previewRole ? `/preview/${previewRole}` : "/console",
      }}
    >
      {enrolmentPending ? (
        <MfaEnrolmentGate
          onComplete={() => {
            client.invalidateQueries({ queryKey: ["mfa"] });
            client.invalidateQueries({ queryKey: ["session"] });
          }}
        />
      ) : previewRole ? (
        children
      ) : (
        <OfflineProvider user={user}>{children}</OfflineProvider>
      )}
    </ConsoleContext.Provider>
  );
}

export function ConsoleProvider({
  children,
  previewRole,
}: {
  children: ReactNode;
  previewRole?: StaffRole;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: false },
          // Fail fast offline instead of pausing: a paused action would run by itself
          // on reconnect. Only device edits are queued, explicitly, in the outbox.
          mutations: { networkMode: "always" },
        },
      }),
  );
  const [restored, setRestored] = useState(!!previewRole);
  useEffect(() => {
    if (previewRole) return;
    restoreSavedWorkspace(client).finally(() => setRestored(true));
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, [client, previewRole]);
  return (
    <QueryClientProvider client={client}>
      {restored ? (
        <SessionGate previewRole={previewRole}>{children}</SessionGate>
      ) : (
        <WorkspaceSkeleton />
      )}
    </QueryClientProvider>
  );
}

export function useDevices() {
  const { user, preview } = useConsole();
  return useQuery({
    queryKey: ["devices", user.id, preview],
    queryFn: ({ signal }) =>
      preview
        ? Promise.resolve(
            previewDevices.filter(
              (d) => user.role === "admin" || d.manufacturer_id === user.id,
            ),
          )
        : listDevices("devices", signal),
  });
}

export function useUsers() {
  const { user, preview } = useConsole();
  return useQuery({
    queryKey: ["users", user.id, preview],
    queryFn: ({ signal }) =>
      preview ? Promise.resolve(previewUsers) : listAll<User>("admin/users", signal),
    enabled: user.role === "admin",
  });
}
