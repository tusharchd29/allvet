import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { formatDate } from "@/lib/utils";
import { createTourPlan } from "./actions";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_tours")
    .select("id, week_start, plan_notes, av_users(name)")
    .order("week_start", { ascending: false })
    .limit(20);
  if (repId) query.eq("rep_id", repId);
  const { data: tours } = await query;

  return (
    <div>
      <PageHeader title="Tour Plan" subtitle="Weekly territory plans" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Plan a week</div>
        <form action={createTourPlan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Week starting
            </label>
            <input type="date" name="week_start" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Plan
            </label>
            <textarea
              name="plan_notes"
              rows={3}
              required
              className="input-field"
              placeholder="Which routes / customers this week"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Save plan
          </button>
        </form>
      </Card>

      {!tours || tours.length === 0 ? (
        <Card>
          <EmptyState icon="calendar" title="No tour plans yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {tours.map((t) => (
            <EditableCard
              key={t.id}
              table="av_tours"
              id={t.id}
              revalidate={["/tours"]}
              initialValues={{ week_start: t.week_start, plan_notes: t.plan_notes }}
              fields={[
                { name: "week_start", label: "Week starting", type: "date" },
                { name: "plan_notes", label: "Plan", type: "textarea" },
              ]}
            >
              <div className="text-sm font-medium text-[var(--ink)]">
                Week of {formatDate(t.week_start)}
                {session.role === "owner" && (
                  // @ts-expect-error joined relation
                  <span className="text-[var(--muted)]"> · {t.av_users?.name}</span>
                )}
              </div>
              <div className="text-sm text-[var(--ink)] mt-1">{t.plan_notes}</div>
            </EditableCard>
          ))}
        </div>
      )}
    </div>
  );
}
