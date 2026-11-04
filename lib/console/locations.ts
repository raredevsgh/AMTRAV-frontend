export interface DeviceLocation {
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  recorded_at: string;
  received_at: string;
}

export type LocationMessage =
  | { type: "heartbeat" }
  | { type: "snapshot"; locations: DeviceLocation[]; truncated: boolean };

export function parseLocationMessage(raw: string): LocationMessage | null {
  if (raw.length > 1_000_000) return null;
  try {
    const message = JSON.parse(raw);
    if (message.type === "heartbeat") return { type: "heartbeat" };
    if (
      message.type !== "snapshot" ||
      !Array.isArray(message.locations) ||
      message.locations.length > 1000 ||
      typeof message.truncated !== "boolean"
    )
      return null;
    if (
      !message.locations.every(
        (item: DeviceLocation) =>
          item &&
          typeof item.device_id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            item.device_id,
          ) &&
          Number.isFinite(item.latitude) &&
          Math.abs(item.latitude) <= 90 &&
          Number.isFinite(item.longitude) &&
          Math.abs(item.longitude) <= 180 &&
          Number.isFinite(item.accuracy_m) &&
          item.accuracy_m >= 0 &&
          item.accuracy_m <= 100000 &&
          typeof item.recorded_at === "string" &&
          Number.isFinite(Date.parse(item.recorded_at)) &&
          typeof item.received_at === "string" &&
          Number.isFinite(Date.parse(item.received_at)),
      )
    )
      return null;
    if (
      new Set(message.locations.map((item: DeviceLocation) => item.device_id)).size !==
      message.locations.length
    )
      return null;
    return message;
  } catch {
    return null;
  }
}

export function locationIsStale(location: DeviceLocation, now: number) {
  return now - Date.parse(location.recorded_at) > 5 * 60_000;
}

export function locationSocketUrl(value: string, pageProtocol: string) {
  try {
    const url = new URL(value);
    if (
      !["ws:", "wss:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return null;
    if (pageProtocol === "https:" && url.protocol !== "wss:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
