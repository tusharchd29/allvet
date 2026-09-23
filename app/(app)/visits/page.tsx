import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRepScope } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/icon";
import { EditableCard } from "../_shared/EditableCard";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const repId = getRepScope(session);
  const query = supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, discussion_summary, follow_up_required, next_visit_date, av_customers(name)")
    .order("visit_date", { ascending: false })
    .limit(50);
  if (repId) query.eq("rep_id", repId);
  const { data: visits } = await query;

  return (
    <div>
      <PageHeader
        title="Visits"
        subtitle="Field visit log"
        action={
          <Link href="/visits/new" className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-1.5">
            <Icon name="plus" size={15} /> Log visit
          </Link>
        }
      />

      {!visits || visits.length === 0 ? (
        <Card>
          <EmptyState icon="map-pin" title="No visits logged" subtitle="Log your first customer visit." />
        </Card>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => (
            <EditableCard
              key={v.id}
              table="av_visits"
              id={v.id}
              revalidate={["/visits"]}
              initialValues={{
                visit_date: v.visit_date,
                purpose: v.purpose,
                discussion_summary: v.discussion_summary,
                follow_up_required: v.follow_up_required,
                next_visit_date: v.next_visit_date,
              }}
              fields={[
                { name: "visit_date", label: "Visit date", type: "date" },
                { name: "purpose", label: "Purpose", type: "text" },
                { name: "discussion_summary", label: "Discussion summary", type: "textarea" },
                { name: "follow_up_required", label: "Needs a follow-up", type: "checkbox" },
                { name: "next_visit_date", label: "Next visit date", type: "date" },
              ]}
              className="flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-[var(--ink)]">
                  {/* @ts-expect-error joined relation */}
                  {v.av_customers?.name ?? "Customer"}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {v.purpose ?? "Visit"} · {formatDate(v.visit_date)}
                </div>
              </div>
              {v.follow_up_required && (
                <span className="status-pending px-2.5 py-1 rounded-full text-xs font-semibold">
                  Follow-up
                </span>
              )}
            </EditableCard>
          ))}
        </div>
      )}
    </div>
  );
}
