"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createMockApi, type MockApiService } from "@/lib/api";
import type { User } from "@/lib/api/types";
import {
  consoleFiles,
  consoleFileBodies,
  consoleUsers,
} from "@/lib/console-fixtures";
import { designDevices, designAudits, designTelemetry, designJourneys, designCustomers, designAlerts } from "@/lib/admin-design-fixtures";

const Context = createContext<{
  api: MockApiService;
  presentation: "operations" | "engineering";
  dataRevision: number;
  notifyDataChanged: () => void;
} | null>(null);
export function ConsoleProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const presentation: "operations" | "engineering" = "operations";
  const [dataRevision,setDataRevision] = useState(0);
  const notifyDataChanged = useCallback(() => setDataRevision((value) => value + 1),[]);
  // Temporary sample adapter. Replace this single construction point during backend integration.
  const [api] = useState(() => createMockApi({
    actor:user,devices:designDevices,users:consoleUsers,files:consoleFiles,
    audits:designAudits,fileBodies:consoleFileBodies,activities:[],
    telemetries:designTelemetry,journeys:designJourneys,customers:designCustomers,
    alerts:designAlerts,provisionTelemetry:false,advanceJobs:true,latencyMs:120,
  }));
  return (
    <Context.Provider
      value={{
        api,
        presentation,
        dataRevision,
        notifyDataChanged,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useConsole() {
  const api = useContext(Context);
  if (!api) throw new Error("Console provider is required");
  return api.api;
}

export function useConsoleState() {
  const context = useContext(Context);
  if (!context) throw new Error("Console provider is required");
  return context;
}
// Derive loading from the request identity; stale requests cannot overwrite a new resource.
export function useResource<T>(load: () => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    load: typeof load;
    revision: number;
    data?: T;
    error?: unknown;
  } | null>(null);
  useEffect(() => {
    let active = true;
    void load().then(
      (data) => {
        if (active) setResult({ load, revision, data });
      },
      (error) => {
        if (active) setResult({ load, revision, error });
      },
    );
    return () => {
      active = false;
    };
  }, [load, revision]);
  const current = result?.load === load && result.revision === revision;
  return {
    data: current ? result.data : undefined,
    error: current ? result.error : null,
    loading: !current,
    retry: useCallback(() => setRevision((n) => n + 1), []),
    updateData: (update:(data:T)=>T) => setResult((previous) =>
      previous?.load === load && previous.revision === revision && previous.data !== undefined
        ? {...previous,data:update(previous.data)} : previous),
  };
}
