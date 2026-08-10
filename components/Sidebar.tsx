"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EVERYDAY_NAV, GROWTH_NAV } from "./nav-config";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: typeof EVERYDAY_NAV;
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold tracking-wider text-white/40 uppercase mb-2">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-mint text-ink font-medium"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  name,
  role,
}: {
  name: string;
  role: "owner" | "rep";
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink h-screen sticky top-0 px-3 py-5">
      <div className="px-3 mb-6">
        <p className="font-display text-lg font-semibold text-white">Allvet</p>
        <p className="text-xs text-white/50 mt-0.5">
          {name} &middot; {role === "owner" ? "Owner" : "Rep"}
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        <NavGroup label="Every day" items={EVERYDAY_NAV} pathname={pathname} />
        <NavGroup label="Growth & oversight" items={GROWTH_NAV} pathname={pathname} />
      </nav>

      <form action="/api/logout" method="post" className="px-3 pt-4 border-t border-white/10">
        <button className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <LogOut size={15} /> Log out
        </button>
      </form>
    </aside>
  );
}
