"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ZONE_LABEL, type Zone } from "@/lib/utils";

type MapCustomer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zone: string | null;
  segment: string | null;
};

const ZONE_COLOR: Record<string, string> = {
  north: "#028090",
  central: "#00a896",
  west: "#5a3d99",
  south: "#c0392b",
};

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C6 0 0 5.8 0 13c0 9 13 21 13 21s13-12 13-21C26 5.8 20 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5.5" fill="white"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

export function MapView({
  customers,
  height = "70vh",
  interactive = true,
}: {
  customers: MapCustomer[];
  height?: string;
  interactive?: boolean;
}) {
  const center = useMemo<[number, number]>(() => {
    if (customers.length === 0) return [22.9734, 78.6569]; // center of India
    const lat = customers.reduce((s, c) => s + c.latitude, 0) / customers.length;
    const lng = customers.reduce((s, c) => s + c.longitude, 0) / customers.length;
    return [lat, lng];
  }, [customers]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height }}>
      <MapContainer
        center={center}
        zoom={customers.length ? 7 : 5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {customers.map((c) => (
          <Marker
            key={c.id}
            position={[c.latitude, c.longitude]}
            icon={pinIcon(ZONE_COLOR[c.zone ?? ""] ?? "#028090")}
          >
            <Popup>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">
                {c.segment ?? "General"}
                {c.zone && ` · ${ZONE_LABEL[c.zone as Zone] ?? c.zone}`}
              </div>
              <Link href={`/customers/${c.id}`} className="text-xs underline text-teal-700">
                View customer
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
