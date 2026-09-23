"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Submit button for a plain `<form action={serverAction}>`. Disables itself
 * and swaps its label while the action is in flight, so a rep on a slow
 * connection can't fire the same create action twice by tapping again.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("btn-primary w-full py-2.5", className)}
    >
      {pending ? (pendingLabel ?? "Saving…") : children}
    </button>
  );
}
