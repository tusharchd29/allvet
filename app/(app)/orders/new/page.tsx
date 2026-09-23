import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { createOrder } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) query.eq("rep_id", repId);
  const { data: customers } = await query;

  return (
    <div>
      <PageHeader title="New order" />
      <Card>
        <form action={createOrder} className="space-y-4">
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
              Product
            </label>
            <input name="product" required className="input-field" placeholder="e.g. Calcium bolus" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Quantity
              </label>
              <input name="quantity" className="input-field" placeholder="e.g. 20 boxes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Amount (₹)
              </label>
              <input name="amount" type="number" step="0.01" className="input-field" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Notes
            </label>
            <textarea name="notes" rows={2} className="input-field" placeholder="Optional" />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Create order
          </button>
        </form>
      </Card>
    </div>
  );
}
