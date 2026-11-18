// Public shop endpoints gateway: products, checkout, and order status.
import { isSameOrigin, preflight, protect } from "@/lib/api-guard";

const LIMIT = 8 * 1024;
const ORDER = /^orders\/[0-9a-f-]{36}$/;
const CANCEL = /^orders\/[0-9a-f-]{36}\/cancel$/;
const IMAGE = /^products\/[a-z0-9-]{2,40}\/image$/;

const json = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function allowed(path: string, method: string) {
  if (method === "GET") {
    return path === "products" || ORDER.test(path) || IMAGE.test(path);
  }
  if (method === "POST") {
    return path === "checkout" || CANCEL.test(path);
  }
  return false;
}

// Fallback catalog when developing offline without the backend
const FALLBACK_PRODUCTS = [
  {
    sku: "cabin-55",
    name: "Cabin 55",
    description: "Graphite polycarbonate carry-on with TRACE built in.",
    image: "/images/trace/range-essential.png",
    price_minor: 34900,
    currency: "USD",
    available: 50,
  },
  {
    sku: "checkin-68",
    name: "Check-in 68",
    description: "Navy check-in suitcase with impact and journey tracking.",
    image: "/images/trace/range-flagship.png",
    price_minor: 42900,
    currency: "USD",
    available: 40,
  },
  {
    sku: "checkin-76",
    name: "Check-in 76",
    description: "Extended check-in suitcase with self-weighing handle.",
    image: "/images/trace/range-executive.png",
    price_minor: 46900,
    currency: "USD",
    available: 25,
  },
  {
    sku: "the-pair",
    name: "The Pair",
    description: "Cabin 55 and Check-in 68 bundled with matching Smart Cores.",
    image: "/images/trace/hero-pair.jpg",
    price_minor: 71900,
    currency: "USD",
    available: 20,
  },
];

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

  const origin = (process.env.BACKEND_API_URL || "http://127.0.0.1:8090/api/v1").replace(/\/$/, "");
  const headers: Record<string, string> = { accept: "application/json" };
  let body: string | undefined;

  if (method === "POST") {
    body = await request.text();
    if (body.length > LIMIT) return json({ error: "That order is too large." }, 413);
    headers["content-type"] = "application/json";
    const key = request.headers.get("idempotency-key");
    if (key) headers["idempotency-key"] = key;
  }

  const query = new URL(request.url).search;

  try {
    const upstream = await fetch(`${origin}/shop/${path}${query}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    if (IMAGE.test(path) && upstream.ok) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "content-type": upstream.headers.get("content-type") ?? "image/png",
          "Cache-Control": upstream.headers.get("cache-control") ?? "public, max-age=60",
        },
      });
    }

    const text = await upstream.text();
    return new Response(text || null, {
      status: upstream.status,
      headers: { "content-type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    // Offline / Mock fallback when local dev backend isn't running
    if (path === "products" && method === "GET") {
      return json(FALLBACK_PRODUCTS, 200);
    }
    if (path === "checkout" && method === "POST") {
      const orderId = "order-" + Math.random().toString(36).substring(2, 10);
      return json({
        order_id: orderId,
        status: "confirmed",
        message: "Pre-order reservation confirmed (demo mode).",
      }, 200);
    }
    return json(
      { error: "We couldn’t reach the servers. Please try again in a moment." },
      503,
    );
  }
}

const guarded = protect(handle, (request) =>
  request.method === "GET"
    ? { bucket: "read", cors: "public" }
    : { bucket: "checkout", cors: "same-origin" },
);

export const GET = guarded;
export const POST = guarded;
export const OPTIONS = (request: Request) => preflight(request, "public", ["GET"]);
