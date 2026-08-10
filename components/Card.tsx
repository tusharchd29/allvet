import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-border/60 shadow-[0_1px_2px_rgba(19,50,43,0.04)]",
        padded && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
