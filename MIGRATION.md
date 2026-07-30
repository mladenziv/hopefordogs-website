# Domain migration runbook — Squarespace → new GoDaddy site

**Goal:** move `hopefordogseurope.com` from the **old Squarespace site** to the **new site**
(currently live on the GoDaddy hosting temp URL `gmp.828.mytemp.website`), with **no email downtime**
and payments/SSL intact.

Both the **domain** and the **new hosting** are at GoDaddy. You are *not* transferring the domain
anywhere — you're just (1) telling Squarespace to let go of it and (2) pointing its DNS at the GoDaddy
hosting that already serves the new site.

> ⚠️ **The three things that can actually hurt you** — read before touching anything:
> 1. **Email.** If `info@hopefordogseurope.com` (or any address on the domain) receives mail, its **MX**
>    and email **TXT records (SPF/DKIM/DMARC)** must be preserved. Changing the website DNS does **not**
>    have to touch email — but only if you leave those records alone. Deleting them = email stops.
> 2. **Downtime.** Lower the DNS TTL a day ahead (Phase 0) so the switch propagates in minutes, and do
>    the cutover in a quiet window.
> 3. **SSL.** The new domain needs its own SSL certificate issued *after* DNS points at GoDaddy, or the
>    site shows a security warning. Don't force HTTPS until the cert is active.

---

## Record your current settings first (fill this in — you'll need it for rollback)

Open GoDaddy → your domain → **DNS / Manage DNS**, and write down exactly what's there now:

| Setting | Current value (before migration) |
|---|---|
| Nameservers (GoDaddy default vs. custom) | `__________` |
| `A` record `@` (root) | `__________` |
| `CNAME` `www` | `__________` |
| **MX** records (email!) | `__________` |
| `TXT` SPF (`v=spf1 …`) | `__________` |
| `TXT`/`CNAME` DKIM | `__________` |
| `TXT` DMARC (`_dmarc`) | `__________` |
| Any other records (verification, subdomains) | `__________` |

Also note:
- **New hosting server IP** (GoDaddy cPanel → right sidebar **"Shared IP Address"**, or the hosting
  dashboard): `__________`
- **How email is hosted today** (GoDaddy email / Google Workspace / Microsoft / none): `__________`

📸 Screenshot the whole DNS page. This is your rollback safety net.

---

## Phase 0 — Prep (do this the day before)

- [ ] **Confirm the new site is fully working on the temp URL** `https://gmp.828.mytemp.website`:
      home, dogs list + a dog detail, blog, experiences, language switch (NL/DE/EN), contact form,
      donate page, and `beheer` login. Fix anything broken *before* the domain points here.
- [ ] **Run the two Supabase migrations** if not already done (SQL editor):
      `db/lottery-schema.md` and `db/translation-schema.md`. Then Beheer → **Vertalen → "Alles vertalen"**.
- [ ] **Confirm server configs exist on the hosting** (they're gitignored, so they don't deploy from
      GitHub — they must already be on the server): `api/mollie/config.php` (with the **LIVE** Mollie key,
      not test) and `api/social-media/config.php`.
- [ ] **Export the old Squarespace URL list.** In Squarespace, list your current page URLs (e.g.
      `/about`, `/adopt`, `/donate`, blog post slugs). You'll need these for 301 redirects (Phase 5) if
      the new paths differ. New site paths are: `/` , `/honden.html`, `/over-ons.html`, `/adoptie.html`,
      `/ervaringen.html`, `/nieuws.html`, `/contact.html`, `/doneer.html`.
- [ ] **Lower the DNS TTL** on the `A`/`CNAME` records at GoDaddy to **600 seconds** (10 min). Save.
      Leave it a day so the low TTL propagates before the real switch.
- [ ] Pick a **low-traffic window** for the cutover.

---

## Phase 1 — Unlink the domain from Squarespace

The domain lives at GoDaddy, so nothing is "transferred" — you're releasing Squarespace's claim on it.

- [ ] In **Squarespace → Settings → Domains** (or Home menu → Settings → Domains), open
      `hopefordogseurope.com` and **disconnect / remove** it from the site. This tells Squarespace to
      stop serving that domain.
- [ ] **Do NOT cancel the Squarespace subscription yet.** Keep it until the new site is verified live
      (Phase 4) so you can roll back and so you don't lose anything you haven't exported.
- [ ] If the domain's **nameservers point to Squarespace** (check in Phase 0), change them back to
      **GoDaddy's default nameservers** so you manage DNS at GoDaddy again. (If they were already GoDaddy
      nameservers, skip this.)

---

## Phase 2 — Point the domain at the new GoDaddy hosting

Two ways. **Option A is cleanest** because domain + hosting are both at GoDaddy.

### Option A — Connect the domain to the hosting (recommended)
- [ ] GoDaddy → **Web Hosting / cPanel** dashboard for the account currently on `gmp.828.mytemp.website`.
- [ ] Use GoDaddy's **"Add domain" / "Change primary domain"** flow to set the account's primary domain
      to `hopefordogseurope.com`. GoDaddy configures the DNS `A`/`CNAME` automatically to point at this
      hosting.
- [ ] If you can't find that option, **GoDaddy support can switch the hosting account's primary domain**
      from the temp domain to `hopefordogseurope.com` in a few minutes — ask them to do exactly that and
      to **leave the MX/email records untouched**.

### Option B — Point DNS manually (if you prefer to control records)
In GoDaddy → **Manage DNS** for `hopefordogseurope.com`:
- [ ] **`A` record** — Host `@`, Value = **[new hosting server IP from Phase 0]**, TTL 600.
- [ ] **`CNAME`** — Host `www`, Value `@` (or the hosting's server hostname). TTL 600.
- [ ] **Delete the old Squarespace `A`/`CNAME` records** (the four Squarespace `A` IPs and the
      `www → ext-cust.squarespace.com` CNAME, or whatever Phase 0 showed). Replace, don't duplicate.

### 🔒 Email records — leave alone (both options)
- [ ] **Do NOT delete or change the `MX` records or the email `TXT` records (SPF/DKIM/DMARC)** unless
      you are also moving email. Website records (`A`/`CNAME`) and mail records (`MX`/`TXT`) are
      independent.
- [ ] If email will now be **GoDaddy-hosted** on this domain, set GoDaddy's MX + an SPF TXT
      (`v=spf1 include:secureserver.net -all` or per GoDaddy's instructions) and add DKIM from the
      GoDaddy email panel. This matters for the **donation confirmation emails** (see
      `db/…` note / the memory item on deliverability) — those send from `info@hopefordogseurope.com`
      and need valid SPF/DKIM to reach inboxes instead of spam.

---

## Phase 3 — SSL + force HTTPS + canonical www

Do this **after** DNS has propagated to the GoDaddy hosting (check with
`https://dnschecker.org` for the `A` record, or just load the site).

- [ ] In cPanel → **SSL/TLS Status** (or **AutoSSL**), issue/confirm a certificate covering **both**
      `hopefordogseurope.com` **and** `www.hopefordogseurope.com`. Wait until it's active (green).
- [ ] Only then, add HTTPS + non-www→www redirects. Create/merge an **`.htaccess`** in the site root
      (the site's canonical is **www**, and 13 pages already declare `https://www.hopefordogseurope.com`
      canonicals):

```apache
# Force HTTPS and canonical www (add ABOVE any existing rewrite rules)
RewriteEngine On
# 1) non-www -> www
RewriteCond %{HTTP_HOST} ^hopefordogseurope\.com$ [NC]
RewriteRule ^(.*)$ https://www.hopefordogseurope.com/$1 [R=301,L]
# 2) http -> https
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://www.hopefordogseurope.com/$1 [R=301,L]
```

> The payment code (`siteBaseUrl()`) uses whatever host the request came in on, so forcing www+https
> keeps Mollie redirect/webhook URLs consistent. No code change needed.

---

## Phase 4 — Verify on the real domain (project-specific)

- [ ] `https://www.hopefordogseurope.com` loads the **new** site (not Squarespace, not the temp look).
- [ ] `http://…`, `hopefordogseurope.com` (no www) both **301 → `https://www.…`**.
- [ ] Padlock/SSL valid, no "mixed content" warnings.
- [ ] Nav, dog list + a dog detail page, blog list + an article, experiences, **language switch NL/DE/EN**.
- [ ] **Contact form** → submit a test → message arrives (beheer inbox + email).
- [ ] **Donate** → run a real **Mollie test-mode** donation end-to-end → returns to `/bedankt.html` →
      **confirmation email arrives** (check spam). If it's missing/spam, fix SPF/DKIM before promoting.
- [ ] **Lottery / Acties** (if a campaign is live) → number pick / donation → `/bedankt.html` → webhook
      marks it paid.
- [ ] **Beheer**: log in, edit+save a dog and a post, open **Vertalen**.
- [ ] Confirm the **Mollie dashboard** account/website URL points to the real domain and you're on the
      **live** API key.

---

## Phase 5 — SEO cutover

- [ ] **301 redirects** from old Squarespace URLs to the new equivalents, if the paths changed (add to
      `.htaccess`). Example:
      ```apache
      Redirect 301 /adopt        https://www.hopefordogseurope.com/honden.html
      Redirect 301 /donate       https://www.hopefordogseurope.com/doneer.html
      Redirect 301 /about        https://www.hopefordogseurope.com/over-ons.html
      ```
      (Map every important old URL; don't redirect everything to the homepage.)
- [ ] **Google Search Console:** add + verify **`www.hopefordogseurope.com`** (DNS TXT method), then
      submit `https://www.hopefordogseurope.com/sitemap.xml`.
- [ ] **Temp domain:** stop `gmp.828.mytemp.website` from being indexed (it's duplicate content). Keep
      it noindexed / don't share it publicly.
- [ ] Update the **Facebook/Instagram/TikTok** profile links and any directory listings that point at
      the old Squarespace site.
- [ ] (Optional, high value) apply for **ANBI** — don't display "ANBI" on the site until it's granted.

---

## Rollback (if something's wrong)

Because you kept the Squarespace subscription and the TTL is low:
1. In GoDaddy DNS, restore the **`A`/`CNAME`** records to the Squarespace values from your Phase 0
   screenshot (leave MX/TXT alone).
2. Reconnect the domain in Squarespace if you disconnected it.
3. Within ~10 min (TTL) the old site is back. Then diagnose and retry.

---

## After a stable week

- [ ] Raise the DNS TTL back to **3600** (1 hour).
- [ ] Cancel the **Squarespace** plan once you're certain nothing else depends on it (email, other
      subdomains, forms).
- [ ] Re-run Lighthouse / a quick crawl on the live domain; confirm no pages 404 and the sitemap is clean.

---

### Quick reference — this site's specifics
- Canonical host: **`www.hopefordogseurope.com`** (set the www redirect).
- Payment redirect/webhook URLs follow the live request host automatically (`siteBaseUrl()`), fallback
  `SITE_URL` in `api/mollie/config.php`.
- Server-only configs (must exist on the host, not in Git): `api/mollie/config.php`,
  `api/social-media/config.php`.
- Supabase migrations to run once: `db/lottery-schema.md`, `db/translation-schema.md`.
- Deploy model: push to GitHub `main` → GoDaddy auto-deploys. The domain switch does **not** change this.
