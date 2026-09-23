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
import { parseDateRange, dayStart, dayEnd } from "@/lib/date-range";
import { DateRangeFilter } from "@/components/DateRangeFilter";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const range = parseDateRange(await searchParams);

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_orders")
    .select(
      "id, product, quantity, amount, status, created_at, confirmed_at, dispatched_at, fulfilled_at, notes, payment_due_date, av_customers(name)",
    )
    .order("created_at", { ascending: false })
    .limit(80);
  if (repId) query.eq("rep_id", repId);
  if (range.from) query.gte("created_at", dayStart(range.from));
  if (range.to) query.lte("created_at", dayEnd(range.to));
  const { data: orders } = await query;

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: items } = orderIds.length
    ? await supabaseAdmin
        .from("av_order_items")
        .select("order_id, product_name, quantity")
        .in("order_id", orderIds)
    : { data: [] as { order_id: string; product_name: string; quantity: number }[] };

  const itemsByOrder = new Map<string, { product_name: string; quantity: number }[]>();
  for (const it of items ?? []) {
    const list = itemsByOrder.get(it.order_id) ?? [];
    list.push({ product_name: it.product_name, quantity: it.quantity });
    itemsByOrder.set(it.order_id, list);
  }

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

      <DateRangeFilter />

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
                confirmed_at: o.confirmed_at,
                dispatched_at: o.dispatched_at,
                fulfilled_at: o.fulfilled_at,
                notes: o.notes,
                payment_due_date: o.payment_due_date,
                // @ts-expect-error joined relation
                customerName: o.av_customers?.name ?? "Customer",
              }}
              items={itemsByOrder.get(o.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
