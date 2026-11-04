import { afterEach, describe, expect, it } from "vitest";
import { clientAddress, preflight, protect, take } from "@/lib/api-guard";

const request = (headers: Record<string, string> = {}, method = "GET") =>
  new Request("https://amortrav.com/api/shop/products", { method, headers });

describe("rate limits", () => {
  it("allows the bucket's limit, then blocks until a token refills", () => {
    const key = `test-${Math.random()}`;
    const start = 1_000_000;
    for (let i = 0; i < 10; i++) expect(take(key, "auth", start).allowed).toBe(true);
    const blocked = take(key, "auth", start);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(6); // 10 a minute: one every 6 s
    expect(take(key, "auth", start + 6_000).allowed).toBe(true);
  });

  it("keeps visitors and buckets apart", () => {
    const start = 2_000_000;
    for (let i = 0; i < 5; i++) take("a", "leads", start);
    expect(take("a", "leads", start).allowed).toBe(false);
    expect(take("b", "leads", start).allowed).toBe(true);
    expect(take("a", "read", start).allowed).toBe(true);
  });

  it("reads the visitor from the proxy headers", () => {
    expect(
      clientAddress(
        request({ "cf-connecting-ip": "203.0.113.9", "x-forwarded-for": "10.0.0.1" }),
      ),
    ).toBe("203.0.113.9");
    expect(clientAddress(request({ "x-forwarded-for": "198.51.100.4, 10.0.0.1" }))).toBe(
      "198.51.100.4",
    );
  });

  it("answers 429 with Retry-After once the limit is spent", async () => {
    const handler = protect(
      async () => Response.json({ ok: true }),
      () => ({ bucket: "leads", cors: "same-origin" }),
    );
    const visitor = { "x-real-ip": `198.51.100.${Math.floor(Math.random() * 200)}` };
    for (let i = 0; i < 5; i++)
      expect((await handler(request(visitor, "POST"), undefined)).status).toBe(200);
    const blocked = await handler(request(visitor, "POST"), undefined);
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(blocked.headers.get("RateLimit-Remaining")).toBe("0");
  });
});

describe("CORS", () => {
  afterEach(() => {
    delete process.env.CORS_ALLOWED_ORIGINS;
  });

  it("refuses preflights from other origins by default", () => {
    expect(
      preflight(request({ origin: "https://evil.example" }, "OPTIONS"), "public", ["GET"])
        .status,
    ).toBe(403);
  });

  it("serves listed origins public reads, never same-origin routes", async () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://partner.example";
    const partner = { origin: "https://partner.example", "x-real-ip": "192.0.2.50" };
    const ok = preflight(request(partner, "OPTIONS"), "public", ["GET"]);
    expect(ok.headers.get("Access-Control-Allow-Origin")).toBe("https://partner.example");
    expect(preflight(request(partner, "OPTIONS"), "same-origin", ["POST"]).status).toBe(
      403,
    );
    const read = protect(
      async () => Response.json([]),
      () => ({ bucket: "read", cors: "public" }),
    );
    const response = await read(request(partner), undefined);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://partner.example",
    );
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
  });
});
