import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/icon";
import { TeamMemberRow } from "./TeamMemberRow";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  const { data: users } = await supabaseAdmin
    .from("av_users")
    .select("id, name, role, active")
    .order("name");

  const owner = (users ?? []).filter((u) => u.role === "owner");
  const reps = (users ?? []).filter((u) => u.role === "rep");

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Rename yourself or any rep — this is what shows up everywhere else in the app"
        action={<Icon name="flower" size={20} className="text-[var(--saffron)] mt-1" />}
      />
      <div className="space-y-2">
        {[...owner, ...reps].map((u) => (
          <TeamMemberRow key={u.id} user={u} isSelf={u.id === session.userId} />
        ))}
      </div>
    </div>
  );
}
