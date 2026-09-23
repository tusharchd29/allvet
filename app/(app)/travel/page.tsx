import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { TravelRow } from "./TravelRow";
import { createTravelLog } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

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
        <div className="font-medium text-[var(--ink)] mb-3">Log today&apos;s travel</div>
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
          <SubmitButton>Save</SubmitButton>
        </form>
      </Card>

      {!logs || logs.length === 0 ? (
        <Card>
          <EmptyState icon="car" title="No travel logged yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <TravelRow
              key={l.id}
              log={{
                id: l.id,
                travel_date: l.travel_date,
                start_km: l.start_km,
                end_km: l.end_km,
                distance_km: l.distance_km,
                // @ts-expect-error joined relation
                repName: l.av_users?.name,
              }}
              showRep={session.role === "owner"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
