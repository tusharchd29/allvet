import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { formatDate, ZONES, ZONE_LABEL, type Zone } from "@/lib/utils";
import { createTourPlan } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { TourStops, type Stop } from "./TourStops";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);

  const toursQuery = supabaseAdmin
    .from("av_tours")
    .select("id, week_start, zone, plan_notes, rep_id, av_users(name)")
    .order("week_start", { ascending: false })
    .limit(20);
  if (repId) toursQuery.eq("rep_id", repId);

  const customersQuery = supabaseAdmin.from("av_customers").select("id, name, rep_id").order("name");
  if (repId) customersQuery.eq("rep_id", repId);

  const [{ data: tours }, { data: allCustomers }] = await Promise.all([toursQuery, customersQuery]);

  const tourIds = (tours ?? []).map((t) => t.id);
  const { data: allStops } = tourIds.length
    ? await supabaseAdmin
        .from("av_tour_stops")
        .select("id, tour_id, customer_id, planned_date, notes, completed, av_customers(name)")
        .in("tour_id", tourIds)
        .order("planned_date", { ascending: true })
    : { data: [] as never[] };

  const stopsByTour = new Map<string, Stop[]>();
  for (const s of allStops ?? []) {
    const list = stopsByTour.get(s.tour_id) ?? [];
    list.push({
      id: s.id,
      // @ts-expect-error joined relation
      customerName: s.av_customers?.name ?? null,
      planned_date: s.planned_date,
      notes: s.notes,
      completed: s.completed,
    });
    stopsByTour.set(s.tour_id, list);
  }

  return (
    <div>
      <PageHeader title="Tour Plan" subtitle="Weekly territory plans" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Plan a week</div>
        <form action={createTourPlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Week starting
              </label>
              <input type="date" name="week_start" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Zone</label>
              <select name="zone" className="input-field" defaultValue="">
                <option value="">Not set</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {ZONE_LABEL[z]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Overview notes
            </label>
            <textarea
              name="plan_notes"
              rows={2}
              className="input-field"
              placeholder="Optional — anything not tied to a specific stop"
            />
          </div>
          <p className="text-xs text-[var(--muted)]">
            Add specific customer stops once the plan is saved.
          </p>
          <SubmitButton>Save plan</SubmitButton>
        </form>
      </Card>

      {!tours || tours.length === 0 ? (
        <Card>
          <EmptyState icon="calendar" title="No tour plans yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {tours.map((t) => {
            // A rep only picks stops from their own customers; the owner
            // picks from whichever rep owns this tour.
            const tourCustomers = repId
              ? (allCustomers ?? []).filter((c) => c.rep_id === repId)
              : (allCustomers ?? []).filter((c) => c.rep_id === t.rep_id);
            return (
              <EditableCard
                key={t.id}
                table="av_tours"
                id={t.id}
                revalidate={["/tours"]}
                initialValues={{
                  week_start: t.week_start,
                  zone: t.zone,
                  plan_notes: t.plan_notes,
                }}
                fields={[
                  { name: "week_start", label: "Week starting", type: "date" },
                  {
                    name: "zone",
                    label: "Zone",
                    type: "select",
                    options: [
                      { value: "", label: "Not set" },
                      ...ZONES.map((z) => ({ value: z, label: ZONE_LABEL[z as Zone] })),
                    ],
                  },
                  { name: "plan_notes", label: "Overview notes", type: "textarea" },
                ]}
              >
                <div className="text-sm font-medium text-[var(--ink)]">
                  Week of {formatDate(t.week_start)}
                  {t.zone && (
                    <span className="text-[var(--muted)]"> · {ZONE_LABEL[t.zone as Zone] ?? t.zone}</span>
                  )}
                  {session.role === "owner" && (
                    // @ts-expect-error joined relation
                    <span className="text-[var(--muted)]"> · {t.av_users?.name}</span>
                  )}
                </div>
                {t.plan_notes && <div className="text-sm text-[var(--ink)] mt-1">{t.plan_notes}</div>}
                <TourStops
                  tourId={t.id}
                  stops={stopsByTour.get(t.id) ?? []}
                  customers={tourCustomers}
                  weekStart={t.week_start}
                />
              </EditableCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
