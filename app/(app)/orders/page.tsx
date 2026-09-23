import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/icon";
import { OrderRow } from "./OrderRow";
import type { OrderStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_orders")
    .select("id, product, quantity, amount, status, created_at, av_customers(name)")
    .order("created_at", { ascending: false })
    .limit(80);
  if (repId) query.eq("rep_id", repId);
  const { data: orders } = await query;

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Pending → Confirmed → Dispatched → Fulfilled"
        action={
          <Link href="/orders/new" className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-1.5">
            <Icon name="plus" size={15} /> New order
          </Link>
        }
      />

      {!orders || orders.length === 0 ? (
        <Card>
          <EmptyState icon="package" title="No orders yet" subtitle="Create your first sales order." />
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <OrderRow
              key={o.id}
              order={{
                id: o.id,
                product: o.product,
                quantity: o.quantity,
                amount: o.amount,
                status: o.status as OrderStatus,
                created_at: o.created_at,
                // @ts-expect-error joined relation
                customerName: o.av_customers?.name ?? "Customer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
