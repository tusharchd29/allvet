import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope, getRepAdvanceReconciliation } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { AdvanceRow } from "./AdvanceRow";
import { createAdvance } from "./actions";
import { createRepAdvance } from "./rep-actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionForm } from "@/components/ActionForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ClaimsSection, type Claim } from "./ClaimsSection";

export const dynamic = "force-dynamic";

export default async function AdvancesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const customersQuery = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) customersQuery.eq("rep_id", repId);
  const { data: customers } = await customersQuery;

  const { reps: repBalances, entries: repAdvanceEntries } = await getRepAdvanceReconciliation(session);

  const claimsQuery = supabaseAdmin
    .from("av_rep_claims")
    .select("id, rep_id, amount, notes, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (repId) claimsQuery.eq("rep_id", repId);
  const { data: claimRows } = await claimsQuery;
  const claimsByRep = new Map<string, Claim[]>();
  for (const c of claimRows ?? []) {
    const list = claimsByRep.get(c.rep_id) ?? [];
    list.push({
      id: c.id,
      amount: c.amount,
      notes: c.notes,
      status: c.status as Claim["status"],
      created_at: c.created_at,
    });
    claimsByRep.set(c.rep_id, list);
  }
  const { data: repUsers } =
    session.role === "owner"
      ? await supabaseAdmin.from("av_users").select("id, name").eq("role", "rep").order("name")
      : { data: null };

  const advancesQuery = supabaseAdmin
    .from("av_advances")
    .select("id, amount, status, created_at, av_customers(name)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (repId) advancesQuery.eq("rep_id", repId);
  const { data: advances } = await advancesQuery;

  return (
    <div>
      <PageHeader title="Advances" subtitle="Customer advances and rep cash-advance reconciliation" />

      <div className="font-medium text-[var(--ink)] mb-2">Rep cash advances</div>
      <div className="space-y-2 mb-3">
        {repBalances.map((r) => (
          <Card key={r.repId}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--ink)]">{r.name}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  Advanced {formatCurrency(r.advanced)} · Spent {formatCurrency(r.spent)}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-semibold ${r.balance < 0 ? "text-red-600" : "text-[var(--ink)]"}`}
                >
                  {formatCurrency(Math.abs(r.balance))}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {r.balance < 0 ? "Owed to rep" : "Advance remaining"}
                </div>
              </div>
            </div>
            <ClaimsSection
              balance={r.balance}
              claims={claimsByRep.get(r.repId) ?? []}
              canSubmit={session.role !== "owner" && session.userId === r.repId}
              canResolve={session.role === "owner"}
            />
          </Card>
        ))}
      </div>

      {session.role === "owner" && (
        <Card className="mb-6">
          <div className="font-medium text-[var(--ink)] mb-3">Give a rep an advance</div>
          <ActionForm action={createRepAdvance} resetOnSuccess className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Rep</label>
              <select name="rep_id" required className="input-field" defaultValue="">
                <option value="" disabled>
                  Select a rep
                </option>
                {(repUsers ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Amount (₹)
                </label>
                <input name="amount" type="number" step="0.01" required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Date</label>
                <input
                  type="date"
                  name="given_at"
                  className="input-field"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Purpose</label>
              <input name="purpose" className="input-field" placeholder="Optional" />
            </div>
            <SubmitButton>Give advance</SubmitButton>
          </ActionForm>
        </Card>
      )}

      {repAdvanceEntries.length > 0 && (
        <div className="space-y-2 mb-6">
          {repAdvanceEntries.map((e) => (
            <Card key={e.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[var(--ink)]">
                  {session.role === "owner" ? `${e.repName} · ` : ""}
                  {e.purpose ?? "Cash advance"}
                </div>
                <div className="text-xs text-[var(--muted)]">{formatDate(e.given_at)}</div>
              </div>
              <div className="font-medium text-[var(--ink)]">{formatCurrency(e.amount)}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="font-medium text-[var(--ink)] mb-2">Customer advances</div>
      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Record an advance</div>
        <ActionForm action={createAdvance} resetOnSuccess className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Customer
            </label>
            <select name="customer_id" required className="input-field" defaultValue="">
              <option value="" disabled>
                Select a customer
              </option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Amount (₹)
            </label>
            <input name="amount" type="number" step="0.01" required className="input-field" />
          </div>
          <SubmitButton>Record advance</SubmitButton>
        </ActionForm>
      </Card>

      {!advances || advances.length === 0 ? (
        <Card>
          <EmptyState icon="wallet" title="No advances recorded" />
        </Card>
      ) : (
        <div className="space-y-2">
          {advances.map((a) => (
            <AdvanceRow
              key={a.id}
              advance={{
                id: a.id,
                amount: a.amount,
                status: a.status,
                created_at: a.created_at,
                // @ts-expect-error joined relation
                customerName: a.av_customers?.name ?? "Customer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
