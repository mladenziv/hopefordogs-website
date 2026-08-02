# Administratie (bookkeeping) — database setup

Run the SQL below **once** in the Supabase dashboard → **SQL editor** (project `gdmntnrsgfntcgqmbmtj`).
The site's anon key is read-only, so these migrations cannot be applied from the app. They are additive
and idempotent (safe to re-run).

The admin page is **`beheer/administratie.html`** (standalone, like `loterijen.html`), reachable only at
`/beheer/administratie.html` (it's intentionally not linked from the beheer nav). It reads/writes these
tables with your logged-in beheer session.

## What this stores

- `transactions` — the ledger, one row per money movement or receipt. **Admin-only** (RLS
  `to authenticated`, no anon policy), so the public site can never read the books.
- `admin_instellingen` — the ING opening balance per boekjaar, used only for the year-PDF reconciliation.
- `adopters` — the saved list that splits income into **adoption** vs **donation** (filled by
  transport-list imports + manual entries).

**Model:** the EUR bank overview (`rekening = 'bank_nl'`) is the official ledger and drives the year
result. The Serbian receipts (`rekening = 'kas_srb'`, amounts in RSD) are kept as **proof + a spending
breakdown** and are **not** summed into that result — the withdrawals/transfers to Serbia already funded
them, so counting both would double-count.

## 1. Core schema + private receipts bucket

```sql
-- transactions ledger
create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  created_by       uuid default auth.uid(),
  datum            date,                              -- nullable: one receipt's date is illegible
  rekening         text    not null default 'bank_nl',  -- bank_nl | kas_srb
  richting         text    not null,                    -- in | uit
  categorie        text    not null,
  valuta           text    not null default 'EUR',      -- EUR | RSD
  bedrag_cents     integer not null,                    -- amount in the ORIGINAL currency (positive)
  bedrag_eur_cents integer not null,                    -- EUR equivalent (= bedrag_cents when EUR)
  koers            numeric,                             -- RSD per EUR (e.g. 117.42); null for EUR
  btw_cents        integer,                             -- VAT, informational (RSD receipts)
  omschrijving     text,
  tegenpartij      text,
  factuurnr        text,
  referentie       text,
  bron             text    default 'handmatig',         -- handmatig | csv | transport | scan | mollie
  dog_id           uuid,
  bon_pad          text,                                -- storage path of the receipt (private bucket)
  bon_bestand      text,                                -- original filename (bulk-match on import)
  opmerking        text,
  meetellen        boolean not null default true        -- false = excluded from totals
);
create index if not exists transactions_datum_idx     on public.transactions (datum);
create index if not exists transactions_rekening_idx   on public.transactions (rekening);
create index if not exists transactions_categorie_idx  on public.transactions (categorie);
create index if not exists transactions_richting_idx   on public.transactions (richting);

-- per-year opening balance (for the PDF reconciliation line)
create table if not exists public.admin_instellingen (
  jaar                 int primary key,
  beginsaldo_eur_cents integer not null default 0,
  updated_at           timestamptz not null default now()
);

-- admin-only RLS (no anon)
alter table public.transactions       enable row level security;
alter table public.admin_instellingen enable row level security;
drop policy if exists "transactions_admin_all" on public.transactions;
create policy "transactions_admin_all" on public.transactions
  for all to authenticated using (true) with check (true);
drop policy if exists "admin_instellingen_admin_all" on public.admin_instellingen;
create policy "admin_instellingen_admin_all" on public.admin_instellingen
  for all to authenticated using (true) with check (true);

-- private receipts bucket + storage policy (lets a logged-in admin upload/sign; anon has no access)
insert into storage.buckets (id, name, public)
  values ('administratie', 'administratie', false)
  on conflict (id) do nothing;
drop policy if exists "administratie_objects_admin_all" on storage.objects;
create policy "administratie_objects_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'administratie')
  with check (bucket_id = 'administratie');
```

> If your Supabase role can't `insert into storage.buckets` from the SQL editor, create the bucket
> manually: Storage → **New bucket** → name **`administratie`** → **"Public bucket" OFF** → create,
> then re-run the storage-policy statement.

## 2. Adopter list

```sql
create table if not exists public.adopters (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  created_by       uuid default auth.uid(),
  naam             text not null,
  bedrag_eur_cents integer,
  dog_id           uuid,
  dog_naam         text,
  bron             text default 'handmatig',   -- transport | handmatig
  note             text,
  matched          boolean not null default false
);
create index if not exists adopters_naam_idx on public.adopters (lower(naam));
alter table public.adopters enable row level security;
drop policy if exists "adopters_admin_all" on public.adopters;
create policy "adopters_admin_all" on public.adopters
  for all to authenticated using (true) with check (true);
```

## 3. Scanning (Claude vision) — API key

On the server, copy `api/ocr/config.example.php` to `api/ocr/config.php` and paste your Anthropic API
key (console.anthropic.com → Billing → add a small credit → API Keys). `config.php` is gitignored — set
it directly in cPanel, like the Mollie key. Without it, the **Scan bonnen** / **Scan bank** buttons
return a "not configured" error but the rest of the page works.

## Field reference (transactions)

| column | meaning |
|---|---|
| `rekening` | `bank_nl` (EUR ledger) or `kas_srb` (Serbian RSD receipts) |
| `richting` | `in` (baten) or `uit` (lasten) |
| `categorie` | bank_nl·in: `donatie`, `adoptie_transport`, `overig` · bank_nl·uit: `opname`, `overboeking`, `bankkosten`, `overig` · kas_srb·uit: `dierenarts`, `diervoeding`, `dierbenodigdheden`, `bouwmaterialen`, `gemengd`, `overig` |
| `valuta` / `koers` | `EUR` or `RSD`; `koers` = RSD per EUR (e.g. 117.42) for RSD rows |
| `bedrag_cents` / `bedrag_eur_cents` | original-currency amount + its EUR equivalent (both positive, in cents) |
| `bon_pad` / `bon_bestand` | receipt object path (private bucket) + original filename |
| `bron` | how the row got in: `csv` / `handmatig` / `transport` / `scan` |
| `meetellen` | `false` excludes the row from all totals |

## After setup

Open `beheer/administratie.html` while logged into beheer, then:
1. **Scan bonnen** → upload receipt photos; each is read (amount/date/vendor/category), shown in a
   review table, and saved with the photo attached.
2. **Bankafschrift** → upload the ING statement **PDF**; every transaction is read (date, tegenpartij,
   omschrijving, bedrag). Income auto-splits **adoptie/donatie** (via the adopter list); money sent to
   Serbia is recognised as **opname** (Raiffeisen/Serbian banks) or **overboeking** (Zivanovic) and also
   booked as income on the Serbian account.
3. **Transportlijst** (Word `.docx` or CSV/Excel, several at once) + **Adoptanten** → build the adopter
   list used for that split.
4. Filter with the **Van/Tot** dates; **Exporteer jaaroverzicht** for the Belastingdienst PDF.

## Reset test data

The page has a **Testdata wissen** button (type `WISSEN`) that deletes all transactions + adopters and
their stored receipts. In SQL instead:

```sql
delete from public.transactions;
delete from public.adopters;
```

(Receipt files in the `administratie` bucket aren't removed by the SQL — clear the `bon/` folder in
Storage for a fully clean slate; the in-app button does remove them.)
