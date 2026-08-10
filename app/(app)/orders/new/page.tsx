import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import { createOrder } from "../actions";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  const { customer } = await searchParams;

  let q = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) q = q.eq("rep_id", repId);
  const { data: customers } = await q;

  return (
    <div className="max-w-lg">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted mb-4">
        <ChevronLeft size={15} /> Orders
      </Link>
      <PageHeader title="New order" subtitle="Starts as Pending — you can move it forward from the Orders list" />

      <Card>
        <form action={createOrder} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Customer</label>
            <select name="customer_id" required defaultValue={customer || ""} className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none bg-white">
              <option value="" disabled>Select a customer</option>
              {(customers || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Product</label>
            <input name="product" required className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">Quantity</label>
              <input name="quantity" className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" placeholder="e.g. 10 units" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">Amount (₹)</label>
              <input name="amount" type="number" min="0" step="1" className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Notes</label>
            <textarea name="notes" rows={3} className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:border-teal outline-none" placeholder="Optional" />
          </div>
          <button type="submit" className="w-full h-11 rounded-xl bg-teal text-white text-sm font-medium mt-2">
            Save order
          </button>
        </form>
      </Card>
    </div>
  );
}
