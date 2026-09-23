-- Allvet schema — all tables prefixed av_ to share a Supabase project safely
-- alongside other apps. No Supabase Auth is used; access control happens in
-- the app's server actions (see lib/session.ts, lib/data.ts), not in RLS.
--
-- Reconciled 2026-09-23 against the live database (project "Nitin",
-- pxirxvmmqazosirbffge) via the Supabase MCP's information_schema
-- introspection — this file had drifted from several ad hoc dashboard
-- migrations (av_payments, av_products, av_order_items, av_tour_stops,
-- av_rep_advances, and a handful of added columns existed live but not
-- here). Keep this file in sync going forward: prefer `apply_migration`
-- over ad hoc dashboard edits so this stays trustworthy.
--
-- Every av_* table carries a permissive RLS policy (`av_anon_all`: role
-- anon, qual true, with_check true) — RLS is enabled, but it doesn't
-- restrict access on its own with a permissive-for-all policy. It exists so
-- the anon key can be used at all with RLS turned on; real authorization is
-- entirely in the app's server actions. See the deep security audit
-- (project doc `allvet-deep-audit-2026-09-23.md`) for the implications.

create table if not exists av_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique,
  role text not null check (role in ('owner','rep')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists av_segments (
  name text primary key
);

create table if not exists av_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  segment text,
  rep_id uuid not null references av_users(id),
  latitude double precision,
  longitude double precision,
  zone text,
  created_at timestamptz not null default now()
);

create table if not exists av_visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  visit_date date not null,
  purpose text,
  discussion_summary text,
  follow_up_required boolean default false,
  next_visit_date date,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

-- Shared catalog everyone orders from — presets picked by name in
-- OrderItemsField, with av_order_items.product_id linking back here when
-- the typed name matches a catalog entry.
create table if not exists av_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  default_unit text,
  default_price numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists av_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  -- product/quantity/amount are a maintained summary kept in sync with
  -- av_order_items by the app (see updateOrderItems in orders/actions.ts) —
  -- every existing reader (Payments, customer detail, dashboard totals)
  -- reads these columns rather than joining items every time.
  product text not null,
  quantity text,
  amount numeric,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','dispatched','fulfilled')),
  fulfilled_by uuid references av_users(id),
  confirmed_at timestamptz,
  dispatched_at timestamptz,
  fulfilled_at timestamptz,
  payment_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Multi-product order line items — replaces the single product/quantity
-- text fields on av_orders for any order created after Phase 2. An order
-- with no rows here is a legacy single-line order (see hasItems checks
-- throughout app/(app)/orders and app/(app)/customers).
create table if not exists av_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references av_orders(id) on delete cascade,
  product_id uuid references av_products(id) on delete set null,
  product_name text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric,
  line_amount numeric,
  created_at timestamptz not null default now()
);

-- Payments received against a fulfilled order — av_orders.amount minus the
-- sum of this table's rows (per order_id) is what Payments/payments/page.tsx
-- treats as outstanding.
create table if not exists av_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references av_orders(id) on delete cascade,
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  amount numeric not null,
  paid_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists av_targets (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  period_month date not null,
  target_amount numeric not null,
  created_at timestamptz not null default now(),
  unique (rep_id, period_month)
);

create table if not exists av_expenses (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  category text not null,
  amount numeric not null,
  note text,
  expense_date date not null,
  created_at timestamptz not null default now()
);

-- Money a customer owes the company (an advance the company extended to
-- them) — distinct from av_rep_advances below, which is cash given to a
-- rep for field expenses.
create table if not exists av_advances (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','settled')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

-- Cash the owner hands a rep to cover field expenses; reconciled against
-- av_expenses at read time (see getRepAdvanceReconciliation in lib/data.ts).
create table if not exists av_rep_advances (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  amount numeric not null,
  purpose text,
  given_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists av_tours (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  week_start date not null,
  zone text,
  plan_notes text,
  created_at timestamptz not null default now()
);

-- Individual customer stops within a weekly tour plan — added in the Tour
-- Plan rebuild alongside av_tours.zone.
create table if not exists av_tour_stops (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references av_tours(id) on delete cascade,
  customer_id uuid references av_customers(id) on delete set null,
  planned_date date not null,
  notes text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists av_travel_logs (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  travel_date date not null,
  start_km numeric not null,
  end_km numeric not null,
  distance_km numeric not null,
  -- Snapshot of the reimbursement rate active on travel_date at the time
  -- this row was created (see lib/rates.ts) — null for logs created before
  -- rate periods existed. Snapshotting, rather than joining av_rate_periods
  -- at read time, means a later rate change never rewrites a past trip's
  -- payout.
  rate_per_km numeric,
  created_at timestamptz not null default now()
);

-- Date-aware km reimbursement rates (mirrors Tushar's asm-os
-- asm_rate_periods pattern). The rate effective for a given date is the
-- row with the latest effective_from <= that date.
create table if not exists av_rate_periods (
  id uuid primary key default gen_random_uuid(),
  rate_per_km numeric not null check (rate_per_km > 0),
  effective_from date not null unique,
  created_at timestamptz not null default now()
);

create table if not exists av_product_trials (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  product text not null,
  trial_date date not null,
  outcome_notes text,
  created_at timestamptz not null default now()
);

create table if not exists av_competitor_intel (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  competitor_name text not null,
  competitor_product text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists av_brochures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

-- Photo evidence attached to a Visit, Expense, or Travel Log entry — see
-- lib/photos.ts. Files live in the private `av-photos` Storage bucket;
-- this table is the pointer + signed-URL lookup key.
create table if not exists av_photos (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('visit','expense','travel_log')),
  entity_id uuid not null,
  storage_path text not null,
  rep_id uuid not null references av_users(id),
  created_at timestamptz not null default now()
);

-- Rep-initiated claim for cash the company owes back, when field spending
-- has run ahead of cash advances (mirrors asm-os's "submit excess as a
-- claim" feature). See getRepAdvanceReconciliation in lib/data.ts for the
-- advanced-vs-spent balance a claim is submitted against.
create table if not exists av_rep_claims (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  amount numeric not null check (amount > 0),
  notes text,
  status text not null default 'pending' check (status in ('pending','approved','paid')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_av_customers_rep on av_customers(rep_id);
create index if not exists idx_av_visits_rep on av_visits(rep_id);
create index if not exists idx_av_visits_customer on av_visits(customer_id);
create index if not exists idx_av_orders_rep on av_orders(rep_id);
create index if not exists idx_av_orders_status on av_orders(status);
create index if not exists idx_av_order_items_order on av_order_items(order_id);
create index if not exists idx_av_payments_order on av_payments(order_id);
create index if not exists idx_av_expenses_rep on av_expenses(rep_id);
create index if not exists idx_av_advances_rep on av_advances(rep_id);
create index if not exists idx_av_rep_advances_rep on av_rep_advances(rep_id);
create index if not exists idx_av_tour_stops_tour on av_tour_stops(tour_id);
create index if not exists idx_av_photos_entity on av_photos(entity_type, entity_id);
create index if not exists idx_av_rep_claims_rep on av_rep_claims(rep_id);

-- RLS: enabled on every table above, each with a single permissive
-- `av_anon_all` policy (role anon, using (true), with check (true)). This
-- is NOT real row-level security — it's here so RLS can be on at all while
-- the anon key is used; authorization is entirely in the app layer. Kept
-- as a template rather than run automatically, since `create policy` isn't
-- idempotent without a DO block — see the deep security audit for context
-- before touching this.
--
-- alter table av_customers enable row level security;
-- create policy av_anon_all on av_customers for all to anon using (true) with check (true);
-- -- ...repeat per table.
