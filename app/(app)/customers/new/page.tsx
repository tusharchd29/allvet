import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { LocationCapture } from "@/components/LocationCapture";
import { ZONES, ZONE_LABEL } from "@/lib/utils";
import { createCustomer } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: segments } = await supabaseAdmin
    .from("av_segments")
    .select("name")
    .order("name");

  return (
    <div>
      <PageHeader title="New customer" subtitle="Add a clinic or farm" />
      <Card>
        <form action={createCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Name
            </label>
            <input name="name" required className="input-field" placeholder="Clinic name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Phone
            </label>
            <input name="phone" className="input-field" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Address
            </label>
            <input name="address" className="input-field" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Segment
            </label>
            <input
              name="segment"
              list="segment-suggestions"
              className="input-field"
              placeholder="e.g. Retail, Farm, Hospital"
            />
            <datalist id="segment-suggestions">
              {(segments ?? []).map((s) => (
                <option key={s.name} value={s.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Zone
            </label>
            <select name="zone" className="input-field" defaultValue="">
              <option value="">No zone</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {ZONE_LABEL[z]}
                </option>
              ))}
            </select>
          </div>
          <LocationCapture label="Location" />
          <button type="submit" className="btn-primary w-full py-2.5">
            Save customer
          </button>
        </form>
      </Card>
    </div>
  );
}
