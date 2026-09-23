import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { EditableCard } from "../_shared/EditableCard";
import { formatDate } from "@/lib/utils";
import { createTrial } from "./actions";

export const dynamic = "force-dynamic";

export default async function TrialsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const customersQuery = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) customersQuery.eq("rep_id", repId);
  const { data: customers } = await customersQuery;

  const trialsQuery = supabaseAdmin
    .from("av_product_trials")
    .select("id, product, trial_date, outcome_notes, av_customers(name)")
    .order("trial_date", { ascending: false })
    .limit(30);
  if (repId) trialsQuery.eq("rep_id", repId);
  const { data: trials } = await trialsQuery;

  return (
    <div>
      <PageHeader title="Product Trials" subtitle="Track sample trials with customers" />

      <Card className="mb-6">
        <div className="font-medium text-[var(--ink)] mb-3">Log a trial</div>
        <form action={createTrial} className="space-y-4">
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
              Product
            </label>
            <input name="product" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Date</label>
            <input
              type="date"
              name="trial_date"
              className="input-field"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Outcome notes
            </label>
            <textarea name="outcome_notes" rows={2} className="input-field" placeholder="Optional" />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Save trial
          </button>
        </form>
      </Card>

      {!trials || trials.length === 0 ? (
        <Card>
          <EmptyState icon="flask-conical" title="No trials logged yet" />
        </Card>
      ) : (
        <div className="space-y-2">
          {trials.map((t) => (
            <EditableCard
              key={t.id}
              table="av_product_trials"
              id={t.id}
              revalidate={["/trials"]}
              initialValues={{
                product: t.product,
                trial_date: t.trial_date,
                outcome_notes: t.outcome_notes,
              }}
              fields={[
                { name: "product", label: "Product", type: "text" },
                { name: "trial_date", label: "Date", type: "date" },
                { name: "outcome_notes", label: "Outcome notes", type: "textarea" },
              ]}
            >
              <div className="font-medium text-[var(--ink)]">
                {t.product} ·{" "}
                {/* @ts-expect-error joined relation */}
                {t.av_customers?.name}
              </div>
              <div className="text-sm text-[var(--muted)]">{formatDate(t.trial_date)}</div>
              {t.outcome_notes && (
                <div className="text-sm text-[var(--ink)] mt-1">{t.outcome_notes}</div>
              )}
            </EditableCard>
          ))}
        </div>
      )}
    </div>
  );
}
