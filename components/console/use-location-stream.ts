"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/console/api";
import {
  locationSocketUrl,
  parseLocationMessage,
  type DeviceLocation,
} from "@/lib/console/locations";
import { previewDevices } from "@/lib/console/demo";

const samplePositions = [
  { latitude: 5.6052, longitude: -0.1668 },
  { latitude: 51.47, longitude: -0.4543 },
  { latitude: 40.6413, longitude: -73.7781 },
];

type StreamStatus =
  "connecting" | "connected" | "reconnecting" | "unavailable" | "setup" | "preview";

export function useLocationStream(preview: boolean) {
  const [locations, setLocations] = useState<DeviceLocation[]>(() =>
    preview
      ? samplePositions.map((position, index) => ({
          device_id: previewDevices[index].id,
          ...position,
          accuracy_m: 15 + index * 10,
          recorded_at: new Date(Date.now() - index * 240_000).toISOString(),
          received_at: new Date().toISOString(),
        }))
      : [],
  );
  const [status, setStatus] = useState<StreamStatus>(preview ? "preview" : "connecting");
  const [message, setMessage] = useState("");
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    if (preview) return;
    const url = locationSocketUrl(
      process.env.NEXT_PUBLIC_LOCATION_WS_URL || "",
      window.location.protocol,
    );
    let stopped = false;
    let socket: WebSocket | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setInterval> | undefined;
    let failures = 0;
    const controller = new AbortController();

    function schedule() {
      if (stopped) return;
      setStatus("reconnecting");
      setMessage(
        "Connection interrupted. Showing last-known positions while reconnecting.",
      );
      const delay =
        Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5)) + Math.random() * 500;
      retry = setTimeout(connect, delay);
    }

    async function connect() {
      try {
        if (!url) {
          setStatus("setup");
          setMessage(
            "The location stream is not configured. Contact your administrator.",
          );
          return;
        }
        const { ticket } = await api<{ ticket: string }>("admin/locations/ticket", {
          method: "POST",
          signal: controller.signal,
        });
        if (stopped) return;
        socket = new WebSocket(url);
        let lastMessage = Date.now();
        socket.onopen = () => socket?.send(JSON.stringify({ ticket }));
        socket.onmessage = (event) => {
          if (stopped || typeof event.data !== "string") return;
          const data = parseLocationMessage(event.data);
          if (!data) {
            socket?.close(1002, "Invalid location message");
            return;
          }
          lastMessage = Date.now();
          if (data.type === "snapshot") {
            // Full snapshots remove revoked/deleted devices and recover reconnect gaps.
            setLocations(data.locations);
            setTruncated(data.truncated);
            setStatus("connected");
            setMessage("");
            failures = 0;
          }
        };
        watchdog = setInterval(() => {
          if (Date.now() - lastMessage > 40_000) socket?.close();
        }, 5000);
        socket.onerror = () => socket?.close();
        socket.onclose = () => {
          clearInterval(watchdog);
          schedule();
        };
      } catch (error) {
        if (stopped) return;
        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          setLocations([]);
          setStatus("unavailable");
          setMessage("An active administrator session is required to view locations.");
          return;
        }
        schedule();
      }
    }
    void connect();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(retry);
      clearInterval(watchdog);
      if (socket) {
        socket.onclose = null;
        socket.onmessage = null;
        socket.onopen = null;
        socket.onerror = null;
        socket.close();
      }
    };
  }, [preview]);

  return { locations, status, message, truncated };
}
