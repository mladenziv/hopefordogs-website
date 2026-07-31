# Staging site — test before going live

A second, private copy of the site at **`https://staging.hopefordogseurope.com`**.
Changes are pushed to the **`staging`** git branch → appear on the staging URL. When
approved, they're merged into **`main`** → go live. The staging branch deploys to a
separate folder (`staging_html`), so it can never touch the live `public_html`.

Home directory on the server: `/home/d0sjxpncsiuj`
Live site folder: `public_html` · Staging folder: `staging_html`
GitHub repo: `https://github.com/mladenziv/hopefordogs-website.git`

---

## One-time setup

### Easiest: hand GoDaddy support this
> "I want a **staging** copy of my website on the same hosting. Please:
> 1. Add a DNS **A record**: name `staging`, value `92.205.249.44`.
> 2. Create the subdomain **staging.hopefordogseurope.com** with document root **/home/d0sjxpncsiuj/staging_html**.
> 3. Set up a **second Git Version Control deployment** cloning `https://github.com/mladenziv/hopefordogs-website.git`, checked out to the **`staging`** branch, deploying via its `.cpanel.yml` (which targets that folder).
> 4. **Password-protect** the `staging_html` folder (Directory Privacy).
> 5. Issue **SSL** for staging.hopefordogseurope.com.
> Leave my live site (public_html) and email records unchanged."

### Or do it yourself (4 steps)
1. **DNS** — GoDaddy → Domains → hopefordogseurope.com → DNS → **Add**:
   Type `A`, Name `staging`, Value `92.205.249.44`. Save. (Mirrors the existing `www`/`mail`/`admin` records.)
2. **Subdomain** — cPanel → **Domains** → *Create a New Domain* →
   `staging.hopefordogseurope.com`, Document Root **`staging_html`**. Create.
3. **Git deployment** — cPanel → **Git Version Control** → **Create**:
   - Clone URL: `https://github.com/mladenziv/hopefordogs-website.git`
   - Repository Path: `staging-repo` (any name)
   - After it clones, open **Manage** → **Check out** the **`staging`** branch → **Deploy HEAD Commit**.
     (This runs the staging `.cpanel.yml`, copying files into `staging_html`.)
4. **Keep it private** — cPanel → **Directory Privacy** → open `staging_html` → tick
   "Password protect this directory", add a username + password. (Keeps it off Google and
   invisible to the public.) SSL is usually auto-issued (cPanel AutoSSL) within a bit; if you
   get a certificate warning, run **SSL/TLS Status → Run AutoSSL** or wait.

---

## The everyday workflow (once set up)

1. Changes are committed to the **`staging`** branch (Claude does this).
2. In cPanel → Git Version Control → the **Staging** repo → **Update from Remote** (pull),
   then **Deploy HEAD Commit**.
3. Review at **`https://staging.hopefordogseurope.com`** (enter the password).
4. Happy? Promote to live: Claude merges `staging` → `main` and pushes; then in the **live**
   Git repo click **Deploy HEAD Commit**. Live updates.

Notes
- The two branches share everything except `.cpanel.yml` (which points each to its own folder).
  Promotion keeps `main`'s version, so the live target never changes.
- Content (dogs, blog, experiences) doesn't need staging — do it in **beheer**; it has a
  **Concept/draft** option so it isn't public until you publish.
- Server-only things (Mollie config, etc.) live in `staging_html/api/...` independently — if you
  want to test live payments on staging, copy `api/mollie/config.php` into the staging folder too
  (use the **test** Mollie key there so staging never charges real cards).
