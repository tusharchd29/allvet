# Allvet Field Ops

A mobile-first field sales app for a 5-person veterinary supply team (1 owner + 4 reps): customer visits, sales orders with a Pending → Confirmed → Dispatched → Fulfilled lifecycle, monthly targets (counted only from fulfilled orders), expenses, advances, tour plans, travel logs, product trials, competitor intel, and shareable brochures.

## Stack

- Next.js 16 (App Router, Server Actions)
- Supabase (Postgres) — shared project, `av_` table prefix
- Custom 4-digit PIN login with a signed HMAC session cookie (no Supabase Auth — the team is small and fixed)
- Tailwind CSS v4

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — the Supabase project URL
- `SUPABASE_ANON_KEY` — server-only; the app authorizes access at the application layer (PIN session) rather than through Supabase Auth, so the `av_*` tables carry a permissive RLS policy scoping access to this key
- `SESSION_SECRET` — a long random string used to sign the session cookie

`lib/supabase-admin.ts` and `lib/session.ts` currently carry hardcoded fallback
values for these three, used only if the env vars are unset — a temporary
stopgap from when the deploying session couldn't set Vercel project env
vars. Set the real env vars on Vercel and remove those fallbacks when you get
a chance.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values, if present
npm run dev
```

## Users

Seeded in the `av_users` table — each person has a name, a 4-digit PIN, and
a role (`owner` or `rep`). Update PINs before rolling out to the real team.

## Live deployment

https://allvet.vercel.app
