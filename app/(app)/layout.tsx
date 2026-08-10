import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <Sidebar name={session.name} role={session.role} />
      <div className="flex-1 min-w-0">
        <main className="px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
