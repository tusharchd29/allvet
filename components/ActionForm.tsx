"use client";

import { createContext, useContext, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ActionResult = { ok: boolean; message?: string } | void | undefined;

const PendingContext = createContext(false);

/** Used by `SubmitButton` to disable itself and swap its label while the
 * enclosing `ActionForm`'s action is in flight — the client-side equivalent
 * of `useFormStatus`, which only works with the native `action={...}` form
 * prop that `ActionForm` deliberately doesn't use (see below). */
export function useActionFormPending() {
  return useContext(PendingContext);
}

/**
 * Replaces a plain `<form action={serverAction}>` for every create/edit form
 * in the app. The native pattern has one bad failure mode for a field rep on
 * a flaky connection: if the action throws — a validation error, a Supabase
 * timeout, anything — Next renders its default error page and every field
 * the rep typed is gone. There's no way to catch that from a plain form.
 *
 * `ActionForm` submits via `onSubmit` instead, inside a transition, so it
 * can catch a thrown error OR a returned `{ ok: false, message }` and show
 * it inline — the form stays mounted, the fields stay filled, and the rep
 * can just retry. Server actions used here should prefer returning
 * `{ ok: false, message }` for expected failures (validation, DB errors)
 * over throwing; a thrown error is still caught as a fallback, just with a
 * generic message unless it's a plain `Error`.
 *
 * On success: `resetOnSuccess` clears the form (for forms that stay on the
 * same page, e.g. "log an expense" above a running list), `redirectTo`
 * navigates (for standalone "new X" pages), and `router.refresh()` always
 * runs afterward so the already-`revalidatePath`-invalidated list data
 * shows up without a full reload.
 */
export function ActionForm({
  action,
  redirectTo,
  resetOnSuccess = false,
  onSuccess,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  redirectTo?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(fd);
        if (result && result.ok === false) {
          setError(
            result.message || "Something went wrong. Check your connection and try again.",
          );
          return;
        }
        if (resetOnSuccess) formRef.current?.reset();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Check your connection and try again.",
        );
      }
    });
  }

  return (
    <PendingContext.Provider value={pending}>
      <form ref={formRef} onSubmit={handleSubmit} className={className}>
        {children}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </form>
    </PendingContext.Provider>
  );
}
