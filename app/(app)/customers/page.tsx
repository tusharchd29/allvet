import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/icon";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_customers")
    .select("id, name, phone, address, segment")
    .order("name");
  if (repId) query.eq("rep_id", repId);
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
