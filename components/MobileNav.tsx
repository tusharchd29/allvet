"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_PRIMARY } from "./nav-config";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-ink border-t border-white/10 pb-[env(safe-area-inset-bottom)] z-40">
      <div className="grid grid-cols-5">
        {MOBILE_PRIMARY.map((item) => {
          const active =
            item.href === "/more"
              ? ["/expenses", "/tours", "/travel", "/targets", "/advances", "/reports", "/trials", "/competitor-intel", "/brochures", "/more"].some((p) => pathname.startsWith(p))
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px]",
                active ? "text-mint" : "text-white/50"
              )}
            >
              <item.icon size={20} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
