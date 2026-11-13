import { cookies } from "next/headers";
import { preflight, protect } from "@/lib/api-guard";
import { NextResponse } from "next/server";
import { allowsEndpoint, isSameOrigin, isStaff } from "@/lib/console/policy";

const ACCESS_COOKIE = "amortrav_access";
const REFRESH_COOKIE = "amortrav_refresh";
// Holds the second-factor challenge between sign-in steps so page scripts never see it.
const MFA_COOKIE = "amortrav_mfa";
// Sign-in steps run without an access token. Those in TOKEN_ISSUERS may return tokens.
const SIGN_IN_STEPS = new Set([
  "auth/login",
  "auth/password/forgot",
  "auth/password/reset",
  "auth/refresh",
  "auth/mfa/verify",
  "auth/mfa/passkey/start",
  "auth/mfa/passkey/finish",
  "auth/passkeys/login/start",
  "auth/passkeys/login/finish",
]);
const TOKEN_ISSUERS = new Set([
  "auth/login",
  "auth/refresh",
  "auth/mfa/verify",
  "auth/mfa/passkey/finish",
  "auth/passkeys/login/finish",
]);
const CHALLENGE_STEPS = new Set([
  "auth/mfa/verify",
  "auth/mfa/passkey/start",
  "auth/mfa/passkey/finish",
]);
const bodyLimit = (path: string) =>
  path === "admin/firmware/releases"
    ? 16 * 1024 * 1024
    : path === "files"
      ? 10 * 1024 * 1024
      : path === "devices/batches"
        ? 256 * 1024
        : /^admin\/shop\/products\/[a-z0-9-]+\/image$/.test(path)
          ? 5 * 1024 * 1024
          : path === "auth/me/photo"
            ? 2 * 1024 * 1024
            : 16 * 1024;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/console",
};
const json = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * A request to the API that never follows a redirect, so tokens can't be carried elsewhere.
 * Cloudflare's runtime has no `redirect: "error"`, so a redirect is refused here instead
 * (the catch below answers 503).
 */
async function backend(input: URL | string, init: RequestInit) {
  const response = await fetch(input, { ...init, redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    throw new Error(`the API redirected (${response.status})`);
  }
  return response;
}

async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  const method = request.method;
  if (!allowsEndpoint(path, method)) return json({ error: "Not found" }, 404);
  if (method !== "GET" && !isSameOrigin(request)) {
    return json({ error: "Request origin is not allowed" }, 403);
  }

  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  const authentication = SIGN_IN_STEPS.has(path);
  const challenge = jar.get(MFA_COOKIE)?.value;
  const clear = (response: NextResponse) => {
    response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return response;
  };

  if (path === "auth/logout" && !access && !refresh)
    return clear(new NextResponse(null, { status: 204 }));
  if (
    (!authentication && !access && path !== "auth/logout") ||
    (path === "auth/refresh" && !refresh)
  ) {
    return json({ error: "Please sign in to continue." }, 401);
  }

  const origin = process.env.BACKEND_API_URL || "http://127.0.0.1:8090/api/v1";
  const endpoint = new URL(`${origin.replace(/\/$/, "")}/${path}`);
  const search = new URL(request.url).searchParams;
  for (const key of ["limit", "offset"]) {
    const value = search.get(key);
    if (value && /^\d+$/.test(value)) endpoint.searchParams.set(key, value);
  }
  // Traveller search text, bounded; only on the one listing that takes it.
  const q = search.get("q")?.trim();
  if (path === "admin/travellers" && q) endpoint.searchParams.set("q", q.slice(0, 100));
  // TRACE review filters: a cursor (an id, or a time for leads) and fixed vocabularies.
  const before = search.get("before");
  if (
    before &&
    (/^\d{1,18}$/.test(before) ||
      /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:\d{2})$/.test(before))
  )
    endpoint.searchParams.set("before", before);
  const vocabulary: Record<string, RegExp> = {
    severity: /^(light|moderate|severe)$/,
    category: /^(impact|tamper|separation|battery|theft|geofence|weight|journey)$/,
    filter: /^(all|stale|low_battery|uncalibrated|theft_mode)$/,
    kind: /^[a-z_]{1,24}$/,
  };
  for (const [key, pattern] of Object.entries(vocabulary)) {
    const value = search.get(key);
    if (value && pattern.test(value)) endpoint.searchParams.set(key, value);
  }
  // Only UUID filters are forwarded; anything else is dropped.
  for (const key of [
    "batch_id",
    "manufacturer_id",
    "actor_id",
    "recipient_id",
    "device_id",
  ]) {
    const value = search.get(key);
    if (
      value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    )
      endpoint.searchParams.set(key, value);
  }

  const headers = new Headers();
  if (access && !authentication) headers.set("Authorization", `Bearer ${access}`);
  // The user agent labels the session in the account's session list.
  for (const key of [
    "content-type",
    "x-job-receipt",
    "x-file-name",
    "x-firmware-version",
    "x-firmware-signature",
    "x-firmware-notes",
    "user-agent",
  ]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }

  try {
    let body: ArrayBuffer | string | undefined;
    if (path === "auth/refresh") {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify({ refresh_token: refresh });
    } else if (method !== "GET") {
      const limit = bodyLimit(path);
      if (Number(request.headers.get("content-length")) > limit) {
        return json({ error: "The request is too large." }, 413);
      }
      // Read a bounded stream so chunked requests cannot bypass the size limit.
      const chunks: Uint8Array[] = [];
      const reader = request.body?.getReader();
      let size = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > limit) {
            await reader.cancel();
            return json({ error: "The request is too large." }, 413);
          }
          chunks.push(value);
        }
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      body = bytes.buffer;
      if (CHALLENGE_STEPS.has(path)) {
        if (!challenge) {
          return json({ error: "Your verification expired. Sign in again." }, 401);
        }
        let fields: Record<string, unknown> = {};
        try {
          const parsed = size ? JSON.parse(new TextDecoder().decode(bytes)) : {};
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
            fields = parsed;
        } catch {
          return json({ error: "Invalid request." }, 400);
        }
        headers.set("Content-Type", "application/json");
        body = JSON.stringify({ ...fields, mfa_token: challenge });
      }
    }

    let upstream = await backend(endpoint, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(
        path === "files" || path === "devices/batches" ? 60_000 : 15_000,
      ),
    });

    if (path === "auth/logout" && upstream.status === 401 && refresh) {
      const rotated = await backend(`${origin.replace(/\/$/, "")}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
        cache: "no-store",
          signal: AbortSignal.timeout(15_000),
      });
      if (rotated.ok) {
        const pair = await rotated.json();
        upstream = await backend(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${pair.access_token}` },
          cache: "no-store",
              signal: AbortSignal.timeout(15_000),
        });
      } else if (rotated.status === 401) {
        return clear(new NextResponse(null, { status: 204 }));
      }
    }

    if (path === "auth/logout") {
      // Always discard local credentials, even when revocation could not reach the API.
      return clear(
        upstream.ok
          ? new NextResponse(null, { status: 204 })
          : json(
              {
                error:
                  "Signed out locally. Server session revocation could not be confirmed.",
              },
              502,
            ),
      );
    }

    if (TOKEN_ISSUERS.has(path) && upstream.ok) {
      const pair = await upstream.json();
      if (path === "auth/login" && pair.mfa_required === true) {
        const response = json({ mfa_required: true, methods: pair.methods ?? [] }, 200);
        response.cookies.set(MFA_COOKIE, pair.mfa_token, {
          ...cookieOptions,
          maxAge: Math.min(Number(pair.expires_in) || 300, 300),
        });
        return response;
      }
      if (!isStaff(pair.user?.role)) {
        return clear(json({ error: "Traveler accounts use the mobile app." }, 403));
      }
      const response = json({ user: pair.user }, 200);
      response.cookies.set(MFA_COOKIE, "", { ...cookieOptions, maxAge: 0 });
      response.cookies.set(ACCESS_COOKIE, pair.access_token, {
        ...cookieOptions,
        maxAge: Math.min(pair.expires_in, 900),
      });
      response.cookies.set(REFRESH_COOKIE, pair.refresh_token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60,
      });
      return response;
    }

    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const key of ["content-type", "content-disposition", "retry-after"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    const response = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
    // Signing out everywhere also ends this browser's session.
    return (path === "auth/refresh" && upstream.status === 401) ||
      (path === "auth/sessions/revoke-all" && upstream.ok)
      ? clear(response)
      : response;
  } catch {
    const response = json(
      { error: "The service is temporarily unavailable. Please try again." },
      503,
    );
    return path === "auth/logout" ? clear(response) : response;
  }
}

// Sign-in, password and second-factor steps get the strict bucket; the console is
// same-origin only, as it runs on session cookies.
const AUTH_STEP =
  /^auth\/(login|password\/(forgot|reset|change)|mfa\/(verify|passkey\/(start|finish))|passkeys\/login\/(start|finish))$/;
const guarded = protect(
  handle,
  async (request, context: { params: Promise<{ path: string[] }> }) => {
    const path = (await context.params).path.join("/");
    return {
      bucket: AUTH_STEP.test(path) ? "auth" : request.method === "GET" ? "read" : "write",
      cors: "same-origin",
    };
  },
);
export { guarded as GET, guarded as POST, guarded as PATCH };
export const OPTIONS = (request: Request) =>
  preflight(request, "same-origin", ["GET", "POST", "PATCH"]);
