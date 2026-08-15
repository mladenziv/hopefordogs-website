// Local runner: post "ready" dog listings to baasjegezocht.nl + petrescue.be.
// Runs on your Mac (never on the server). See README.md.
//
//   node post.js --login                 one-time: log in per site, save session
//   node post.js --dry-run --headed      fill forms, no submit, screenshot each
//   node post.js                         post the queued (ready + ⏳) listings
//   node post.js --platform=petrescue    limit to one site
//   node post.js --ids=<uuid,uuid>       post specific listing rows (ignores queue)
//   node post.js --dog=<slug>            post a specific dog's listings
//   node post.js --all-ready             post every ready row (not just queued)
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { loadEnv } from './lib/env.js';
import { makeDb } from './lib/supabase.js';
import { downloadPhotos } from './lib/photos.js';
import { validate } from '../mapping.js';
import * as baasjegezocht from './playbooks/baasjegezocht.js';
import * as petrescue from './playbooks/petrescue.js';

const PLAYBOOKS = { baasjegezocht, petrescue };
// Sites the runner acts on by default. petrescue is kept above (working, just
// parked) — add 'petrescue' here to re-enable it. Override per run with --platform=.
const ACTIVE_PLATFORMS = ['baasjegezocht'];
const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(readFileSync(resolve(__dirname, '..', 'config.json'), 'utf8'));
const PROFILE_DIR = resolve(__dirname, '.profile');
const DRY_DIR = resolve(__dirname, '.dryrun');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (k) => { const a = argv.find((x) => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : null; };
const opts = {
  login: has('--login'),
  dryRun: has('--dry-run'),
  headed: has('--headed'),
  allReady: has('--all-ready'),
  platform: val('--platform'),
  ids: (val('--ids') || '').split(',').map((s) => s.trim()).filter(Boolean),
  dog: val('--dog')
};
const defaultMode = !opts.allReady && !opts.ids.length && !opts.dog;

function prompt(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(q, (a) => { rl.close(); res(a.trim()); }));
}
const profileDir = (p) => resolve(PROFILE_DIR, p);

// One persistent Chrome profile per platform under .profile/<platform>. Your login
// survives between runs (no separate save step), and the whole run happens in a
// SINGLE window that stays open.
async function openContext(platform, headless) {
  mkdirSync(profileDir(platform), { recursive: true });
  return chromium.launchPersistentContext(profileDir(platform), { headless, viewport: null });
}

async function doLogin(platforms) {
  for (const p of platforms) {
    const url = CONFIG.platforms[p].login_url || CONFIG.platforms[p].new_listing_url;
    const ctx = await openContext(p, false);
    const page = ctx.pages()[0] || (await ctx.newPage());
    console.log(`\n[${p}] Opent ${url} — log in dit venster in.`);
    await page.goto(url).catch(() => {});
    await prompt(`[${p}] Druk hier op Enter zodra je bent ingelogd (de sessie blijft in het profiel bewaard)… `);
    await ctx.close();
    console.log(`[${p}] ✓ ingelogd; profiel bewaard.`);
  }
}

async function main() {
  const env = loadEnv();
  const platforms = opts.platform ? [opts.platform] : ACTIVE_PLATFORMS;

  if (opts.login) { await doLogin(platforms); return; }

  if (!env.SUPABASE_SERVICE_KEY) {
    console.error('Geen SUPABASE_SERVICE_KEY gevonden (zet die in listings/runner/.env, of draai binnen de repo met api/social-media/config.php aanwezig).');
    process.exit(1);
  }
  const db = makeDb(env);
  let rows = await db.queue({ platform: opts.platform, ids: opts.ids, dogSlug: opts.dog, allReady: opts.allReady });
  rows = rows.filter((r) => PLAYBOOKS[r.platform] && platforms.includes(r.platform));
  if (!rows.length) { console.log('Niets te plaatsen. Zet in beheer een hond op "klaar" en tik hem in de wachtrij.'); return; }

  console.log(`${opts.dryRun ? '[DRY-RUN] ' : ''}${rows.length} listing(s): ` +
    rows.map((r) => `${(r.dogs && r.dogs.naam) || r.dog_id}/${r.platform}`).join(', '));

  // group per platform → one persistent window per platform for the whole batch
  const groups = {};
  for (const r of rows) (groups[r.platform] = groups[r.platform] || []).push(r);

  for (const platform of Object.keys(groups)) {
    const pb = PLAYBOOKS[platform];
    const autoSubmit = CONFIG.platforms[platform].auto_submit === true;
    const needHumanFinish = !autoSubmit && !opts.dryRun;
    const headless = !(opts.headed || opts.dryRun || needHumanFinish); // fill runs are always headed
    const ctx = await openContext(platform, headless);
    const page = ctx.pages()[0] || (await ctx.newPage());
    let first = true;

    for (const row of groups[platform]) {
      const name = (row.dogs && row.dogs.naam) || row.dog_id;
      const tag = `[${platform}] ${name}`;
      const log = (m) => console.log(m);
      try {
        const v = validate(row.payload || { fields: [], photos: [] }, CONFIG, platform);
        if (v.errors.length) { console.log(`${tag}: geblokkeerd door controle → ${v.errors.join('; ')} — overslaan`); continue; }
        if (row.external_url) { console.log(`${tag}: heeft al een listing-URL — overslaan`); continue; }

        console.log(`\n${tag}: formulier openen…`);
        await page.goto(CONFIG.platforms[platform].new_listing_url, { waitUntil: 'domcontentloaded' }).catch(() => {});
        if (first) {
          first = false;
          const P = platform.toUpperCase();
          const em = env.raw[P + '_EMAIL'], pw = env.raw[P + '_PASSWORD'];
          if (em && pw && typeof pb.login === 'function') {
            await pb.login(page, { email: em, password: pw }, log);          // try auto-login from .env
            await page.goto(CONFIG.platforms[platform].new_listing_url, { waitUntil: 'domcontentloaded' }).catch(() => {});
          }
          // If auto-login failed (or no creds), we'll still be logged out → pause for manual login.
          const loggedOut = (typeof pb.isLoggedOut === 'function') ? await pb.isLoggedOut(page) : !(em && pw);
          if (loggedOut) {
            await prompt(`\n${tag}: je bent (nog) niet ingelogd.\n  → Log nu in DIT venster in en druk daarna op Enter… `);
            await page.goto(CONFIG.platforms[platform].new_listing_url, { waitUntil: 'domcontentloaded' }).catch(() => {});
          }
        }

        if (!opts.dryRun) {
          const claimed = await db.claim(row.id, defaultMode);
          if (!claimed) { console.log(`${tag}: niet claimbaar (al bezig/geplaatst/niet meer 'klaar') — overslaan`); continue; }
        }

        const values = Object.fromEntries((row.payload.fields || []).map((f) => [f.key, f.value]));
        const photoPaths = await downloadPhotos(row.payload.photos || [], log);
        await pb.fill(page, values, photoPaths, log);

        if (opts.dryRun) {
          mkdirSync(DRY_DIR, { recursive: true });
          const shot = resolve(DRY_DIR, `${platform}-${(row.dogs && row.dogs.slug) || row.dog_id}.png`);
          await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
          console.log(`${tag}: DRY-RUN — ingevuld, niet ingediend. Screenshot: ${shot}`);
          continue;
        }

        if (autoSubmit) {
          try {
            await page.getByRole('button', { name: /plaats|indien|verzend|opslaan|save|aanmaken|submit/i }).first().click();
            await page.waitForLoadState('networkidle').catch(() => {});
            const url = page.url();
            await db.finish(row.id, { status: 'posted', external_url: url, posted_at: new Date().toISOString(), queued: false, error: null });
            console.log(`${tag}: ✓ geplaatst → ${url}`);
          } catch (e) {
            await db.finish(row.id, { status: 'failed', error: String(e.message).slice(0, 500), queued: false });
            console.log(`${tag}: ✗ indienen faalde → ${e.message}`);
          }
          continue;
        }

        console.log(`${tag}: ✓ ingevuld. Controleer het formulier${platform === 'baasjegezocht' ? ' (baasjegezocht is betaald — reken af)' : ''} en dien het handmatig in.`);
        const ans = await prompt(`${tag}: plak de listing-URL en Enter · leeg = toch als geplaatst · 'x' = terug naar klaar · 's' = overslaan: `);
        if (ans === 'x') { await db.finish(row.id, { status: 'ready' }); console.log(`${tag}: teruggezet op 'klaar'.`); }
        else if (ans === 's') { await db.finish(row.id, { status: 'skipped', queued: false }); console.log(`${tag}: overgeslagen.`); }
        else { await db.finish(row.id, { status: 'posted', external_url: ans || null, posted_at: new Date().toISOString(), queued: false, error: null }); console.log(`${tag}: ✓ gemarkeerd als geplaatst${ans ? ' → ' + ans : ''}.`); }
      } catch (e) { console.log(`${tag}: fout → ${e.message}`); }
    }

    if (opts.dryRun) await prompt(`\n[${platform}] DRY-RUN klaar — bekijk het venster. Druk op Enter om te sluiten… `);
    await ctx.close();
  }
  console.log('\nKlaar.');
}

main().catch((e) => { console.error(e); process.exit(1); });
