import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { EditableCard } from "../../_shared/EditableCard";
import { CustomerEditForm } from "../CustomerEditForm";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const repId = getRepScope(session);

  let customerQuery = supabaseAdmin
    .from("av_customers")
    .select("id, name, phone, address, segment, zone, rep_id")
    .eq("id", id);
  if (repId) customerQuery = customerQuery.eq("rep_id", repId);
  const { data: customer } = await customerQuery.maybeSingle();

  if (!customer) notFound();

  const { data: visits } = await supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, discussion_summary")
    .eq("customer_id", id)
    .order("visit_date", { ascending: false });

  const { data: orders } = await supabaseAdmin
    .from("av_orders")
    .select("id, product, quantity, amount, status, created_at, payment_due_date, notes")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: orderItemCounts } = orderIds.length
    ? await supabaseAdmin.from("av_order_items").select("order_id").in("order_id", orderIds)
    : { data: [] as { order_id: string }[] };
  const ordersWithItems = new Set((orderItemCounts ?? []).map((i) => i.order_id));

  return (
    <div>
      <PageHeader title={customer.name} subtitle={customer.segment ?? "General"} />

      <CustomerEditForm customer={customer} />

      <div className="font-medium text-[var(--ink)] mb-2">Orders</div>
      <div className="space-y-2 mb-6">
        {(orders ?? []).length === 0 && (
          <div className="text-sm text-[var(--muted)]">No orders yet.</div>
        )}
        {(orders ?? []).map((o) => {
          // Orders with real line items (av_order_items) keep product/
          // quantity/amount read-only here — editing those directly would
          // desync them from the items they're summarizing. Edit the
          // products themselves from the Orders page instead.
          const hasItems = ordersWithItems.has(o.id);
          return (
          <EditableCard
            key={o.id}
            table="av_orders"
            id={o.id}
            revalidate={["/customers/" + id, "/orders", "/payments", "/dashboard"]}
            initialValues={{
              ...(hasItems ? {} : { product: o.product, quantity: o.quantity, amount: o.amount }),
              notes: o.notes,
              payment_due_date: o.payment_due_date,
            }}
            fields={[
              ...(hasItems
                ? []
                : ([
                    { name: "product", label: "Product", type: "text" },
                    { name: "quantity", label: "Quantity", type: "text" },
                    { name: "amount", label: "Amount (₹)", type: "number" },
                  ] as const)),
              { name: "payment_due_date", label: "Payment due date", type: "date" },
              { name: "notes", label: "Notes", type: "textarea" },
            ]}
            className="flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-[var(--ink)]">
                {o.product} {o.quantity ? `· ${o.quantity}` : ""}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {formatDate(o.created_at)} · {formatCurrency(o.amount)}
              </div>
            </div>
            <StatusPill status={o.status} />
          </EditableCard>
          );
        })}
      </div>

      <div className="font-medium text-[var(--ink)] mb-2">Visits</div>
      <div className="space-y-2">
        {(visits ?? []).length === 0 && (
          <div className="text-sm text-[var(--muted)]">No visits logged yet.</div>
        )}
        {(visits ?? []).map((v) => (
          <EditableCard
            key={v.id}
            table="av_visits"
            id={v.id}
            revalidate={["/customers/" + id, "/visits"]}
            initialValues={{
              visit_date: v.visit_date,
              purpose: v.purpose,
              discussion_summary: v.discussion_summary,
            }}
            fields={[
              { name: "visit_date", label: "Visit date", type: "date" },
              { name: "purpose", label: "Purpose", type: "text" },
              { name: "discussion_summary", label: "Discussion summary", type: "textarea" },
            ]}
          >
            <div className="text-sm text-[var(--ink)]">{v.purpose ?? "Visit"}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">
              {formatDate(v.visit_date)}
            </div>
            {v.discussion_summary && (
              <div className="text-sm text-[var(--ink)] mt-2">
                {v.discussion_summary}
              </div>
            )}
          </EditableCard>
        ))}
      </div>
    </div>
  );
}
