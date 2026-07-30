# Multilingual translation columns — database setup

Run this **once** in the Supabase dashboard → **SQL editor** (project `gdmntnrsgfntcgqmbmtj`).
The site's anon key is read-only, so this migration cannot be applied from the app.

## What this does

Adds German (`_de`) and English (`_en`) text columns alongside the existing Dutch fields on the three
content tables that were still Dutch-only:

- `dogs` — `beschrijving`, `ras`, `leeftijd`
- `posts` (blog) — `title`, `excerpt`, `content`
- `stories` (adopter experiences) — `description`, `full_story`

The `faqs` and `ba_stories` tables already have their `_de`/`_en` columns and are unchanged.

All new columns are **nullable**. The public pages render `field_<lang> || field_nl`, so any row whose
translation is still `null` transparently falls back to Dutch — nothing ever goes blank. New/edited rows
auto-translate on save in beheer; existing rows are filled once by `beheer/vertalen.html`.

No RLS change is needed: these columns live on tables that are already readable/writable exactly as before.

```sql
-- ---- dogs ------------------------------------------------------------------
alter table public.dogs add column if not exists beschrijving_de text;
alter table public.dogs add column if not exists beschrijving_en text;
alter table public.dogs add column if not exists ras_de          text;
alter table public.dogs add column if not exists ras_en          text;
alter table public.dogs add column if not exists leeftijd_de     text;
alter table public.dogs add column if not exists leeftijd_en     text;

-- ---- posts (blog) ----------------------------------------------------------
alter table public.posts add column if not exists title_de   text;
alter table public.posts add column if not exists title_en   text;
alter table public.posts add column if not exists excerpt_de text;
alter table public.posts add column if not exists excerpt_en text;
alter table public.posts add column if not exists content_de text;
alter table public.posts add column if not exists content_en text;

-- ---- stories (adopter experiences) -----------------------------------------
alter table public.stories add column if not exists description_de text;
alter table public.stories add column if not exists description_en text;
alter table public.stories add column if not exists full_story_de  text;
alter table public.stories add column if not exists full_story_en  text;
```

## After running

1. Public render already falls back to Dutch, so the site keeps working immediately (all `_de`/`_en`
   still null).
2. In beheer, editing/adding a dog, post, or story now populates its `_de`/`_en` fields automatically.
3. Open `beheer/vertalen.html` once to backfill every existing row (throttled, idempotent — safe to
   re-run; it skips rows already translated).
