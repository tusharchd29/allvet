import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import { setTarget } from "./actions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const session = (await getSession())!;
  const periodMonth = new Date();
  periodMonth.setDate(1);
  const period = periodMonth.toISOString().slice(0, 10);
  const monthLabel = periodMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const { data: reps } = await supabaseAdmin.from("av_users").select("id, name").eq("role", "rep").eq("active", true).order("name");
  const { data: targets } = await supabaseAdmin.from("av_targets").select("rep_id, target_amount").eq("period_month", period);

  const { data: orders } = await supabaseAdmin
    .from("av_orders")
    .select("rep_id, amount, status")
    .gte("created_at", period)
    .eq("status", "fulfilled");

  const rows = (session.role === "owner" ? reps || [] : (reps || []).filter((r) => r.id === session.userId)).map((r) => {
    const target = targets?.find((t) => t.rep_id === r.id)?.target_amount || 0;
    const fulfilled = (orders || []).filter((o) => o.rep_id === r.id).reduce((s, o) => s + Number(o.amount || 0), 0);
    const pct = target > 0 ? Math.round((fulfilled / target) * 100) : 0;
    return { ...r, target, fulfilled, pct };
  });

  return (
    <div>
      <PageHeader title="Targets" subtitle={monthLabel} />

      <Card padded={false}>
        <div className="divide-y divide-border/60">
          {rows.map((r) => (
            <div key={r.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-ink">{r.name}</p>
                <p className="text-sm text-muted">
                  {formatCurrency(r.fulfilled)}{r.target > 0 && <span> / {formatCurrency(r.target)}</span>}
                </p>
              </div>
              <ProgressBar pct={r.pct} />
              <p className="text-xs text-muted mt-2">Fulfilled orders only — pipeline orders don&apos;t count yet.</p>

              {session.role === "owner" && (
                <form action={setTarget} className="flex items-center gap-2 mt-3">
                  <input type="hidden" name="rep_id" value={r.id} />
                  <input
                    name="target_amount"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={r.target || ""}
                    placeholder="Set target (₹)"
                    className="h-9 rounded-lg border border-border px-3 text-sm focus:border-teal outline-none w-40"
                  />
                  <button type="submit" className="h-9 px-3.5 rounded-lg bg-ink text-white text-xs font-medium">
                    Save
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
