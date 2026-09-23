import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { ZONES, ZONE_LABEL } from "@/lib/utils";
import { MapView } from "./MapView";

export const dynamic = "force-dynamic";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { zone: zoneFilter } = await searchParams;

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_customers")
    .select("id, name, segment, zone, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("name");
  if (repId) query.eq("rep_id", repId);
  if (zoneFilter) query.eq("zone", zoneFilter);
  const { data: customers } = await query;

  return (
    <div>
      <PageHeader
        title="Territory Map"
        subtitle={`${customers?.length ?? 0} located clinics`}
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Link
          href="/map"
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
            !zoneFilter
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          All zones
        </Link>
        {ZONES.map((z) => (
          <Link
            key={z}
            href={`/map?zone=${z}`}
            className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
              zoneFilter === z
                ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {ZONE_LABEL[z]}
          </Link>
        ))}
      </div>

      {(!customers || customers.length === 0) && (
        <p className="text-sm text-[var(--muted)] mb-3">
          No locations pinned yet — showing India. Capture a location while adding a customer or logging a visit to pin it here.
        </p>
      )}

      <MapView
        customers={(customers ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          latitude: c.latitude as number,
          longitude: c.longitude as number,
          zone: c.zone,
          segment: c.segment,
        }))}
      />
    </div>
  );
}
