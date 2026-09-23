import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { createCompetitorIntel } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompetitorIntelPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const customersQuery = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) customersQuery.eq("rep_id", repId);
  const { data: customers } = await customersQuery;

  const intelQuery = supabaseAdmin
    .from("av_competitor_intel")
    .select("id, competitor_name, notes, created_at, av_customers(name)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (repId) intelQuery.eq("rep_id", repId);
  const { data: intel } = await intelQuery;

  return (
    <div>
      <PageHeader title="Competitor Intel" subtitle="What competitors are offering your customers" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log intel</div>
        <form action={createCompetitorIntel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Customer
            </label>
            <select name="customer_id" required className="input-field" defaultValue="">
              <option value="" disabled>
                Select a customer
              </option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Competitor
            </label>
            <input name="competitor_name" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Notes</label>
            <textarea name="notes" rows={2} className="input-field" placeholder="What they're offering" />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Save
          </button>
        </form>
      </Card>

      {!intel || intel.length === 0 ? (
        <Card>
          <EmptyState icon="binoculars" title="No competitor notes yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {intel.map((i) => (
            <Card key={i.id}>
              <div className="font-medium text-[var(--ink)]">
                {i.competitor_name} ·{" "}
                {/* @ts-expect-error joined relation */}
                {i.av_customers?.name}
              </div>
              <div className="text-sm text-[var(--muted)]">{formatDate(i.created_at)}</div>
              {i.notes && <div className="text-sm text-[var(--ink)] mt-1">{i.notes}</div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
