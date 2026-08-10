import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createCompetitorNote } from "./actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompetitorIntelPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  let cq = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) cq = cq.eq("rep_id", repId);
  const { data: customers } = await cq;
  let q = supabaseAdmin.from("av_competitor_intel").select("id, competitor_name, notes, created_at, av_customers(name)").order("created_at", { ascending: false }).limit(50);
  if (repId) q = q.eq("rep_id", repId);
  const { data: notes } = await q;

  return (
    <div>
      <PageHeader title="Competitor Intel" subtitle="Log what competitors are offering, where" />

      <Card className="mb-6">
        <form action={createCompetitorNote} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select name="customer_id" required defaultValue="" className="h-10 rounded-lg border border-border px-3 text-sm bg-white outline-none focus:border-teal">
              <option value="" disabled>Customer</option>
              {(customers || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input name="competitor_name" required placeholder="Competitor name" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal" />
          </div>
          <textarea name="notes" rows={2} placeholder="What they're offering, pricing, etc." className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-teal" />
          <button type="submit" className="h-10 px-4 rounded-lg bg-teal text-white text-sm font-medium">Log note</button>
        </form>
      </Card>

      {!notes || notes.length === 0 ? (
        <EmptyState title="No competitor notes yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {notes.map((n: any) => (
              <div key={n.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{n.competitor_name} · {n.av_customers?.name}</p>
                  <p className="text-xs text-muted">{formatDate(n.created_at)}</p>
                </div>
                {n.notes && <p className="text-sm text-muted mt-1">{n.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
