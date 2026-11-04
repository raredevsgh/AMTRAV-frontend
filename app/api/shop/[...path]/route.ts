// The shop's pages call the API's public shop endpoints through here: only these paths pass,
// with the buyer's Idempotency-Key, and checkout only from this site. Payment webhooks go to
// the API directly, not through here.
import { preflight, protect } from "@/lib/api-guard";
import { isSameOrigin } from "@/lib/console/policy";

const LIMIT = 8 * 1024;
const ORDER = /^orders\/[0-9a-f-]{36}$/;
const CANCEL = /^orders\/[0-9a-f-]{36}\/cancel$/;
const IMAGE = /^products\/[a-z0-9-]{2,40}\/image$/;

const json = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function allowed(path: string, method: string) {
  if (method === "GET")
    return path === "products" || ORDER.test(path) || IMAGE.test(path);
  if (method === "POST") return path === "checkout" || CANCEL.test(path);
  return false;
}

async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  const method = request.method;
  if (!allowed(path, method)) return json({ error: "Not found" }, 404);
  if (method === "POST" && !isSameOrigin(request)) {
    return json({ error: "Please order from this site." }, 403);
  }
  const headers: Record<string, string> = { accept: "application/json" };
  let body: string | undefined;
  if (method === "POST") {
    body = await request.text();
    if (body.length > LIMIT) return json({ error: "That order is too large." }, 413);
    headers["content-type"] = "application/json";
    const key = request.headers.get("idempotency-key");
    if (key) headers["idempotency-key"] = key;
  }
  const origin = (process.env.BACKEND_API_URL || "http://127.0.0.1:8090/api/v1").replace(
    /\/$/,
    "",
  );
  const query = new URL(request.url).search;
  let upstream: Response;
  try {
    upstream = await fetch(`${origin}/shop/${path}${query}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return json(
      { error: "We couldn’t reach our servers. Please try again in a moment." },
      503,
    );
  }
  // Product photos pass through as they are, with the API's caching.
  if (IMAGE.test(path) && upstream.ok)
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/png",
        "Cache-Control": upstream.headers.get("cache-control") ?? "public, max-age=60",
      },
    });
  const text = await upstream.text();
  return new Response(text || null, {
    status: upstream.status,
    headers: { "content-type": "application/json", "Cache-Control": "no-store" },
  });
}

// Browsing the shop may be shared with partner sites (CORS_ALLOWED_ORIGINS); ordering is
// same-origin only and gets the stricter bucket.
const guarded = protect(handle, (request) =>
  request.method === "GET"
    ? { bucket: "read", cors: "public" }
    : { bucket: "checkout", cors: "same-origin" },
);
export const GET = guarded;
export const POST = guarded;
export const OPTIONS = (request: Request) => preflight(request, "public", ["GET"]);
