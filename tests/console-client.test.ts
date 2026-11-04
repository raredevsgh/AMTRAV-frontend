import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { api, listAll } from "@/lib/console/api";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it("loads every backend page rather than reporting the first 100 as the entire fleet", async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json(Array.from({ length: 100 }, (_, id) => ({ id }))),
  );
  fetchMock.mockResolvedValueOnce(Response.json([{ id: 100 }]));
  const devices = await listAll<{ id: number }>("devices");
  expect(devices).toHaveLength(101);
  expect(fetchMock.mock.calls[1][0]).toBe("/api/console/devices?limit=100&offset=100");
});

it("refreshes once before retrying a protected request with an expired access cookie", async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ error: "unauthorized" }, { status: 401 }),
  );
  fetchMock.mockResolvedValueOnce(Response.json({ user: { role: "admin" } }));
  fetchMock.mockResolvedValueOnce(Response.json([{ id: "one" }]));
  expect(await api("devices")).toEqual([{ id: "one" }]);
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
    "/api/console/devices",
    "/api/console/auth/refresh",
    "/api/console/devices",
  ]);
});

it("does not interpret a refresh service outage as an expired session", async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ error: "unauthorized" }, { status: 401 }),
  );
  fetchMock.mockResolvedValueOnce(
    Response.json({ error: "unavailable" }, { status: 503 }),
  );
  await expect(api("auth/me")).rejects.toMatchObject({ status: 503 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("does not refresh or replay invalid login credentials", async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ error: "invalid credentials" }, { status: 401 }),
  );
  await expect(
    api("auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.test", password: "wrong" }),
    }),
  ).rejects.toMatchObject({ status: 401 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
