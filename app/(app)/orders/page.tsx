import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { Plus } from "lucide-react";
import OrderRow from "./OrderRow";
import { cn, ORDER_STATUSES, STATUS_LABEL, OrderStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  const { status } = await searchParams;
  const activeStatus = (ORDER_STATUSES as readonly string[]).includes(status || "") ? (status as OrderStatus) : undefined;

  let q = supabaseAdmin
    .from("av_orders")
    .select("id, product, quantity, amount, status, created_at, av_customers(name), av_users(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (repId) q = q.eq("rep_id", repId);
  if (activeStatus) q = q.eq("status", activeStatus);
  const { data: orders } = await q;

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Tracked from pending to fulfilled"
        action={
          <Link href="/orders/new" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-teal text-white text-sm font-medium">
            <Plus size={16} /> New order
          </Link>
        }
      />

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <Link
          href="/orders"
          className={cn(
            "shrink-0 text-sm rounded-full px-3.5 py-1.5 border",
            !activeStatus ? "bg-ink text-white border-ink" : "border-border text-muted"
          )}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/orders?status=${s}`}
            className={cn(
              "shrink-0 text-sm rounded-full px-3.5 py-1.5 border",
              activeStatus === s ? "bg-ink text-white border-ink" : "border-border text-muted"
            )}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <EmptyState title="No orders here yet" hint="Orders you log will move through pending → confirmed → dispatched → fulfilled." />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {orders.map((o: any) => (
              <OrderRow
                key={o.id}
                order={{
                  id: o.id,
                  product: o.product,
                  quantity: o.quantity,
                  amount: o.amount,
                  status: o.status,
                  created_at: o.created_at,
                  customerName: o.av_customers?.name || "Customer",
                  repName: o.av_users?.name,
                }}
                showRep={session.role === "owner"}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
