import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { createOrder } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";
import { OrderItemsField } from "../OrderItemsField";
import { DueDatePresets } from "@/components/DueDatePresets";
import { ActionForm } from "@/components/ActionForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const customersQuery = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) customersQuery.eq("rep_id", repId);

  const [{ data: customers }, { data: products }] = await Promise.all([
    customersQuery,
    supabaseAdmin
      .from("av_products")
      .select("id, name, category, default_unit, default_price")
      .eq("active", true)
      .order("name"),
  ]);

  return (
    <div>
      <PageHeader title="New order" />
      <Card>
        <ActionForm action={createOrder} redirectTo="/orders" className="space-y-4">
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

          <OrderItemsField products={products ?? []} />

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Payment due date
            </label>
            <input type="date" name="payment_due_date" className="input-field" />
            <DueDatePresets />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Notes
            </label>
            <textarea name="notes" rows={2} className="input-field" placeholder="Optional" />
          </div>
          <SubmitButton>Create order</SubmitButton>
        </ActionForm>
      </Card>
    </div>
  );
}
