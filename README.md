# Allvet — Field Sales Operations

Next.js + Supabase field ops app for a 5-person team (1 owner, 4 reps).

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind v4)
- Supabase (Postgres) — tables prefixed `av_` in a shared project
- PIN-based auth with a signed session cookie (no Supabase Auth) — access
  control is enforced in server actions, see `lib/session.ts` and `lib/data.ts`

## Features
Customers · Visits · Orders (Pending → Confirmed → Dispatched → Fulfilled)
· Targets (fulfilled-only) · Expenses · Advances · Tour Planning
· Travel & Location · Product Trials · Competitor Intel · Brochures · Reports

## Setup
1. Run `supabase/schema.sql` against your Supabase project.
2. Seed `av_users` with the owner + 4 reps (name, pin, role).
3. Copy `.env.example` to `.env.local` and fill in the values.
4. `npm install && npm run dev`

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET` — any long random string, used to sign the login cookie

## Notes
- Both rep and owner can advance an order's status (no approval gate) — mirrors how the team actually works.
- Targets only credit **fulfilled** orders, not pending/confirmed ones — keeps the numbers honest.
- Reports (AI-polished visit summaries) needs an AI provider key wired in before it's live — see `app/(app)/reports/page.tsx`.
