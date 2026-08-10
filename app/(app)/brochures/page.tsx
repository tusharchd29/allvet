import { supabaseAdmin } from "@/lib/supabase-admin";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { createBrochure } from "./actions";
import { ExternalLink, Share2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrochuresPage() {
  const { data: brochures } = await supabaseAdmin.from("av_brochures").select("id, title, url, created_at").order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Brochures" subtitle="Share product materials straight to WhatsApp" />

      <Card className="mb-6">
        <form action={createBrochure} className="grid md:grid-cols-3 gap-3 items-end">
          <input name="title" required placeholder="Brochure title" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal md:col-span-1" />
          <input name="url" required type="url" placeholder="Link to the file (Drive, Storage, etc.)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-teal md:col-span-1" />
          <button type="submit" className="h-10 rounded-lg bg-teal text-white text-sm font-medium">Add brochure</button>
        </form>
      </Card>

      {!brochures || brochures.length === 0 ? (
        <EmptyState title="No brochures added yet" />
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-border/60">
            {brochures.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{b.title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={b.url} target="_blank" rel="noreferrer" className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted">
                    <ExternalLink size={15} />
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${b.title}: ${b.url}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-mint text-ink"
                  >
                    <Share2 size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
