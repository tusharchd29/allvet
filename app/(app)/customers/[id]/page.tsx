import { supabaseAdmin } from "@/lib/supabase-admin";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import StatusPill from "@/components/StatusPill";
import Link from "next/link";
import { ChevronLeft, Phone, MapPin as MapPinIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: customer } = await supabaseAdmin.from("av_customers").select("*").eq("id", id).maybeSingle();
  if (!customer) notFound();

  const { data: visits } = await supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, discussion_summary")
    .eq("customer_id", id)
    .order("visit_date", { ascending: false })
    .limit(10);

  const { data: orders } = await supabaseAdmin
    .from("av_orders")
    .select("id, product, quantity, amount, status, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-muted mb-4">
        <ChevronLeft size={15} /> Customers
      </Link>
      <PageHeader
        title={customer.name}
        subtitle={customer.segment || undefined}
      />

      <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted">
        {customer.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {customer.phone}</span>}
        {customer.address && <span className="flex items-center gap-1.5"><MapPinIcon size={14} /> {customer.address}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card padded={false}>
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <p className="font-medium text-ink">Visits</p>
            <Link href={`/visits/new?customer=${id}`} className="text-sm text-teal font-medium">Log visit</Link>
          </div>
          {!visits || visits.length === 0 ? (
            <div className="p-5"><EmptyState title="No visits yet" /></div>
          ) : (
            <div className="divide-y divide-border/60">
              {visits.map((v) => (
                <div key={v.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{v.purpose || "Visit"}</p>
                    <p className="text-xs text-muted">{formatDate(v.visit_date)}</p>
                  </div>
                  {v.discussion_summary && <p className="text-xs text-muted mt-1">{v.discussion_summary}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padded={false}>
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <p className="font-medium text-ink">Orders</p>
            <Link href={`/orders/new?customer=${id}`} className="text-sm text-teal font-medium">New order</Link>
          </div>
          {!orders || orders.length === 0 ? (
            <div className="p-5"><EmptyState title="No orders yet" /></div>
          ) : (
            <div className="divide-y divide-border/60">
              {orders.map((o) => (
                <div key={o.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{o.product}{o.quantity ? ` · ${o.quantity}` : ""}</p>
                    <p className="text-xs text-muted mt-0.5">{formatDate(o.created_at)}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
