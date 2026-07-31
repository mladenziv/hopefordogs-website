# Lock down the `contact_messages` inbox

Run this **once** in the Supabase dashboard → **SQL editor** (project `gdmntnrsgfntcgqmbmtj`).

`contact_messages` holds people's names, emails, phone numbers and messages. This makes the rules
explicit and safe:

- **Public website (anon):** may **submit** a message and nothing else — cannot read, edit, or delete.
- **Beheer (logged-in):** full access (read/assign/delete), as today.
- **The PHP endpoints** (`/api/contact/`) use the service key, which bypasses these rules, so they keep
  working unchanged.

> Deploy the current site first (all four inquiry forms now post through `/api/contact/`), then run this.

```sql
-- Make sure row-level security is on.
alter table public.contact_messages enable row level security;

-- Clean slate: drop any existing policies on the table (names vary, so do it dynamically).
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'contact_messages'
  loop
    execute format('drop policy %I on public.contact_messages', p.policyname);
  end loop;
end $$;

-- Public/website: may INSERT a new message only.
create policy "anon can submit a message"
  on public.contact_messages
  for insert to anon
  with check (true);

-- Beheer (logged-in staff): full access.
create policy "authenticated full access"
  on public.contact_messages
  for all to authenticated
  using (true)
  with check (true);
```

## After running
- Website contact forms + dog inquiries: still work (they go through `/api/contact/`, service key).
- Beheer Berichten: still reads/assigns/deletes normally (logged-in = authenticated).
- The anonymous public key can no longer read anyone's details, edit, or wipe the inbox.
