import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { TravelRow } from "./TravelRow";
import { createTravelLog, setRatePeriod } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { PhotoField } from "@/components/PhotoField";
import { getPhotosForEntities } from "@/lib/photos";
import { ActionForm } from "@/components/ActionForm";
import { getCurrentRate } from "@/lib/rates";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TravelPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_travel_logs")
    .select("id, travel_date, start_km, end_km, distance_km, rate_per_km, av_users(name)")
    .order("travel_date", { ascending: false })
    .limit(30);
  if (repId) query.eq("rep_id", repId);
  const [{ data: logs }, currentRate] = await Promise.all([query, getCurrentRate()]);
  const photosByLog = await getPhotosForEntities(
    "travel_log",
    (logs ?? []).map((l) => l.id),
  );

  const totalReimbursement = (logs ?? []).reduce(
    (sum, l) => sum + (l.rate_per_km ? l.distance_km * l.rate_per_km : 0),
    0,
  );

  return (
    <div>
      <PageHeader title="Travel Log" subtitle="Daily odometer readings" />

      <Card className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-[var(--muted)]">Reimbursement rate</div>
          <div className="font-medium text-[var(--ink)]">
            {currentRate ? `${formatCurrency(currentRate.rate_per_km)}/km` : "Not set"}
          </div>
        </div>
        {totalReimbursement > 0 && (
          <div className="text-right">
            <div className="text-xs text-[var(--muted)]">Reimbursement due (below)</div>
            <div className="font-medium text-[var(--ink)]">{formatCurrency(totalReimbursement)}</div>
          </div>
        )}
      </Card>

      {session.role === "owner" && (
        <Card className="mb-6">
          <div className="font-medium text-[var(--ink)] mb-3">Set reimbursement rate</div>
          <ActionForm action={setRatePeriod} resetOnSuccess className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Rate (₹/km)
                </label>
                <input
                  name="rate_per_km"
                  type="number"
                  step="0.01"
                  required
                  className="input-field"
                  placeholder={currentRate ? String(currentRate.rate_per_km) : "e.g. 8"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Effective from
                </label>
                <input
                  type="date"
                  name="effective_from"
                  className="input-field"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Applies to travel logged on or after this date — past trips keep the rate that was
              active when they were logged.
            </p>
            <SubmitButton>Save rate</SubmitButton>
          </ActionForm>
        </Card>
      )}

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log today&apos;s travel</div>
        <ActionForm action={createTravelLog} resetOnSuccess className="space-y-4">
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
          <PhotoField label="Odometer photo (optional)" />
          <SubmitButton>Save</SubmitButton>
        </ActionForm>
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
                rate_per_km: l.rate_per_km,
                // @ts-expect-error joined relation
                repName: l.av_users?.name,
              }}
              showRep={session.role === "owner"}
              photos={photosByLog.get(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
