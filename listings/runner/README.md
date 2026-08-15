# Listings runner (Phase 2)

Posts **ready** dog listings from Supabase to **baasjegezocht.nl** and **petrescue.be**
by driving a real browser with Playwright. **Runs on your Mac only** — never on the
server (GoDaddy can't run Node/Playwright). It reuses the same `../config.json` and
`../mapping.js` as the beheer review page, so what you confirmed there is exactly
what gets filled in.

## One-time setup
```bash
cd listings/runner
npm install
npx playwright install chromium
```
- The Supabase **service key** is read automatically from `../../api/social-media/config.php`
  when you run inside the repo. To run elsewhere, copy `.env.example` → `.env` and fill it in.
- **Login happens inside the run.** The runner uses a **persistent Chrome profile** under
  `.profile/` (gitignored). The first run opens one window and pauses — if you see a login
  page, log in **in that same window**, press Enter, and it fills the form. Your login is
  remembered for next time, so later runs skip straight to filling. (`npm run login` is an
  optional way to log in ahead of time.)

## Everyday use
Currently scoped to **baasjegezocht** only (see `ACTIVE_PLATFORMS` in `post.js`).
```bash
npm run dry                      # ONE window: fill the queued listing(s), NO submit, screenshot (.dryrun/), stays open
npm run post                     # fill → you review/pay/submit → paste the URL back
node post.js --dog=<slug>        # a specific dog (ignores the queue)
node post.js --ids=<uuid,uuid>   # specific listing rows
node post.js --all-ready         # every "ready" row, not just the queued ones
```

### What a run does per listing
1. **Atomically claims** it (`ready` → `posting`) so a crash/retry can never double-post.
2. Downloads the listing's photos and fills the form (fields + photos) from the confirmed payload.
3. **Default:** leaves the browser open for you to review, **pay if needed, and submit**, then
   paste the resulting listing URL back in the terminal → the row is marked `posted`.
   (`'x'` = put it back to `klaar`, `'s'` = skip.)
4. Set `"auto_submit": true` for a platform in `../config.json` to click submit automatically
   instead (petrescue is free; **baasjegezocht is paid per listing**, so leave it `false` and pay by hand).

Already-`posted` rows are skipped; re-listing after the 90-day expiry is the explicit
**Opnieuw plaatsen** action in beheer.

## Adjusting the playbooks
The field labels in `playbooks/*.js` come from the live form screenshots. If a headed
`npm run dry` logs `? veld niet gevonden: "X"` or a select won't set, tweak that line, or
capture the exact selector with:
```bash
npx playwright codegen https://petrescue.be/pet/create
```
Each field is logged (`✓` / `?` / `!`) so you can see exactly what matched.
