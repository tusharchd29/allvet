import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getRepScope } from "@/lib/data";
import { createVisit } from "../actions";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const session = (await getSession())!;
  const repId = await getRepScope(session);
  const { customer } = await searchParams;

  let q = supabaseAdmin.from("av_customers").select("id, name").order("name");
  if (repId) q = q.eq("rep_id", repId);
  const { data: customers } = await q;

  return (
    <div className="max-w-lg">
      <Link href="/visits" className="inline-flex items-center gap-1 text-sm text-muted mb-4">
        <ChevronLeft size={15} /> Visits
      </Link>
      <PageHeader title="Log a visit" />

      <Card>
        <form action={createVisit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Customer</label>
            <select name="customer_id" required defaultValue={customer || ""} className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none bg-white">
              <option value="" disabled>Select a customer</option>
              {(customers || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Purpose</label>
            <input name="purpose" className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" placeholder="e.g. Routine check-in, new product intro" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">What was discussed</label>
            <textarea name="discussion_summary" rows={4} className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:border-teal outline-none" placeholder="Notes from the visit — kept as-is, no need to write formally" />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" name="follow_up_required" className="h-4 w-4 rounded border-border accent-teal" />
            Needs a follow-up
          </label>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Next visit date</label>
            <input name="next_visit_date" type="date" className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" />
          </div>
          <button type="submit" className="w-full h-11 rounded-xl bg-teal text-white text-sm font-medium mt-2">
            Save visit
          </button>
        </form>
      </Card>
    </div>
  );
}
