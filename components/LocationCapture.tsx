"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";

type Coords = { lat: number; lng: number } | null;

export function LocationCapture({
  label = "Location",
}: {
  label?: string;
}) {
  const [coords, setCoords] = useState<Coords>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  function capture() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("ok");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  useEffect(() => {
    capture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
      <div className="flex items-center gap-2 text-sm">
        {status === "loading" && (
          <span className="text-[var(--muted)] flex items-center gap-1.5">
            <Icon name="map-pin" size={14} /> Capturing location…
          </span>
        )}
        {status === "ok" && coords && (
          <span className="text-[var(--seafoam)] flex items-center gap-1.5">
            <Icon name="check" size={14} /> Location captured
          </span>
        )}
        {status === "error" && (
          <>
            <span className="text-[var(--muted)] flex items-center gap-1.5">
              <Icon name="map-pin" size={14} /> Location unavailable
            </span>
            <button
              type="button"
              onClick={capture}
              className="text-[var(--teal)] underline text-xs"
            >
              Retry
            </button>
          </>
        )}
        {status === "idle" && (
          <button
            type="button"
            onClick={capture}
            className="text-[var(--teal)] underline text-xs"
          >
            Use my location
          </button>
        )}
      </div>
    </div>
  );
}
