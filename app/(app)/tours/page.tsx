import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createTourPlan } from "./actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  let q = supabaseAdmin.from("av_tours").select("id, week_start, plan_notes, av_users(name)").order("week_start", { ascending: false }).limit(20);
  if (repId) q = q.eq("rep_id", repId);
  const { data: tours } = await q;

  return (
    <div>
      <PageHeader title="Tour Planning" subtitle="Plan the week's visits in advance" />

      <Card className="mb-6">
        <form action={createTourPlan} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink block mb-1.5">Week starting</label>
              <input name="week_start" type="date" required className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink block mb-1.5">Plan</label>
            <textarea name="plan_notes" rows={3} required placeholder="Mon: Ambala clinics. Tue: Zirakpur farms…" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal" />
          </div>
          <button type="submit" className="h-10 px-4 rounded-lg bg-teal text-white text-sm font-medium">Save plan</button>
        </form>
      </Card>

      {!tours || tours.length === 0 ? (
        <EmptyState title="No tour plans yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {tours.map((t: any) => (
              <div key={t.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-ink">Week of {formatDate(t.week_start)}</p>
                  {session.role === "owner" && t.av_users?.name && <p className="text-xs text-muted">{t.av_users.name}</p>}
                </div>
                <p className="text-sm text-muted whitespace-pre-line">{t.plan_notes}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
