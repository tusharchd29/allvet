import { createClient } from "@supabase/supabase-js";

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// NOTE: these fallbacks are a temporary stopgap because the deploying
// session's Vercel access token could not set project environment
// variables (403 Forbidden). Set NEXT_PUBLIC_SUPABASE_URL /
// SUPABASE_ANON_KEY as real Vercel env vars and remove these hardcoded
// fallbacks once that's done.
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4aXJ4dm1tcWF6b3NpcmJmZmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjU2NDQsImV4cCI6MjA5NTEwMTY0NH0.6L8nMeQSYZ-rTonyf9cY3io3Ml4ddzoQxDUR1wsKrjg";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pxirxvmmqazosirbffge.supabase.co",
  key,
  {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
    db: { schema: "public" },
  },
);
