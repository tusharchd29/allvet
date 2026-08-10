import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createAdvance } from "./actions";
import AdvanceRow from "./AdvanceRow";

export const dynamic = "force-dynamic";

export default async function AdvancesPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);

  let cq = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) cq = cq.eq("rep_id", repId);
  const { data: customers } = await cq;

  let q = supabaseAdmin.from("av_advances").select("id, amount, status, created_at, av_customers(name)").order("created_at", { ascending: false }).limit(50);
  if (repId) q = q.eq("rep_id", repId);
  const { data: advances } = await q;

  return (
    <div>
      <PageHeader title="Advances" subtitle="Customer advance payments, tracked to settlement" />

      <Card className="mb-6">
        <form action={createAdvance} className="grid grid-cols-2 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-ink block mb-1.5">Customer</label>
            <select name="customer_id" required defaultValue="" className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-white outline-none focus:border-teal">
              <option value="" disabled>Select</option>
              {(customers || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink block mb-1.5">Amount (₹)</label>
            <input name="amount" type="number" min="0" required className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal" />
          </div>
          <button type="submit" className="h-10 rounded-lg bg-teal text-white text-sm font-medium">Log advance</button>
        </form>
      </Card>

      {!advances || advances.length === 0 ? (
        <EmptyState title="No advances logged yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {advances.map((a: any) => <AdvanceRow key={a.id} advance={a} />)}
          </div>
        </Card>
      )}
    </div>
  );
}
