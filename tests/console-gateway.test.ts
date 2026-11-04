import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined,
  }),
}));
import { GET, POST, PATCH } from "@/app/api/console/[...path]/route";
import { validSection } from "@/lib/console/routes";
import { allowsEndpoint } from "@/lib/console/policy";
import { securityHeaders } from "@/lib/security-headers";
import { parseDeviceCsv } from "@/components/console/provision";

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  role: "admin",
  email: "admin@example.test",
};
const tokenPair = {
  user,
  access_token: "test-access",
  refresh_token: "test-refresh",
  expires_in: 900,
};
const upstream = vi.fn();
const context = (path: string) => ({
  params: Promise.resolve({ path: path.split("/") }),
});
function request(
  path: string,
  method = "POST",
  body?: object,
  origin = "http://localhost:3000",
) {
  return new Request(`http://localhost:3000/api/console/${path}`, {
    method,
    headers: { origin, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  cookieJar.clear();
  upstream.mockReset();
  vi.stubGlobal("fetch", upstream);
});

describe("console authentication boundary", () => {
  it("keeps tokens in HttpOnly cookies and returns only the account", async () => {
    upstream.mockResolvedValue(Response.json(tokenPair));
    const result = await POST(
      request("auth/login", "POST", {
        email: "admin@example.test",
        password: "test-password-only",
      }),
      context("auth/login"),
    );
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ user });
    expect(result.headers.get("set-cookie")).toContain("HttpOnly");
    expect(result.headers.get("set-cookie")).toContain("SameSite=lax");
    expect(result.headers.get("set-cookie")).toContain("Path=/api/console");
    expect(result.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects cross-origin login and mutations before calling the backend", async () => {
    const result = await POST(
      request(
        "auth/login",
        "POST",
        { email: "a@b.test", password: "test" },
        "https://untrusted.example",
      ),
      context("auth/login"),
    );
    expect(result.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("does not turn a mobile account into a staff session", async () => {
    upstream.mockResolvedValue(
      Response.json({ ...tokenPair, user: { ...user, role: "user" } }),
    );
    const result = await POST(request("auth/login", "POST", {}), context("auth/login"));
    expect(result.status).toBe(403);
    expect(result.headers.get("set-cookie")).not.toContain("test-access");
  });

  it("requires a session for protected operations", async () => {
    const result = await GET(request("devices", "GET"), context("devices"));
    expect(result.status).toBe(401);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("forwards backend authorization failures instead of manufacturing access", async () => {
    cookieJar.set("amortrav_access", "manufacturer-token");
    upstream.mockResolvedValue(
      Response.json({ error: "admin role required" }, { status: 403 }),
    );
    const result = await POST(
      request("admin/manufacturers", "POST", {
        email: "new@example.test",
        password: "long-test-password",
      }),
      context("admin/manufacturers"),
    );
    expect(result.status).toBe(403);
    expect(upstream.mock.calls[0][1].headers.get("authorization")).toBe(
      "Bearer manufacturer-token",
    );
  });

  it("rotates tokens using the private refresh cookie, ignoring a browser-supplied token", async () => {
    cookieJar.set("amortrav_refresh", "private-refresh");
    upstream.mockResolvedValue(Response.json(tokenPair));
    const result = await POST(
      request("auth/refresh", "POST", { refresh_token: "browser-injected" }),
      context("auth/refresh"),
    );
    expect(result.status).toBe(200);
    expect(JSON.parse(upstream.mock.calls[0][1].body)).toEqual({
      refresh_token: "private-refresh",
    });
    expect(await result.json()).toEqual({ user });
  });

  it("clears local credentials when logout cannot reach the backend", async () => {
    cookieJar.set("amortrav_access", "old-access");
    upstream.mockRejectedValue(new Error("offline"));
    const result = await POST(request("auth/logout"), context("auth/logout"));
    expect(result.status).toBe(503);
    expect(result.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(result.headers.get("set-cookie")).toContain("amortrav_refresh=");
  });

  it("revokes the server session even after its access cookie has expired", async () => {
    cookieJar.set("amortrav_refresh", "private-refresh");
    upstream.mockResolvedValueOnce(
      Response.json({ error: "unauthorized" }, { status: 401 }),
    );
    upstream.mockResolvedValueOnce(Response.json(tokenPair));
    upstream.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const result = await POST(request("auth/logout"), context("auth/logout"));
    expect(result.status).toBe(204);
    expect(upstream).toHaveBeenCalledTimes(3);
    expect(upstream.mock.calls[2][1].headers.Authorization).toBe("Bearer test-access");
    expect(result.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects endpoints outside the allowlist", async () => {
    const result = await PATCH(
      request("admin/secrets", "PATCH", {}),
      context("admin/secrets"),
    );
    expect(result.status).toBe(404);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("does not put private job receipts in upstream URLs", async () => {
    cookieJar.set("amortrav_access", "access");
    upstream.mockResolvedValue(Response.json({ status: "processing" }, { status: 202 }));
    const path = "auth/jobs/00000000-0000-4000-8000-000000000001";
    const req = new Request(
      `http://localhost:3000/api/console/${path}?receipt=must-not-forward`,
      { headers: { "X-Job-Receipt": "private-receipt" } },
    );
    const result = await GET(req, context(path));
    expect(result.status).toBe(202);
    expect(String(upstream.mock.calls[0][0])).not.toContain("receipt");
    expect(upstream.mock.calls[0][1].headers.get("x-job-receipt")).toBe(
      "private-receipt",
    );
  });

  it("forwards traveller search text only to the traveller listing", async () => {
    cookieJar.set("amortrav_access", "access");
    upstream.mockResolvedValue(Response.json({ travellers: [], total: 0 }));
    const search = await GET(
      new Request("http://localhost:3000/api/console/admin/travellers?q=ama&limit=25"),
      context("admin/travellers"),
    );
    expect(search.status).toBe(200);
    const forwarded = new URL(String(upstream.mock.calls[0][0]));
    expect(forwarded.searchParams.get("q")).toBe("ama");
    expect(forwarded.searchParams.get("limit")).toBe("25");
    await GET(
      new Request("http://localhost:3000/api/console/admin/users?q=ama"),
      context("admin/users"),
    );
    expect(String(upstream.mock.calls[1][0])).not.toContain("q=");
  });

  it("sends password reset steps without a session or bearer token", async () => {
    upstream.mockResolvedValue(new Response(null, { status: 204 }));
    const result = await POST(
      request("auth/password/reset", "POST", {
        email: "a@example.test",
        code: "123456",
        password: "a long new password",
      }),
      context("auth/password/reset"),
    );
    expect(result.status).toBe(204);
    expect(upstream.mock.calls[0][1].headers.get("authorization")).toBeNull();
  });

  it("rejects chunked requests larger than the limit", async () => {
    const result = await POST(
      request("auth/login", "POST", { password: "a".repeat(17000) }),
      context("auth/login"),
    );
    expect(result.status).toBe(413);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("only accepts known console screens and device IDs", () => {
    expect(validSection(["devices", user.id])).toBe(true);
    expect(validSection(["devices", "../admin"])).toBe(false);
    expect(validSection(["unknown"])).toBe(false);
    expect(validSection(["travellers"])).toBe(true);
    expect(validSection(["travellers", user.id])).toBe(true);
    expect(validSection(["travellers", "../admin"])).toBe(false);
  });

  it("lets anyone ask for a password reset, without a session", () => {
    expect(allowsEndpoint("auth/password/forgot", "POST")).toBe(true);
    expect(allowsEndpoint("auth/password/reset", "POST")).toBe(true);
    expect(allowsEndpoint("auth/password/reset", "GET")).toBe(false);
  });

  it("lets a signed-in user change their own password and profile", () => {
    expect(allowsEndpoint("auth/password/change", "POST")).toBe(true);
    expect(allowsEndpoint("auth/password/change", "GET")).toBe(false);
    expect(allowsEndpoint("auth/me/profile", "PATCH")).toBe(true);
    expect(allowsEndpoint("auth/me/photo", "POST")).toBe(true);
    expect(allowsEndpoint("auth/me/photo/delete", "POST")).toBe(true);
    expect(allowsEndpoint("auth/me/export", "GET")).toBe(false);
  });

  it("lets administrators read travellers, never change them", () => {
    const id = "00000000-0000-4000-8000-000000000009";
    expect(allowsEndpoint("admin/travellers", "GET")).toBe(true);
    expect(allowsEndpoint(`admin/travellers/${id}`, "GET")).toBe(true);
    expect(allowsEndpoint(`admin/travellers/${id}`, "PATCH")).toBe(false);
    expect(allowsEndpoint("admin/travellers/../users", "GET")).toBe(false);
    expect(allowsEndpoint(`users/${id}/photo`, "GET")).toBe(true);
    expect(allowsEndpoint(`users/${id}/photo`, "POST")).toBe(false);
    expect(allowsEndpoint("admin/messages", "POST")).toBe(true);
    expect(allowsEndpoint(`admin/travellers/${id}/messages`, "POST")).toBe(true);
    expect(allowsEndpoint(`admin/travellers/${id}/messages`, "GET")).toBe(false);
    expect(validSection(["messages"])).toBe(true);
    expect(allowsEndpoint("auth/account/delete", "POST")).toBe(false);
  });
});

describe("TRACE review", () => {
  it("allows reading fleet views and tuning thresholds, nothing more", () => {
    const id = "00000000-0000-4000-8000-000000000009";
    for (const path of ["admin/impacts", "admin/alerts", "admin/leads", "admin/fleet/health", "admin/fleet/firmware"]) {
      expect(allowsEndpoint(path, "GET")).toBe(true);
      expect(allowsEndpoint(path, "POST")).toBe(false);
    }
    expect(allowsEndpoint(`admin/devices/${id}/config`, "PATCH")).toBe(true);
    expect(allowsEndpoint(`admin/devices/${id}/timeline`, "GET")).toBe(true);
    expect(allowsEndpoint(`devices/${id}/status`, "GET")).toBe(true);
    expect(allowsEndpoint(`devices/${id}/settings`, "PATCH")).toBe(false);
    expect(allowsEndpoint(`devices/${id}/journeys`, "POST")).toBe(false);
    expect(allowsEndpoint("public/leads", "POST")).toBe(false);
    for (const section of ["fleet", "impacts", "alerts", "leads"]) expect(validSection([section])).toBe(true);
  });

  it("forwards only well-formed filters and cursors", async () => {
    cookieJar.set("amortrav_access", "access");
    upstream.mockResolvedValue(Response.json([]));
    const id = "00000000-0000-4000-8000-000000000009";
    await GET(
      new Request(
        `http://localhost:3000/api/console/admin/impacts?severity=severe&before=42&device_id=${id}&limit=50`,
      ),
      context("admin/impacts"),
    );
    const good = new URL(String(upstream.mock.calls[0][0]));
    expect(good.searchParams.get("severity")).toBe("severe");
    expect(good.searchParams.get("before")).toBe("42");
    expect(good.searchParams.get("device_id")).toBe(id);
    await GET(
      new Request(
        "http://localhost:3000/api/console/admin/alerts?category=drop%20table&before=1%3B--&kind=Bad-Kind&device_id=nope",
      ),
      context("admin/alerts"),
    );
    const bad = new URL(String(upstream.mock.calls[1][0]));
    for (const key of ["category", "before", "kind", "device_id"]) expect(bad.searchParams.get(key)).toBeNull();
    await GET(
      new Request("http://localhost:3000/api/console/admin/leads?before=2026-10-27T09%3A30%3A00.123Z"),
      context("admin/leads"),
    );
    expect(new URL(String(upstream.mock.calls[2][0])).searchParams.get("before")).toBe("2026-10-27T09:30:00.123Z");
  });
});

describe("security hardening", () => {
  it("exposes session controls and the audit trail, nothing broader", () => {
    const id = "00000000-0000-4000-8000-000000000009";
    expect(allowsEndpoint("auth/sessions", "GET")).toBe(true);
    expect(allowsEndpoint("auth/sessions", "POST")).toBe(false);
    expect(allowsEndpoint(`auth/sessions/${id}/revoke`, "POST")).toBe(true);
    expect(allowsEndpoint("auth/sessions/../revoke", "POST")).toBe(false);
    expect(allowsEndpoint("auth/sessions/revoke-all", "POST")).toBe(true);
    expect(allowsEndpoint("admin/security-events", "GET")).toBe(true);
    expect(allowsEndpoint(`admin/users/${id}/sessions/revoke`, "POST")).toBe(true);
    // Hardware endpoints are for devices and factory tooling, never browser sessions.
    expect(allowsEndpoint(`devices/${id}/telemetry`, "POST")).toBe(false);
    expect(allowsEndpoint(`devices/${id}/public-key`, "POST")).toBe(false);
    expect(validSection(["security"])).toBe(true);
  });

  it("clears local credentials after signing out everywhere", async () => {
    cookieJar.set("amortrav_access", "test-access");
    cookieJar.set("amortrav_refresh", "test-refresh");
    upstream.mockResolvedValue(new Response(null, { status: 204 }));
    const result = await POST(
      request("auth/sessions/revoke-all"),
      context("auth/sessions/revoke-all"),
    );
    expect(result.status).toBe(204);
    expect(result.headers.get("set-cookie")).toContain("amortrav_access=;");
    expect(upstream.mock.calls[0][1].headers.get("authorization")).toBe(
      "Bearer test-access",
    );
  });

  it("builds a restrictive content security policy", () => {
    const headers = Object.fromEntries(
      securityHeaders({
        production: true,
        locationSocketUrl: "wss://api.amortrav.example/api/v1/admin/locations/stream",
      }).map(({ key, value }) => [key, value]),
    );
    const csp = headers["Content-Security-Policy"];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("wss://api.amortrav.example");
    // WebAssembly compilation for local SQLite only; JavaScript eval stays blocked.
    expect(csp).toContain("'wasm-unsafe-eval'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain(" ws:");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=31536000");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    const dev = securityHeaders({ production: false, locationSocketUrl: "javascript:x" });
    expect(dev.find((h) => h.key === "Strict-Transport-Security")).toBeUndefined();
    expect(dev[0].value).not.toContain("javascript");
  });
});

describe("two-step sign-in", () => {
  const challenge = {
    mfa_required: true,
    mfa_token: "a".repeat(64),
    methods: ["totp", "passkey"],
    expires_in: 300,
  };

  it("keeps the challenge token out of page scripts", async () => {
    upstream.mockResolvedValue(Response.json(challenge));
    const result = await POST(
      request("auth/login", "POST", { email: "a@b.test", password: "x".repeat(12) }),
      context("auth/login"),
    );
    expect(await result.json()).toEqual({
      mfa_required: true,
      methods: ["totp", "passkey"],
    });
    const cookie = result.headers.get("set-cookie") || "";
    expect(cookie).toContain(`amortrav_mfa=${"a".repeat(64)}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).not.toContain("amortrav_access=test");
  });

  it("attaches the challenge from the cookie and stores the resulting session", async () => {
    cookieJar.set("amortrav_mfa", "b".repeat(64));
    upstream.mockResolvedValue(Response.json(tokenPair));
    const result = await POST(
      request("auth/mfa/verify", "POST", { code: "123456", mfa_token: "forged" }),
      context("auth/mfa/verify"),
    );
    expect(result.status).toBe(200);
    expect(JSON.parse(upstream.mock.calls[0][1].body)).toEqual({
      code: "123456",
      mfa_token: "b".repeat(64),
    });
    expect(upstream.mock.calls[0][1].headers.get("authorization")).toBeNull();
    const cookies = result.headers.get("set-cookie") || "";
    expect(cookies).toContain("amortrav_access=test-access");
    expect(cookies).toContain("amortrav_mfa=;");
  });

  it("refuses verification without a pending challenge", async () => {
    const result = await POST(
      request("auth/mfa/verify", "POST", { code: "123456" }),
      context("auth/mfa/verify"),
    );
    expect(result.status).toBe(401);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("issues staff sessions from passwordless passkey sign-in only", async () => {
    upstream.mockResolvedValue(Response.json(tokenPair));
    const ok = await POST(
      request("auth/passkeys/login/finish", "POST", { login_id: "x", credential: {} }),
      context("auth/passkeys/login/finish"),
    );
    expect(ok.headers.get("set-cookie")).toContain("amortrav_access=test-access");
    upstream.mockResolvedValue(
      Response.json({ ...tokenPair, user: { ...user, role: "user" } }),
    );
    const traveller = await POST(
      request("auth/passkeys/login/finish", "POST", { login_id: "x", credential: {} }),
      context("auth/passkeys/login/finish"),
    );
    expect(traveller.status).toBe(403);
  });

  it("allows MFA management, bulk provisioning and admin recovery", () => {
    const id = "00000000-0000-4000-8000-000000000009";
    for (const [path, method] of [
      ["auth/mfa", "GET"],
      ["auth/mfa/totp/setup", "POST"],
      ["auth/mfa/totp/confirm", "POST"],
      ["auth/mfa/recovery-codes", "POST"],
      ["auth/passkeys/register/start", "POST"],
      [`auth/passkeys/${id}/delete`, "POST"],
      [`admin/users/${id}/mfa/reset`, "POST"],
      ["devices/batches", "POST"],
      ["devices/batches", "GET"],
      [`devices/batches/${id}`, "GET"],
    ])
      expect(allowsEndpoint(path, method)).toBe(true);
    expect(allowsEndpoint("auth/mfa/totp/setup", "GET")).toBe(false);
    expect(allowsEndpoint("auth/passkeys/x/delete", "POST")).toBe(false);
    expect(validSection(["provision"])).toBe(true);
  });

  it("accepts batch uploads above the default body limit", async () => {
    cookieJar.set("amortrav_access", "test-access");
    upstream.mockResolvedValue(Response.json({}, { status: 201 }));
    const big = { model: "m", firmware_version: "1", devices: "x".repeat(100_000) };
    const ok = await POST(
      request("devices/batches", "POST", big),
      context("devices/batches"),
    );
    expect(ok.status).toBe(201);
    const tooBig = await POST(request("devices", "POST", big), context("devices"));
    expect(tooBig.status).toBe(413);
  });
});

describe("device CSV import", () => {
  it("parses serials with optional keys and rejects bad rows", () => {
    const key = `04${"ab".repeat(64)}`;
    expect(
      parseDeviceCsv(`serial_number,public_key\ncore-000001,${key}\nCORE-000002\n`),
    ).toEqual({
      rows: [
        { serial_number: "CORE-000001", public_key: key },
        { serial_number: "CORE-000002" },
      ],
      error: "",
    });
    expect(parseDeviceCsv("CORE-000001\ncore-000001").error).toMatch(/duplicate/);
    expect(parseDeviceCsv("bad").error).toMatch(/invalid serial/);
    expect(parseDeviceCsv("CORE-000001,zz").error).toMatch(/public key/);
    expect(parseDeviceCsv("").error).toMatch(/no serial/);
  });
});

describe("gateway query forwarding", () => {
  it("forwards UUID filters and drops anything else", async () => {
    cookieJar.set("amortrav_access", "test-access");
    upstream.mockResolvedValue(Response.json([]));
    const id = "00000000-0000-4000-8000-000000000009";
    await GET(
      new Request(
        `http://localhost:3000/api/console/devices?batch_id=${id}&limit=100&owner_id=x&batch_id=x`,
      ),
      context("devices"),
    );
    const forwarded = new URL(upstream.mock.calls[0][0]);
    expect(forwarded.searchParams.get("batch_id")).toBe(id);
    expect(forwarded.searchParams.get("limit")).toBe("100");
    expect(forwarded.searchParams.has("owner_id")).toBe(false);
  });
});
