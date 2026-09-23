import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
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

  const { data: customer } = await supabaseAdmin
    .from("av_customers")
    .select("id, name, phone, address, segment")
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  const { data: visits } = await supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, discussion_summary")
    .eq("customer_id", id)
    .order("visit_date", { ascending: false });

  const { data: orders } = await supabaseAdmin
    .from("av_orders")
    .select("id, product, quantity, amount, status, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title={customer.name} subtitle={customer.segment ?? "General"} />

      <Card className="mb-6">
        <div className="text-sm space-y-1">
          <div>
            <span className="text-[var(--muted)]">Phone: </span>
            {customer.phone ?? "—"}
          </div>
          <div>
            <span className="text-[var(--muted)]">Address: </span>
            {customer.address ?? "—"}
          </div>
        </div>
      </Card>

      <div className="font-medium text-[var(--ink)] mb-2">Orders</div>
      <div className="space-y-2 mb-6">
        {(orders ?? []).length === 0 && (
          <div className="text-sm text-[var(--muted)]">No orders yet.</div>
        )}
        {(orders ?? []).map((o) => (
          <Card key={o.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--ink)]">
                {o.product} {o.quantity ? `· ${o.quantity}` : ""}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {formatDate(o.created_at)} · {formatCurrency(o.amount)}
              </div>
            </div>
            <StatusPill status={o.status} />
          </Card>
        ))}
      </div>

      <div className="font-medium text-[var(--ink)] mb-2">Visits</div>
      <div className="space-y-2">
        {(visits ?? []).length === 0 && (
          <div className="text-sm text-[var(--muted)]">No visits logged yet.</div>
        )}
        {(visits ?? []).map((v) => (
          <Card key={v.id}>
            <div className="text-sm text-[var(--ink)]">{v.purpose ?? "Visit"}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">
              {formatDate(v.visit_date)}
            </div>
            {v.discussion_summary && (
              <div className="text-sm text-[var(--ink)] mt-2">
                {v.discussion_summary}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
