"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/Card";
import { Icon } from "@/components/icon";
import { ZONES, ZONE_LABEL } from "@/lib/utils";
import { updateEntry } from "../_shared/actions";

export type EditableCustomer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  segment: string | null;
  zone: string | null;
};

export function CustomerEditForm({ customer }: { customer: EditableCustomer }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    name: customer.name,
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    segment: customer.segment ?? "",
    zone: customer.zone ?? "",
  });
  const [saved, setSaved] = useState(customer);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!values.name.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateEntry(
          "av_customers",
          customer.id,
          {
            name: values.name.trim(),
            phone: values.phone.trim() || null,
            address: values.address.trim() || null,
            segment: values.segment.trim() || null,
            zone: values.zone || null,
          },
          ["/customers", `/customers/${customer.id}`, "/map", "/dashboard"],
        );
        setSaved({
          ...customer,
          name: values.name.trim(),
          phone: values.phone.trim() || null,
          address: values.address.trim() || null,
          segment: values.segment.trim() || null,
          zone: values.zone || null,
        });
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save changes");
      }
    });
  }

  if (!editing) {
    return (
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm space-y-1 flex-1 min-w-0">
            <div>
              <span className="text-[var(--muted)]">Phone: </span>
              {saved.phone ?? "—"}
            </div>
            <div>
              <span className="text-[var(--muted)]">Address: </span>
              {saved.address ?? "—"}
            </div>
            <div>
              <span className="text-[var(--muted)]">Zone: </span>
              {saved.zone ? ZONE_LABEL[saved.zone as keyof typeof ZONE_LABEL] ?? saved.zone : "—"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[var(--muted)] hover:text-[var(--teal)] p-1 -m-1 shrink-0"
            aria-label="Edit customer"
          >
            <Icon name="edit" size={16} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--ink)] mb-1">Name</label>
          <input
            className="input-field text-sm"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--ink)] mb-1">Phone</label>
          <input
            className="input-field text-sm"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--ink)] mb-1">Address</label>
          <input
            className="input-field text-sm"
            value={values.address}
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--ink)] mb-1">Segment</label>
          <input
            className="input-field text-sm"
            value={values.segment}
            onChange={(e) => setValues((v) => ({ ...v, segment: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--ink)] mb-1">Zone</label>
          <select
            className="input-field text-sm"
            value={values.zone}
            onChange={(e) => setValues((v) => ({ ...v, zone: e.target.value }))}
          >
            <option value="">No zone</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {ZONE_LABEL[z]}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={pending} className="btn-primary text-xs px-4 py-1.5">
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setValues({
                name: saved.name,
                phone: saved.phone ?? "",
                address: saved.address ?? "",
                segment: saved.segment ?? "",
                zone: saved.zone ?? "",
              });
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
