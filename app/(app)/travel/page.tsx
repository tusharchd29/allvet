import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createTravelLog } from "./actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TravelPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  let q = supabaseAdmin.from("av_travel_logs").select("id, travel_date, start_km, end_km, distance_km, av_users(name)").order("travel_date", { ascending: false }).limit(50);
  if (repId) q = q.eq("rep_id", repId);
  const { data: logs } = await q;
  const totalKm = (logs || []).reduce((s, l) => s + Number(l.distance_km || 0), 0);

  return (
    <div>
      <PageHeader title="Travel & Location" subtitle={`${totalKm} km logged`} />

      <Card className="mb-6">
        <form action={createTravelLog} className="grid grid-cols-2 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-ink block mb-1.5">Start odometer</label>
            <input name="start_km" type="number" min="0" required className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink block mb-1.5">End odometer</label>
            <input name="end_km" type="number" min="0" required className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal" />
          </div>
          <button type="submit" className="h-10 rounded-lg bg-teal text-white text-sm font-medium">Log trip</button>
        </form>
      </Card>

      {!logs || logs.length === 0 ? (
        <EmptyState title="No travel logged yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {logs.map((l: any) => (
              <div key={l.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{l.distance_km} km</p>
                  <p className="text-xs text-muted mt-0.5">{l.start_km} → {l.end_km}{session.role === "owner" && l.av_users?.name ? ` · ${l.av_users.name}` : ""}</p>
                </div>
                <p className="text-xs text-muted">{formatDate(l.travel_date)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
