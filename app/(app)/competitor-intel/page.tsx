import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { formatDate } from "@/lib/utils";
import { createCompetitorIntel } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ActionForm } from "@/components/ActionForm";

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
    .select("id, competitor_name, competitor_product, notes, created_at, av_customers(name)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (repId) intelQuery.eq("rep_id", repId);
  const { data: intel } = await intelQuery;

  return (
    <div>
      <PageHeader title="Competitor Intel" subtitle="What competitors are offering your customers" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log intel</div>
        <ActionForm action={createCompetitorIntel} resetOnSuccess className="space-y-4">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Competitor company
              </label>
              <input name="competitor_name" required className="input-field" placeholder="e.g. VetCorp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Their product
              </label>
              <input
                name="competitor_product"
                className="input-field"
                placeholder="e.g. Calcium Plus"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Notes</label>
            <textarea name="notes" rows={2} className="input-field" placeholder="What they're offering" />
          </div>
          <SubmitButton>Save</SubmitButton>
        </ActionForm>
      </Card>

      {!intel || intel.length === 0 ? (
        <Card>
          <EmptyState icon="binoculars" title="No competitor notes yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {intel.map((i) => (
            <EditableCard
              key={i.id}
              table="av_competitor_intel"
              id={i.id}
              revalidate={["/competitor-intel"]}
              initialValues={{
                competitor_name: i.competitor_name,
                competitor_product: i.competitor_product,
                notes: i.notes,
              }}
              fields={[
                { name: "competitor_name", label: "Competitor company", type: "text" },
                { name: "competitor_product", label: "Their product", type: "text" },
                { name: "notes", label: "Notes", type: "textarea" },
              ]}
            >
              <div className="font-medium text-[var(--ink)]">
                {i.competitor_name}
                {i.competitor_product ? ` — ${i.competitor_product}` : ""} ·{" "}
                {/* @ts-expect-error joined relation */}
                {i.av_customers?.name}
              </div>
              <div className="text-sm text-[var(--muted)]">{formatDate(i.created_at)}</div>
              {i.notes && <div className="text-sm text-[var(--ink)] mt-1">{i.notes}</div>}
            </EditableCard>
          ))}
        </div>
      )}
    </div>
  );
}
