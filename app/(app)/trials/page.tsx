import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createTrial } from "./actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrialsPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  let cq = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) cq = cq.eq("rep_id", repId);
  const { data: customers } = await cq;
  let q = supabaseAdmin.from("av_product_trials").select("id, product, trial_date, outcome_notes, av_customers(name)").order("trial_date", { ascending: false }).limit(50);
  if (repId) q = q.eq("rep_id", repId);
  const { data: trials } = await q;

  return (
    <div>
      <PageHeader title="Product Trials" subtitle="Track new products placed with customers" />

      <Card className="mb-6">
        <form action={createTrial} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select name="customer_id" required defaultValue="" className="h-10 rounded-lg border border-border px-3 text-sm bg-white outline-none focus:border-teal">
              <option value="" disabled>Customer</option>
              {(customers || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input name="product" required placeholder="Product being trialled" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal" />
          </div>
          <textarea name="outcome_notes" rows={2} placeholder="Outcome so far (optional)" className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal" />
          <button type="submit" className="h-10 px-4 rounded-lg bg-teal text-white text-sm font-medium">Log trial</button>
        </form>
      </Card>

      {!trials || trials.length === 0 ? (
        <EmptyState title="No product trials logged yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {trials.map((t: any) => (
              <div key={t.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{t.product} · {t.av_customers?.name}</p>
                  <p className="text-xs text-muted">{formatDate(t.trial_date)}</p>
                </div>
                {t.outcome_notes && <p className="text-sm text-muted mt-1">{t.outcome_notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
