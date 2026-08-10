import { createClient } from "@supabase/supabase-js";

// Always-fresh fetch: Next.js's Data Cache silently caches fetch() responses
// app-wide, even inside actions marked force-dynamic. This override forces a
// real network round-trip on every Supabase call. (Lesson learned the hard
// way on ASM OS — see project notes.)
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
    db: { schema: "public" },
  }
);
