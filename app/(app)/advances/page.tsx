import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { AdvanceRow } from "./AdvanceRow";
import { createAdvance } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdvancesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const customersQuery = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) customersQuery.eq("rep_id", repId);
  const { data: customers } = await customersQuery;

  const advancesQuery = supabaseAdmin
    .from("av_advances")
    .select("id, amount, status, created_at, av_customers(name)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (repId) advancesQuery.eq("rep_id", repId);
  const { data: advances } = await advancesQuery;

  return (
    <div>
      <PageHeader title="Advances" subtitle="Customer advances and settlements" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Record an advance</div>
        <form action={createAdvance} className="space-y-4">
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
          <button type="submit" className="btn-primary w-full py-2.5">
            Record advance
          </button>
        </form>
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
