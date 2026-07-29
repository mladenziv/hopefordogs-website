# Lottery / raffle — database setup

Run this **once** in the Supabase dashboard → **SQL editor** (project `gdmntnrsgfntcgqmbmtj`).
The site's anon key is read-only, so this migration cannot be applied from the app.

Two tables:
- `lotteries` — public-readable metadata (no personal data).
- `lottery_tickets` — holds buyer name/email, so it is **not** public-readable. The PHP endpoints
  (`/api/lottery/*`) read/write it with the service-role key. The beheer admin (logged-in session)
  manages `lotteries` and can read `lottery_tickets` for counts.

Lottery images reuse the existing public `dog-photos` storage bucket (path prefix `lottery/`), so no
new bucket is needed.

```sql
-- ---- lotteries -------------------------------------------------------------
create table if not exists public.lotteries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  sort_order       int  not null default 0,
  type             text not null default 'raffle',  -- raffle | fundraiser
  status           text not null default 'draft',  -- draft | scheduled | live | closed | drawn
  goal_cents       int,                             -- fundraiser target (fundraiser type only)
  start_at         timestamptz,
  draw_date        timestamptz,
  title_nl         text, title_de       text, title_en       text,
  description_nl   text, description_de  text, description_en text,
  prize_nl         text, prize_de        text, prize_en       text,
  image_url        text,
  prize_image_url  text,
  max_numbers      int  not null default 100,
  price_cents      int  not null default 500,
  num_winners      int  not null default 1,
  terms_url        text,
  prizes           jsonb,               -- [{ "label": "1e prijs: weekendje weg", "number": 42 }, ...]
  blocked_numbers  int[],               -- numbers the admin manually disabled (e.g. sold offline)
  winning_numbers  int[]
);

-- ---- lottery_tickets -------------------------------------------------------
create table if not exists public.lottery_tickets (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  lottery_id        uuid not null references public.lotteries(id) on delete cascade,
  number            int  not null,
  status            text not null default 'reserved',  -- reserved | paid
  reserved_until    timestamptz,
  buyer_name        text,
  buyer_email       text,
  mollie_payment_id text,
  unique (lottery_id, number)   -- makes reservations race-safe
);

-- ---- lottery_donations (fundraiser type) ----------------------------------
-- Holds donor name/email → NOT public-readable. The public donor wall + progress
-- are served (sanitized) by /api/lottery/status.php using the service key.
create table if not exists public.lottery_donations (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  lottery_id        uuid not null references public.lotteries(id) on delete cascade,
  amount_cents      int  not null,
  donor_name        text,
  anonymous         boolean not null default false,   -- hide name on the public wall
  donor_email       text,
  mollie_payment_id text,
  status            text not null default 'pending'   -- pending | paid
);

create index if not exists lottery_tickets_lottery_idx  on public.lottery_tickets (lottery_id);
create index if not exists lottery_tickets_status_idx   on public.lottery_tickets (lottery_id, status);
create index if not exists lotteries_status_idx         on public.lotteries (status);
create index if not exists lottery_donations_lottery_idx on public.lottery_donations (lottery_id, status);

-- ---- Row-Level Security ----------------------------------------------------
alter table public.lotteries        enable row level security;
alter table public.lottery_tickets  enable row level security;
alter table public.lottery_donations enable row level security;

-- lotteries: everyone can READ; only a logged-in admin can write.
drop policy if exists "lotteries_public_read" on public.lotteries;
create policy "lotteries_public_read" on public.lotteries for select using (true);

drop policy if exists "lotteries_admin_write" on public.lotteries;
create policy "lotteries_admin_write" on public.lotteries
  for all to authenticated using (true) with check (true);

-- lottery_tickets: NO anon access (contains buyer name/email). Admin may read;
-- inserts/updates happen via the PHP endpoints using the service_role key.
drop policy if exists "lottery_tickets_admin_read" on public.lottery_tickets;
create policy "lottery_tickets_admin_read" on public.lottery_tickets
  for select to authenticated using (true);

-- lottery_donations: NO anon access (donor name/email). Admin may read; the
-- public donor wall/progress come only via /api/lottery/status.php (service key).
drop policy if exists "lottery_donations_admin_read" on public.lottery_donations;
create policy "lottery_donations_admin_read" on public.lottery_donations
  for select to authenticated using (true);
```

**Already ran an earlier version?** Add the newer columns/table:

```sql
alter table public.lotteries add column if not exists prizes jsonb;
alter table public.lotteries add column if not exists blocked_numbers int[];
alter table public.lotteries add column if not exists type text not null default 'raffle';  -- raffle | fundraiser
alter table public.lotteries add column if not exists goal_cents int;

create table if not exists public.lottery_donations (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  lottery_id        uuid not null references public.lotteries(id) on delete cascade,
  amount_cents      int  not null,
  donor_name        text,
  anonymous         boolean not null default false,
  donor_email       text,
  mollie_payment_id text,
  status            text not null default 'pending'
);
create index if not exists lottery_donations_lottery_idx on public.lottery_donations (lottery_id, status);
alter table public.lottery_donations enable row level security;
drop policy if exists "lottery_donations_admin_read" on public.lottery_donations;
create policy "lottery_donations_admin_read" on public.lottery_donations
  for select to authenticated using (true);
```

After running it: open **beheer → Acties** (top nav). Create either a **Loterij** (raffle, with numbers +
prizes) or an **Inzameling** (fundraiser, with a goal) and set its status to **Live** — the bottom toast
then appears across the site with the matching flow (number picker or donation).

