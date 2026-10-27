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
  consoleAudits,
  consoleDevices,
  consoleFiles,
  consoleFileBodies,
  consoleUsers,
} from "@/lib/console-fixtures";

type Scenario = "normal" | "empty" | "unavailable" | "rate_limit";
const Context = createContext<{
  api: MockApiService;
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
} | null>(null);
export function ConsoleProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const makeApi = (scenario: Scenario) =>
    createMockApi({
      actor: user,
      devices: scenario === "empty" ? [] : consoleDevices,
      users: scenario === "empty" ? [user] : consoleUsers,
      files: scenario === "empty" ? [] : consoleFiles,
      audits: consoleAudits,
      fileBodies: consoleFileBodies,
      advanceJobs: true,
      latencyMs: 120,
      failure:
        scenario === "unavailable"
          ? "unavailable"
          : scenario === "rate_limit"
            ? "rate_limit"
            : undefined,
    });
  const [state, setState] = useState(() => ({
    api: makeApi("normal"),
    scenario: "normal" as Scenario,
  }));
  return (
    <Context.Provider
      value={{
        ...state,
        setScenario: (scenario) =>
          setState({ api: makeApi(scenario), scenario }),
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

export function usePreviewControls() {
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
  };
}
