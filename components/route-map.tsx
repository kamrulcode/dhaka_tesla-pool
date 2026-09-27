"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Props = {
  pickup?: { lat: number; lon: number };
  dropoff?: { lat: number; lon: number };
  geometry?: any;
};
export function RouteMap({ pickup, dropoff, geometry }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let map: any;
    let mounted = true;
    (async () => {
      const L = await import("leaflet");
      if (!mounted || !ref.current) return;
      map = L.map(ref.current).setView([23.8103, 90.4125], 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      const points: any[] = [];
      if (pickup) {
        L.marker([pickup.lat, pickup.lon]).addTo(map).bindPopup("Pickup");
        points.push([pickup.lat, pickup.lon]);
      }
      if (dropoff) {
        L.marker([dropoff.lat, dropoff.lon])
          .addTo(map)
          .bindPopup("Destination");
        points.push([dropoff.lat, dropoff.lon]);
      }
      if (geometry?.coordinates) {
        const latlngs = geometry.coordinates.map((c: any) => [c[1], c[0]]);
        L.polyline(latlngs, { weight: 5 }).addTo(map);
        if (latlngs.length) points.push(...latlngs);
      }
      if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
    })();
    return () => {
      mounted = false;
      if (map) map.remove();
    };
  }, [
    pickup?.lat,
    pickup?.lon,
    dropoff?.lat,
    dropoff?.lon,
    JSON.stringify(geometry),
  ]);
  return (
    <div
      ref={ref}
      className="w-full h-72 rounded-2xl overflow-hidden route-map-frame"
    />
  );
}
