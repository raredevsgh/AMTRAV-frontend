import type { Device } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let refreshing: Promise<Response> | null = null;
// A 401 from these means wrong credentials or code, not an expired access token.
const NO_REFRESH =
  /^auth\/(login|refresh|logout|password\/|mfa\/(verify|passkey\/|totp\/(confirm|disable))|passkeys\/(login|register)\/)/;

export async function apiResponse(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  // Status 0 means the request never reached the server (offline or unreachable).
  const unreachable = () =>
    new ApiError("You’re offline. This action needs a connection.", 0);
  const request = () =>
    fetch(`/api/console/${path}`, {
      ...options,
      headers: {
        ...(typeof options.body === "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      credentials: "same-origin",
      cache: "no-store",
    }).catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw unreachable();
    });
  let response = await request();
  if (response.status === 401 && !NO_REFRESH.test(path)) {
    refreshing ??= fetch("/api/console/auth/refresh", { method: "POST" })
      .catch(() => {
        throw unreachable();
      })
      .finally(() => {
        refreshing = null;
      });
    const refreshed = await refreshing;
    if (refreshed.ok) response = await request();
    else if (refreshed.status !== 401) {
      throw new ApiError(
        "Session service is temporarily unavailable. Please try again.",
        refreshed.status,
      );
    }
  }
  if (!response.ok) {
    const body = await response.text();
    let message = "Something went wrong. Please try again.";
    try {
      message = JSON.parse(body).error || message;
    } catch {
      if (response.status === 429)
        message = "Too many requests. Please wait before trying again.";
    }
    throw new ApiError(message, response.status);
  }
  return response;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiResponse(path, options);
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function listAll<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const result: T[] = [];
  // API pagination is capped at 100. Fetch every page before presenting fleet totals.
  for (let offset = 0; ; offset += 100) {
    const separator = path.includes("?") ? "&" : "?";
    const page = await api<T[]>(`${path}${separator}limit=100&offset=${offset}`, {
      signal,
    });
    result.push(...page);
    if (page.length < 100) return result;
  }
}

/** The API reports unclaimed devices as "registered"; the console calls them "unclaimed". */
export function normalizeDevice<T extends { status: string }>(device: T): T {
  return device.status === "registered" ? { ...device, status: "unclaimed" } : device;
}

export async function listDevices(path: string, signal?: AbortSignal) {
  return (await listAll<Device>(path, signal)).map(normalizeDevice);
}
