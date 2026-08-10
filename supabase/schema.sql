-- Allvet schema — all tables prefixed av_ to share a Supabase project safely
-- alongside other apps. No Supabase Auth is used; access control happens in
-- the app's server actions (see lib/session.ts, lib/data.ts).

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
  created_at timestamptz not null default now()
);

create table if not exists av_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  product text not null,
  quantity text,
  amount numeric,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','dispatched','fulfilled')),
  fulfilled_by uuid references av_users(id),
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create table if not exists av_advances (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references av_customers(id) on delete cascade,
  rep_id uuid not null references av_users(id),
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','settled')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists av_tours (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  week_start date not null,
  plan_notes text not null,
  created_at timestamptz not null default now()
);

create table if not exists av_travel_logs (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references av_users(id),
  travel_date date not null,
  start_km numeric not null,
  end_km numeric not null,
  distance_km numeric not null,
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
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists av_brochures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_av_customers_rep on av_customers(rep_id);
create index if not exists idx_av_visits_rep on av_visits(rep_id);
create index if not exists idx_av_visits_customer on av_visits(customer_id);
create index if not exists idx_av_orders_rep on av_orders(rep_id);
create index if not exists idx_av_orders_status on av_orders(status);
create index if not exists idx_av_expenses_rep on av_expenses(rep_id);
create index if not exists idx_av_advances_rep on av_advances(rep_id);
