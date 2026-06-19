"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { RouteTrackPoint } from "@/types/health";

// Fix leaflet default marker icons broken by webpack
const startIcon = L.divIcon({
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5)"></div>',
  className: "",
  iconAnchor: [6, 6],
});
const endIcon = L.divIcon({
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5)"></div>',
  className: "",
  iconAnchor: [6, 6],
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [24, 24] });
    }
  }, [map, positions]);
  return null;
}

interface Props {
  points: RouteTrackPoint[];
}

export default function RouteMapClient({ points }: Props) {
  const positions: [number, number][] = points.map((p) => [p.lat, p.lon]);
  const center: [number, number] = positions.length
    ? positions[Math.floor(positions.length / 2)]
    : [0, 0];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%", background: "#0d1117" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 1 && (
        <>
          <Polyline positions={positions} color="#6366f1" weight={3} opacity={0.85} />
          <Marker position={positions[0]} icon={startIcon} />
          <Marker position={positions[positions.length - 1]} icon={endIcon} />
          <FitBounds positions={positions} />
        </>
      )}
    </MapContainer>
  );
}
