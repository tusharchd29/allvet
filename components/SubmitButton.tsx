"use client";

import { cn } from "@/lib/utils";
import { useActionFormPending } from "./ActionForm";

/**
 * Submit button for a form wrapped in `<ActionForm>`. Disables itself and
 * swaps its label while the action is in flight, so a rep on a slow
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
  const pending = useActionFormPending();
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
