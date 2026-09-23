import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { Autocomplete } from "@/components/Autocomplete";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createExpense } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { PhotoField } from "@/components/PhotoField";
import { PhotoThumbs } from "@/components/PhotoThumbs";
import { getPhotosForEntities } from "@/lib/photos";
import { ActionForm } from "@/components/ActionForm";
import { parseDateRange } from "@/lib/date-range";
import { DateRangeFilter } from "@/components/DateRangeFilter";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; rep?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const params = await searchParams;
  const range = parseDateRange(params);
  const isOwner = session.role === "owner";
  const repFilter = isOwner ? params.rep || null : null;

  // Owner with no rep picked yet: show the grouped-by-rep summary (totals
  // + drill-in links) instead of one long flat list of everyone's expenses.
  const showGroupedSummary = isOwner && !repFilter;

  const repId = getRepScope(session) ?? repFilter;
  const query = supabaseAdmin
    .from("av_expenses")
    .select("id, category, amount, note, expense_date, av_users(name)")
    .order("expense_date", { ascending: false })
    .limit(50);
  if (repId) query.eq("rep_id", repId);
  if (range.from) query.gte("expense_date", range.from);
  if (range.to) query.lte("expense_date", range.to);
  const { data: expensesData } = showGroupedSummary ? { data: null } : await query;
  const expenses = expensesData ?? [];
  const photosByExpense = showGroupedSummary
    ? new Map()
    : await getPhotosForEntities(
        "expense",
        expenses.map((e) => e.id),
      );

  // Suggest previously used categories rather than maintaining a separate
  // catalog table for something this small — every rep's own history (or
  // everyone's, for the owner) becomes the dropdown.
  const categoriesQuery = supabaseAdmin.from("av_expenses").select("category");
  if (getRepScope(session)) categoriesQuery.eq("rep_id", getRepScope(session) as string);
  const { data: categoryRows } = await categoriesQuery;
  const categories = Array.from(new Set((categoryRows ?? []).map((c) => c.category))).sort();

  // Grouped totals for the owner's summary view — every rep's expenses in
  // the selected date range, bucketed and summed. Not limited to 50 like
  // the itemized list above, since a total must reflect everything.
  let repGroups: Array<{ repId: string; name: string; total: number; count: number }> = [];
  let grandTotal = 0;
  if (showGroupedSummary) {
    const groupQuery = supabaseAdmin
      .from("av_expenses")
      .select("rep_id, amount, av_users(name)")
      .limit(5000);
    if (range.from) groupQuery.gte("expense_date", range.from);
    if (range.to) groupQuery.lte("expense_date", range.to);
    const { data: allExpenses } = await groupQuery;

    const byRep = new Map<string, { name: string; total: number; count: number }>();
    for (const e of allExpenses ?? []) {
      // @ts-expect-error joined relation
      const name = (e.av_users?.name as string) ?? "—";
      const existing = byRep.get(e.rep_id as string) ?? { name, total: 0, count: 0 };
      existing.total += e.amount as number;
      existing.count += 1;
      byRep.set(e.rep_id as string, existing);
    }
    repGroups = Array.from(byRep.entries())
      .map(([id, v]) => ({ repId: id, ...v }))
      .sort((a, b) => b.total - a.total);
    grandTotal = repGroups.reduce((s, r) => s + r.total, 0);
  }

  const rangeQuery = new URLSearchParams();
  if (range.from) rangeQuery.set("from", range.from);
  if (range.to) rangeQuery.set("to", range.to);
  const rangeSuffix = rangeQuery.toString();

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Field expense claims" />

      <DateRangeFilter />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log an expense</div>
        <ActionForm action={createExpense} resetOnSuccess className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Category
              </label>
              <Autocomplete
                name="category"
                required
                placeholder="e.g. Fuel"
                options={categories as string[]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Amount (₹)
              </label>
              <input name="amount" type="number" step="0.01" required className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Date</label>
            <input
              type="date"
              name="expense_date"
              className="input-field"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Note</label>
            <input name="note" className="input-field" placeholder="Optional" />
          </div>
          <PhotoField label="Receipt photo (optional)" />
          <SubmitButton>Add expense</SubmitButton>
        </ActionForm>
      </Card>

      {showGroupedSummary ? (
        <>
          <Card className="mb-4 flex items-center justify-between">
            <div className="text-sm text-[var(--muted)]">Total across all reps</div>
            <div className="text-lg font-semibold text-[var(--ink)]">{formatCurrency(grandTotal)}</div>
          </Card>
          {repGroups.length === 0 ? (
            <Card>
              <EmptyState icon="receipt" title="No expenses logged" />
            </Card>
          ) : (
            <div className="space-y-2">
              {repGroups.map((g) => (
                <a
                  key={g.repId}
                  href={`/expenses?rep=${g.repId}${rangeSuffix ? `&${rangeSuffix}` : ""}`}
                  className="block"
                >
                  <Card className="flex items-center justify-between hover:border-[var(--teal)] transition-colors">
                    <div>
                      <div className="font-medium text-[var(--ink)]">{g.name}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {g.count} expense{g.count === 1 ? "" : "s"} · tap to view
                      </div>
                    </div>
                    <div className="font-medium text-[var(--ink)]">{formatCurrency(g.total)}</div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {isOwner && repFilter && (
            <div className="mb-3">
              <a
                href={`/expenses${rangeSuffix ? `?${rangeSuffix}` : ""}`}
                className="text-sm text-[var(--teal)] font-medium inline-flex items-center gap-1"
              >
                ← All reps
              </a>
            </div>
          )}
          {expenses.length === 0 ? (
            <Card>
              <EmptyState icon="receipt" title="No expenses logged" />
            </Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((e) => (
            <EditableCard
              key={e.id}
              table="av_expenses"
              id={e.id}
              revalidate={["/expenses"]}
              initialValues={{
                category: e.category,
                amount: e.amount,
                note: e.note,
                expense_date: e.expense_date,
              }}
              fields={[
                { name: "category", label: "Category", type: "text" },
                { name: "amount", label: "Amount (₹)", type: "number" },
                { name: "expense_date", label: "Date", type: "date" },
                { name: "note", label: "Note", type: "text" },
              ]}
              className="flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-[var(--ink)]">{e.category}</div>
                <div className="text-sm text-[var(--muted)]">
                  {formatDate(e.expense_date)}
                  {session.role === "owner" && (
                    // @ts-expect-error joined relation
                    <> · {e.av_users?.name}</>
                  )}
                </div>
                <PhotoThumbs photos={photosByExpense.get(e.id)} />
              </div>
              <div className="font-medium text-[var(--ink)]">{formatCurrency(e.amount)}</div>
            </EditableCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
