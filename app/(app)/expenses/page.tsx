import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createExpense } from "./actions";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  let q = supabaseAdmin.from("av_expenses").select("id, category, amount, note, expense_date, av_users(name)").order("expense_date", { ascending: false }).limit(50);
  if (repId) q = q.eq("rep_id", repId);
  const { data: expenses } = await q;
  const total = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`${formatCurrency(total)} logged`} />

      <Card className="mb-6">
        <form action={createExpense} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-medium text-ink block mb-1.5">Category</label>
            <input name="category" required placeholder="Fuel, food…" className="w-full h-10 rounded-lg border border-border px-3 text-sm focus:border-teal outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink block mb-1.5">Amount (₹)</label>
            <input name="amount" type="number" min="0" required className="w-full h-10 rounded-lg border border-border px-3 text-sm focus:border-teal outline-none" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-medium text-ink block mb-1.5">Note</label>
            <input name="note" placeholder="Optional" className="w-full h-10 rounded-lg border border-border px-3 text-sm focus:border-teal outline-none" />
          </div>
          <button type="submit" className="h-10 rounded-lg bg-teal text-white text-sm font-medium">Add</button>
        </form>
      </Card>

      {!expenses || expenses.length === 0 ? (
        <EmptyState title="No expenses logged yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {expenses.map((e: any) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{e.category}</p>
                  <p className="text-xs text-muted mt-0.5">{e.note}{session.role === "owner" && e.av_users?.name ? ` · ${e.av_users.name}` : ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-ink">{formatCurrency(e.amount)}</p>
                  <p className="text-xs text-muted">{formatDate(e.expense_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
