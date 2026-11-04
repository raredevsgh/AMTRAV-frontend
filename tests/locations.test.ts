import { expect, it } from "vitest";
import {
  parseLocationMessage,
  locationIsStale,
  locationSocketUrl,
} from "@/lib/console/locations";
import { allowsEndpoint } from "@/lib/console/policy";

const location = {
  device_id: "10000000-0000-4000-8000-000000000001",
  latitude: 0,
  longitude: 0,
  accuracy_m: 15,
  recorded_at: "2026-10-20T12:00:00Z",
  received_at: "2026-10-20T12:00:01Z",
};
const snapshot = (locations: unknown[]) =>
  JSON.stringify({ type: "snapshot", locations, truncated: false });

it("accepts a valid equatorial fix and empty replacement snapshots", () => {
  expect(parseLocationMessage(snapshot([location]))).toMatchObject({
    locations: [location],
  });
  expect(parseLocationMessage(snapshot([]))).toMatchObject({ locations: [] });
  expect(parseLocationMessage('{"type":"heartbeat"}')).toEqual({ type: "heartbeat" });
});

it("rejects corrupt, duplicate, oversized and invalid position messages", () => {
  expect(parseLocationMessage("not json")).toBeNull();
  expect(parseLocationMessage(snapshot([null]))).toBeNull();
  expect(parseLocationMessage(snapshot([location, location]))).toBeNull();
  for (const patch of [
    { latitude: 91 },
    { longitude: -181 },
    { accuracy_m: -2 },
    { device_id: "bad" },
    { recorded_at: "not a date" },
    { latitude: "5" },
  ])
    expect(parseLocationMessage(snapshot([{ ...location, ...patch }]))).toBeNull();
  expect(parseLocationMessage(snapshot(Array(1001).fill(location)))).toBeNull();
});

it("marks the age of the fix rather than its receipt or connection time", () => {
  expect(locationIsStale(location, Date.parse("2026-10-20T12:05:00Z"))).toBe(false);
  expect(locationIsStale(location, Date.parse("2026-10-20T12:05:01Z"))).toBe(true);
});

it("requires secure WebSockets on HTTPS and keeps credentials out of socket URLs", () => {
  expect(
    locationSocketUrl("wss://dev.amortrav.com/api/v1/admin/locations/stream", "https:"),
  ).toBeTruthy();
  expect(
    locationSocketUrl("ws://localhost:8090/api/v1/admin/locations/stream", "http:"),
  ).toBeTruthy();
  for (const url of [
    "ws://example.com/ws",
    "https://example.com/ws",
    "wss://example.com/ws?ticket=secret",
    "wss://user:pass@example.com/ws",
  ]) {
    expect(locationSocketUrl(url, "https:")).toBeNull();
  }
});

it("exposes only ticket issuance through the console gateway", () => {
  expect(allowsEndpoint("admin/locations/ticket", "POST")).toBe(true);
  expect(allowsEndpoint("admin/locations/ticket", "GET")).toBe(false);
  expect(allowsEndpoint("admin/locations/stream", "GET")).toBe(false);
  expect(allowsEndpoint(`admin/devices/${location.device_id}/location`, "POST")).toBe(
    false,
  );
});
