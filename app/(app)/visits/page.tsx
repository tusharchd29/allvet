import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const session = (await getSession())!;
  const repId = await getRepScope(session);

  let q = supabaseAdmin
    .from("av_visits")
    .select("id, visit_date, purpose, discussion_summary, follow_up_required, av_customers(name), av_users(name)")
    .order("visit_date", { ascending: false })
    .limit(50);
  if (repId) q = q.eq("rep_id", repId);
  const { data: visits } = await q;

  return (
    <div>
      <PageHeader
        title="Visits"
        subtitle="What was discussed, logged on the spot"
        action={
          <Link href="/visits/new" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-teal text-white text-sm font-medium">
            <Plus size={16} /> Log visit
          </Link>
        }
      />

      {!visits || visits.length === 0 ? (
        <EmptyState title="No visits logged yet" hint="Visits you log will appear here." />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {visits.map((v: any) => (
              <div key={v.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{v.av_customers?.name || "Customer"}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {v.follow_up_required && <span className="text-[11px] text-warn bg-[#fdf3e2] rounded-full px-2 py-0.5">Follow-up</span>}
                    <p className="text-xs text-muted">{formatDate(v.visit_date)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted mt-1">
                  {v.purpose || "Visit"}{session.role === "owner" && v.av_users?.name ? ` · ${v.av_users.name}` : ""}
                </p>
                {v.discussion_summary && <p className="text-sm text-ink mt-1.5">{v.discussion_summary}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
