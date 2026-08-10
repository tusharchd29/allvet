import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCustomer } from "../actions";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const { data: segments } = await supabaseAdmin.from("av_segments").select("name").order("name");

  return (
    <div className="max-w-lg">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-muted mb-4">
        <ChevronLeft size={15} /> Customers
      </Link>
      <PageHeader title="Add customer" />

      <Card>
        <form action={createCustomer} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Name</label>
            <input name="name" required className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" placeholder="Clinic or farm name" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Phone</label>
            <input name="phone" type="tel" className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" placeholder="Optional" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Address</label>
            <input name="address" className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none" placeholder="Optional" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Type</label>
            <input
              name="segment"
              list="segment-suggestions"
              className="w-full h-11 rounded-xl border border-border px-3.5 text-sm focus:border-teal outline-none"
              placeholder="Select or type a new type"
            />
            <datalist id="segment-suggestions">
              {(segments || []).map((s) => (
                <option key={s.name} value={s.name} />
              ))}
            </datalist>
            <p className="text-xs text-muted mt-1.5">Pick an existing type, or type a new one — it&apos;ll be saved for next time.</p>
          </div>
          <button type="submit" className="w-full h-11 rounded-xl bg-teal text-white text-sm font-medium mt-2">
            Save customer
          </button>
        </form>
      </Card>
    </div>
  );
}
