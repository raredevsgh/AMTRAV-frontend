"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";
import type { Feature } from "geojson";
import { MapPin, Maximize2 } from "lucide-react";
import type { DeviceLocation } from "@/lib/console/locations";
import { locationIsStale } from "@/lib/console/locations";

export function FleetMap({
  locations,
  selectedId,
  onSelect,
  now,
}: {
  locations: DeviceLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  now: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const select = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
  const validToken = token.startsWith("pk.");
  const fitted = useRef(false);
  const lastFocused = useRef<string | null>(null);

  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!validToken || !container.current) return;
    let stopped = false;
    let observer: ResizeObserver | undefined;
    import("mapbox-gl")
      .then(({ default: mapboxgl }) => {
        if (stopped || !container.current) return;
        if (!mapboxgl.supported()) {
          setError(
            "This browser cannot display the map. Try a browser with WebGL enabled.",
          );
          return;
        }
        const instance = new mapboxgl.Map({
          container: container.current,
          accessToken: token,
          style: "mapbox://styles/mapbox/light-v11",
          center: [-12, 25],
          zoom: 1.6,
          attributionControl: true,
          cooperativeGestures: true,
        });
        map.current = instance;
        instance.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        observer = new ResizeObserver(() => instance.resize());
        observer.observe(container.current);
        instance.on("load", () => {
          instance.addSource("fleet", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          instance.addLayer({
            id: "fleet-points",
            type: "circle",
            source: "fleet",
            paint: {
              "circle-radius": ["case", ["boolean", ["get", "selected"], false], 11, 7],
              "circle-color": [
                "case",
                ["boolean", ["get", "stale"], false],
                "#8291a6",
                "#0047ad",
              ],
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            },
          });
          instance.on("click", "fleet-points", (event) => {
            const feature = event.features?.[0]?.toJSON() as Feature | undefined;
            const id: unknown = feature?.properties?.device_id;
            if (typeof id === "string") select.current(id);
          });
          instance.on("mouseenter", "fleet-points", () => {
            instance.getCanvas().style.cursor = "pointer";
          });
          instance.on("mouseleave", "fleet-points", () => {
            instance.getCanvas().style.cursor = "";
          });
          setReady(true);
          setError("");
        });
        instance.on("error", () => {
          setError(
            "Map tiles could not load. Check the Mapbox token, allowed URLs, and network connection.",
          );
        });
      })
      .catch(() => {
        if (!stopped) setError("The map could not start. Please reload the page.");
      });
    return () => {
      stopped = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      fitted.current = false;
      lastFocused.current = null;
    };
  }, [token, validToken]);

  function fitFleet() {
    if (!map.current || !locations.length) return;
    const longitudes = locations.map((item) => item.longitude);
    const latitudes = locations.map((item) => item.latitude);
    map.current.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
      ],
      { padding: 60, maxZoom: 12, duration: 600 },
    );
  }

  useEffect(() => {
    if (!ready || !map.current) return;
    const source = map.current.getSource("fleet") as GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: locations.map((item) => ({
        type: "Feature",
        id: item.device_id,
        geometry: { type: "Point", coordinates: [item.longitude, item.latitude] },
        properties: {
          device_id: item.device_id,
          stale: locationIsStale(item, now),
          selected: item.device_id === selectedId,
        },
      })),
    });
    if (!fitted.current && locations.length) {
      const lng = locations.map((item) => item.longitude);
      const lat = locations.map((item) => item.latitude);
      map.current.fitBounds(
        [
          [Math.min(...lng), Math.min(...lat)],
          [Math.max(...lng), Math.max(...lat)],
        ],
        { padding: 60, maxZoom: 12, duration: 0 },
      );
      fitted.current = true;
    }
    const selected = locations.find((item) => item.device_id === selectedId);
    if (selected && lastFocused.current !== selectedId) {
      map.current.flyTo({
        center: [selected.longitude, selected.latitude],
        zoom: 11,
        duration: 900,
      });
      lastFocused.current = selectedId;
    }
  }, [locations, selectedId, ready, now]);

  return (
    <div className="fleet-map-panel">
      <div
        ref={container}
        className="fleet-map-canvas"
        aria-label="Device location map"
      />
      {!validToken && (
        <div className="map-setup-state">
          <MapPin size={32} />
          <h2>Your fleet, on the map</h2>
          <p>Add the Mapbox public token to activate the map.</p>
          <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>
          <small>Positions remain available in the device list.</small>
        </div>
      )}
      {validToken && !ready && !error && (
        <div className="map-setup-state" role="status">
          Loading map…
        </div>
      )}
      {error && (
        <div className="map-error" role="alert">
          {error}
        </div>
      )}
      {ready && (
        <button
          className="map-fit console-secondary"
          onClick={fitFleet}
          disabled={!locations.length}
        >
          <Maximize2 size={16} /> Fit fleet
        </button>
      )}
      <div className="map-key">
        <span>
          <i /> Recent fix
        </span>
        <span>
          <i className="stale" /> Over 5 min old
        </span>
      </div>
    </div>
  );
}
