"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { formatDate } from "@/lib/utils";
import { updateTravelLog } from "./actions";
import { PhotoThumbs } from "@/components/PhotoThumbs";
import type { EntityPhoto } from "@/lib/photos";

export type TravelLog = {
  id: string;
  travel_date: string;
  start_km: number;
  end_km: number;
  distance_km: number;
  repName?: string | null;
};

export function TravelRow({
  log,
  showRep,
  photos,
}: {
  log: TravelLog;
  showRep: boolean;
  photos?: EntityPhoto[];
}) {
  const [editing, setEditing] = useState(false);
  const [travelDate, setTravelDate] = useState(log.travel_date);
  const [startKm, setStartKm] = useState(String(log.start_km));
  const [endKm, setEndKm] = useState(String(log.end_km));
  const [distance, setDistance] = useState(log.distance_km);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    const start = Number(startKm);
    const end = Number(endKm);
    startTransition(async () => {
      try {
        await updateTravelLog(log.id, { travel_date: travelDate, start_km: start, end_km: end });
        setDistance(end - start);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save changes");
      }
    });
  }

  if (!editing) {
    return (
      <Card className="flex items-center justify-between">
        <div>
          <div className="font-medium text-[var(--ink)]">{formatDate(travelDate)}</div>
          <div className="text-sm text-[var(--muted)]">
            {startKm} → {endKm} km{showRep && log.repName ? ` · ${log.repName}` : ""}
          </div>
          <PhotoThumbs photos={photos} />
        </div>
        <div className="flex items-center gap-3">
          <div className="font-medium text-[var(--ink)]">{distance} km</div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[var(--muted)] hover:text-[var(--teal)] p-1 -m-1"
            aria-label="Edit"
          >
            <Icon name="edit" size={16} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--ink)] mb-1">Date</label>
          <input
            type="date"
            className="input-field text-sm"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">Start km</label>
            <input
              type="number"
              step="0.1"
              className="input-field text-sm"
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1">End km</label>
            <input
              type="number"
              step="0.1"
              className="input-field text-sm"
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={pending} className="btn-primary text-xs px-4 py-1.5">
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTravelDate(log.travel_date);
              setStartKm(String(log.start_km));
              setEndKm(String(log.end_km));
              setError(null);
              setEditing(false);
            }}
            disabled={pending}
            className="text-xs text-[var(--muted)] underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </Card>
  );
}
