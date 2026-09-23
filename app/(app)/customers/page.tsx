import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/icon";
import { ZONES, ZONE_LABEL, type Zone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { zone: zoneFilter } = await searchParams;

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_customers")
    .select("id, name, phone, address, segment, zone")
    .order("name")
    .limit(200);
  if (repId) query.eq("rep_id", repId);
  if (zoneFilter) query.eq("zone", zoneFilter);
  const { data: customers } = await query;

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers?.length ?? 0} clinics`}
        action={
          <Link href="/customers/new" className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-1.5">
            <Icon name="plus" size={15} /> New
          </Link>
        }
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Link
          href="/customers"
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
            !zoneFilter
              ? "bg-[var(--teal)] text-white border-[var(--teal)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          All zones
        </Link>
        {ZONES.map((z) => (
          <Link
            key={z}
            href={`/customers?zone=${z}`}
            className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
              zoneFilter === z
                ? "bg-[var(--teal)] text-white border-[var(--teal)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {ZONE_LABEL[z]}
          </Link>
        ))}
      </div>

      {!customers || customers.length === 0 ? (
        <Card>
          <EmptyState
            icon="users"
            title="No customers yet"
            subtitle="Add the first clinic you visit to start tracking orders and visits."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <Card className="flex items-center justify-between hover:border-[var(--teal)] transition-colors">
                <div>
                  <div className="font-medium text-[var(--ink)]">{c.name}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {c.segment ?? "General"} {c.phone ? `· ${c.phone}` : ""}
                    {c.zone && ` · ${ZONE_LABEL[c.zone as Zone] ?? c.zone}`}
                  </div>
                </div>
                <Icon name="chevron-right" size={18} className="text-[var(--muted)]" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
