// Rate limits and CORS for the site's API routes (console gateway, shop, leads).
//
// Rate limits: a token bucket per visitor and bucket, kept in this server's memory. It
// stops floods and password guessing before they reach the API, which keeps its own,
// shared limits behind this. Visitors are told the limit in RateLimit-* headers, and
// how long to wait in Retry-After.
//
// CORS: the console and every form or checkout are same-origin only (the console runs on
// session cookies). Public shop reads may also be served to the origins listed in
// CORS_ALLOWED_ORIGINS (comma-separated), without credentials.

export type Bucket = "auth" | "write" | "read" | "leads" | "checkout";
export type Cors = "same-origin" | "public";

/** Requests allowed per window, and the window in seconds. */
const LIMITS: Record<Bucket, { limit: number; window: number }> = {
  // Sign-in, password reset and second-factor steps: slow enough to stop guessing.
  auth: { limit: 10, window: 60 },
  leads: { limit: 5, window: 600 },
  checkout: { limit: 10, window: 60 },
  write: { limit: 120, window: 60 },
  // Dashboards load many lists at once.
  read: { limit: 600, window: 60 },
};

const MAX_KEYS = 50_000;
const buckets = new Map<string, { tokens: number; updated: number }>();

/**
 * The visitor's address. The site runs behind Cloudflare and nginx, which set these
 * headers; without a proxy in front they could be forged, so keep one there.
 */
export function clientAddress(request: Request) {
  const headers = request.headers;
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

/** Takes one token; returns what's left and, when empty, how long until the next one. */
export function take(key: string, bucket: Bucket, now = Date.now()) {
  const { limit, window } = LIMITS[bucket];
  const rate = limit / (window * 1000);
  const id = `${bucket}:${key}`;
  const entry = buckets.get(id) ?? { tokens: limit, updated: now };
  entry.tokens = Math.min(limit, entry.tokens + (now - entry.updated) * rate);
  entry.updated = now;
  const allowed = entry.tokens >= 1;
  if (allowed) entry.tokens -= 1;
  // Re-insert so the map stays in least-recently-used order, then drop the oldest.
  buckets.delete(id);
  buckets.set(id, entry);
  if (buckets.size > MAX_KEYS) buckets.delete(buckets.keys().next().value!);
  return {
    allowed,
    limit,
    remaining: Math.floor(entry.tokens),
    // Seconds until a token is back (blocked), or until the bucket is full again.
    retryAfter: Math.ceil(
      (allowed ? limit - entry.tokens : 1 - entry.tokens) / rate / 1000,
    ),
    window,
  };
}

const allowedOrigins = () =>
  new Set(
    (process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
  );

/** The origin to echo back in Access-Control-Allow-Origin, or null for none. */
function corsOrigin(request: Request, cors: Cors) {
  const origin = request.headers.get("origin");
  if (!origin || origin === new URL(request.url).origin) return null;
  return cors === "public" && allowedOrigins().has(origin) ? origin : null;
}

function foreign(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin !== new URL(request.url).origin;
}

/** Answers a CORS preflight: allowed origins get the methods, others a 403. */
export function preflight(request: Request, cors: Cors, methods: string[]) {
  const origin = corsOrigin(request, cors);
  if (!origin)
    return new Response(null, {
      status: foreign(request) ? 403 : 204,
      headers: { Vary: "Origin" },
    });
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": methods.join(", "),
      "Access-Control-Allow-Headers": "content-type, idempotency-key",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    },
  });
}

type Handler<C> = (request: Request, context: C) => Promise<Response>;

/**
 * Wraps a route handler: rate-limits it per visitor and adds CORS headers. `rules` picks
 * the bucket and CORS mode for each request (from its path and method).
 */
export function protect<C>(
  handler: Handler<C>,
  rules: (
    request: Request,
    context: C,
  ) => Promise<{ bucket: Bucket; cors: Cors }> | { bucket: Bucket; cors: Cors },
): Handler<C> {
  return async (request, context) => {
    const { bucket, cors } = await rules(request, context);
    const result = take(clientAddress(request), bucket);
    const limits = {
      "RateLimit-Limit": String(result.limit),
      "RateLimit-Remaining": String(Math.max(0, result.remaining)),
      "RateLimit-Reset": String(result.retryAfter),
      "RateLimit-Policy": `${result.limit};w=${result.window}`,
    };
    const origin = corsOrigin(request, cors);
    const decorate = (response: Response) => {
      const headers = new Headers(response.headers);
      for (const [key, value] of Object.entries(limits)) headers.set(key, value);
      headers.append("Vary", "Origin");
      if (origin) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set(
          "Access-Control-Expose-Headers",
          "RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After",
        );
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };
    if (!result.allowed) {
      return decorate(
        Response.json(
          { error: "Too many requests. Please wait a moment and try again." },
          {
            status: 429,
            headers: {
              "Retry-After": String(result.retryAfter),
              "Cache-Control": "no-store",
            },
          },
        ),
      );
    }
    return decorate(await handler(request, context));
  };
}
