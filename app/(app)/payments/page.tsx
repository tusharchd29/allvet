import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, isOverdue } from "@/lib/utils";
import { PaymentRow, type DueOrder } from "./PaymentRow";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "overdue" | "all" }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { filter } = await searchParams;

  const repId = getRepScope(session);
  const ordersQuery = supabaseAdmin
    .from("av_orders")
    .select("id, product, amount, payment_due_date, created_at, customer_id, av_customers(name)")
    .eq("status", "fulfilled")
    .not("amount", "is", null)
    .order("created_at", { ascending: false })
    // Bounded like every other list page. 300 fulfilled orders is well
    // beyond what a 5-person team accumulates between cleanups, and this
    // page only needs the *outstanding* ones anyway (filtered below) —
    // the oldest-first ordering combined with this cap means a very old
    // unpaid balance could in theory scroll out of range over years of
    // use; worth revisiting with real pagination if that ever happens.
    .limit(300);
  if (repId) ordersQuery.eq("rep_id", repId);
  const { data: orders } = await ordersQuery;

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: payments } = orderIds.length
    ? await supabaseAdmin.from("av_payments").select("order_id, amount").in("order_id", orderIds)
    : { data: [] as { order_id: string; amount: number }[] };

  const paidByOrder = new Map<string, number>();
  for (const p of payments ?? []) {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + p.amount);
  }

  const dueOrders: DueOrder[] = (orders ?? []).map((o) => {
    const paid = paidByOrder.get(o.id) ?? 0;
    return {
      id: o.id,
      customerId: o.customer_id,
      // @ts-expect-error joined relation
      customerName: o.av_customers?.name ?? "Customer",
      product: o.product,
      amount: o.amount ?? 0,
      paid,
      due: Math.max((o.amount ?? 0) - paid, 0),
      payment_due_date: o.payment_due_date,
      created_at: o.created_at,
    };
  });

  const outstanding = dueOrders.filter((o) => o.due > 0);
  const overdue = outstanding.filter((o) => isOverdue(o.payment_due_date));
  const totalDue = outstanding.reduce((s, o) => s + o.due, 0);
  const totalOverdue = overdue.reduce((s, o) => s + o.due, 0);

  const showOverdueOnly = filter === "overdue";
  const showAll = filter === "all";
  const base = showAll ? dueOrders : showOverdueOnly ? overdue : outstanding;
  const list = base.sort((a, b) => {
    if (!a.payment_due_date) return 1;
    if (!b.payment_due_date) return -1;
    return a.payment_due_date.localeCompare(b.payment_due_date);
  });

  return (
    <div>
      <PageHeader title="Payment Dues" subtitle="Follow up on fulfilled orders awaiting payment" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="text-center">
          <div className="text-xs text-[var(--muted)]">Total outstanding</div>
          <div className="text-lg font-semibold text-[var(--ink)] mt-1">
            {formatCurrency(totalDue)}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs text-[var(--muted)]">Overdue</div>
          <div className="text-lg font-semibold text-red-600 mt-1">
            {formatCurrency(totalOverdue)}
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <a
          href="/payments"
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
            !showOverdueOnly && !showAll
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          Outstanding ({outstanding.length})
        </a>
        <a
          href="/payments?filter=overdue"
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
            showOverdueOnly
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          Overdue ({overdue.length})
        </a>
        <a
          href="/payments?filter=all"
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
            showAll
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          All ({dueOrders.length})
        </a>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon="indian-rupee"
            title={showOverdueOnly ? "No overdue payments" : showAll ? "No fulfilled orders yet" : "All caught up"}
            subtitle={'Payment dues appear here for fulfilled orders — including paid ones under the "All" tab.'}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((o) => (
            <PaymentRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
