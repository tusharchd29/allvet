import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createExpense } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { PhotoField } from "@/components/PhotoField";
import { PhotoThumbs } from "@/components/PhotoThumbs";
import { getPhotosForEntities } from "@/lib/photos";
import { parseDateRange } from "@/lib/date-range";
import { DateRangeFilter } from "@/components/DateRangeFilter";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const range = parseDateRange(await searchParams);

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_expenses")
    .select("id, category, amount, note, expense_date, av_users(name)")
    .order("expense_date", { ascending: false })
    .limit(50);
  if (repId) query.eq("rep_id", repId);
  if (range.from) query.gte("expense_date", range.from);
  if (range.to) query.lte("expense_date", range.to);
  const { data: expenses } = await query;
  const photosByExpense = await getPhotosForEntities(
    "expense",
    (expenses ?? []).map((e) => e.id),
  );

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Field expense claims" />

      <DateRangeFilter />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log an expense</div>
        <form action={createExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Category
              </label>
              <input name="category" required className="input-field" placeholder="e.g. Fuel" />
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
        </form>
      </Card>

      {!expenses || expenses.length === 0 ? (
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
    </div>
  );
}
