import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { Plus, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);

  let q = supabaseAdmin
    .from("av_customers")
    .select("id, name, phone, segment, av_users(name)")
    .order("name");
  if (repId) q = q.eq("rep_id", repId);
  const { data: customers } = await q;

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers?.length || 0} in your book`}
        action={
          <Link href="/customers/new" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-teal text-white text-sm font-medium">
            <Plus size={16} /> Add customer
          </Link>
        }
      />

      {!customers || customers.length === 0 ? (
        <EmptyState title="No customers yet" hint="Add your first customer to start logging visits and orders." />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {customers.map((c: any) => (
              <Link key={c.id} href={`/customers/${c.id}`} className="p-4 flex items-center justify-between hover:bg-offwhite transition-colors">
                <div>
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.segment && <span className="text-xs text-teal bg-offwhite rounded-full px-2 py-0.5">{c.segment}</span>}
                    {session.role === "owner" && c.av_users?.name && (
                      <span className="text-xs text-muted">{c.av_users.name}</span>
                    )}
                  </div>
                </div>
                {c.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted shrink-0">
                    <Phone size={13} /> {c.phone}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
