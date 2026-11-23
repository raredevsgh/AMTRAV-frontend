// Rate limits and CORS for the site's API routes (leads, shop).
export type Bucket = "auth" | "write" | "read" | "leads" | "checkout";
export type Cors = "same-origin" | "public";

const LIMITS: Record<Bucket, { limit: number; window: number }> = {
  auth: { limit: 10, window: 60 },
  leads: { limit: 5, window: 600 },
  checkout: { limit: 10, window: 60 },
  write: { limit: 120, window: 60 },
  read: { limit: 600, window: 60 },
};

const MAX_KEYS = 50_000;
const buckets = new Map<string, { tokens: number; updated: number }>();

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Direct same-origin or server-to-server
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function clientAddress(request: Request) {
  const headers = request.headers;
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

export function take(key: string, bucket: Bucket, now = Date.now()) {
  const { limit, window } = LIMITS[bucket];
  const rate = limit / (window * 1000);
  const id = `${bucket}:${key}`;
  const entry = buckets.get(id) ?? { tokens: limit, updated: now };
  entry.tokens = Math.min(limit, entry.tokens + (now - entry.updated) * rate);
  entry.updated = now;
  const allowed = entry.tokens >= 1;
  if (allowed) entry.tokens -= 1;
  buckets.delete(id);
  buckets.set(id, entry);
  if (buckets.size > MAX_KEYS) buckets.delete(buckets.keys().next().value!);
  return {
    allowed,
    limit,
    remaining: Math.floor(entry.tokens),
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

function corsOrigin(request: Request, cors: Cors) {
  const origin = request.headers.get("origin");
  if (!origin || origin === new URL(request.url).origin) return null;
  return cors === "public" && allowedOrigins().has(origin) ? origin : null;
}

export function preflight(request: Request, cors: Cors, methods: string[]) {
  const origin = corsOrigin(request, cors);
  if (!origin) {
    const isForeign = !!request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin;
    return new Response(null, {
      status: isForeign ? 403 : 204,
      headers: { Vary: "Origin" },
    });
  }
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": methods.join(", "),
      "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

export function protect<T extends unknown[]>(
  handler: (request: Request, ...args: T) => Promise<Response>,
  policy: (request: Request) => { bucket: Bucket; cors: Cors },
) {
  return async (request: Request, ...args: T) => {
    const { bucket, cors } = policy(request);
    const key = clientAddress(request);
    const quota = take(key, bucket);

    if (!quota.allowed) {
      return Response.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(quota.retryAfter),
            "RateLimit-Limit": String(quota.limit),
            "RateLimit-Remaining": "0",
            "RateLimit-Reset": String(quota.retryAfter),
          },
        },
      );
    }

    const response = await handler(request, ...args);
    const headers = new Headers(response.headers);
    headers.set("RateLimit-Limit", String(quota.limit));
    headers.set("RateLimit-Remaining", String(quota.remaining));

    const origin = corsOrigin(request, cors);
    if (origin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
