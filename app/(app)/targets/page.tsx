import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { formatCurrency } from "@/lib/utils";
import { setTarget } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionForm } from "@/components/ActionForm";
import { getEffectiveTargets } from "@/lib/targets";

export const dynamic = "force-dynamic";

function monthStart(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function TargetsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const currentMonth = monthStart();
  const monthStartDate = `${currentMonth}-01`;

  const repId = session.role === "owner" ? null : session.userId;

  let reps: Array<{ id: string; name: string }> = [];
  if (session.role === "owner") {
    const { data } = await supabaseAdmin
      .from("av_users")
      .select("id, name")
      .eq("role", "rep")
      .order("name");
    reps = data ?? [];
  } else {
    reps = [{ id: session.userId, name: session.name }];
  }

  // A target carries forward month to month until the owner sets a new one
  // — see lib/targets.ts. "This month" here is always the current calendar
  // month, not whatever range the global date filter might have set
  // elsewhere, since a target is inherently a monthly figure.
  const effectiveTargets = await getEffectiveTargets(
    repId ? [repId] : reps.map((r) => r.id),
    monthStartDate,
  );

  const ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("rep_id, amount, status, created_at")
    .eq("status", "fulfilled")
    .gte("created_at", monthStartDate);
  if (repId) ordersQuery.eq("rep_id", repId);
  const { data: orders } = await ordersQuery;

  const fulfilledByRep = new Map<string, number>();
  for (const o of orders ?? []) {
    fulfilledByRep.set(o.rep_id, (fulfilledByRep.get(o.rep_id) ?? 0) + (o.amount ?? 0));
  }

  const repsWithTargets = reps.filter((r) => effectiveTargets.has(r.id));

  return (
    <div>
      <PageHeader
        title="Targets"
        subtitle="Counts only orders marked Fulfilled — not just placed"
      />

      <div className="space-y-3 mb-6">
        {repsWithTargets.map((r) => {
          const target = effectiveTargets.get(r.id)!;
          const fulfilled = fulfilledByRep.get(r.id) ?? 0;
          const pct = Math.min(100, Math.round((fulfilled / target.amount) * 100));
          const carriedOver = target.setFor !== monthStartDate;
          return (
            <Card key={r.id}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-[var(--ink)]">{r.name}</span>
                <span className="text-[var(--muted)]">
                  {formatCurrency(fulfilled)} / {formatCurrency(target.amount)}
                </span>
              </div>
              <ProgressBar pct={pct} />
              {carriedOver && (
                <div className="text-xs text-[var(--muted)] mt-1.5">
                  Carried over — last set {target.setFor.slice(0, 7)}
                </div>
              )}
            </Card>
          );
        })}
        {repsWithTargets.length === 0 && (
          <div className="text-sm text-[var(--muted)]">
            No target has ever been set{session.role === "owner" ? "" : " for you"} yet.
          </div>
        )}
      </div>

      {session.role === "owner" && (
        <Card>
          <div className="font-medium text-[var(--ink)] mb-3">Set a target</div>
          <ActionForm action={setTarget} resetOnSuccess className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Rep
              </label>
              <select name="rep_id" required className="input-field" defaultValue="">
                <option value="" disabled>
                  Select a rep
                </option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Month
                </label>
                <input
                  type="month"
                  name="period_month"
                  className="input-field"
                  defaultValue={currentMonth}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Target (₹)
                </label>
                <input
                  type="number"
                  name="target_amount"
                  className="input-field"
                  placeholder="150000"
                  required
                />
              </div>
            </div>
            <SubmitButton>Save target</SubmitButton>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
