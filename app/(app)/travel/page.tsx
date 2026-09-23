import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { createTravelLog } from "./actions";

export const dynamic = "force-dynamic";

export default async function TravelPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_travel_logs")
    .select("id, travel_date, start_km, end_km, distance_km, av_users(name)")
    .order("travel_date", { ascending: false })
    .limit(30);
  if (repId) query.eq("rep_id", repId);
  const { data: logs } = await query;

  return (
    <div>
      <PageHeader title="Travel Log" subtitle="Daily odometer readings" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log today's travel</div>
        <form action={createTravelLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Date</label>
            <input
              type="date"
              name="travel_date"
              className="input-field"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Start km
              </label>
              <input name="start_km" type="number" step="0.1" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                End km
              </label>
              <input name="end_km" type="number" step="0.1" required className="input-field" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Save
          </button>
        </form>
      </Card>

      {!logs || logs.length === 0 ? (
        <Card>
          <EmptyState icon="car" title="No travel logged yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <Card key={l.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--ink)]">{formatDate(l.travel_date)}</div>
                <div className="text-sm text-[var(--muted)]">
                  {l.start_km} → {l.end_km} km
                  {session.role === "owner" && (
                    // @ts-expect-error joined relation
                    <> · {l.av_users?.name}</>
                  )}
                </div>
              </div>
              <div className="font-medium text-[var(--ink)]">{l.distance_km} km</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
