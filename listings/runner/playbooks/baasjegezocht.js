// baasjegezocht.nl playbook — built from a live `playwright codegen` recording.
//
// Real structure:
//  • cookie banner: link "Alle cookies toestaan"
//  • to open the form: link "Plaats uw huisdier"
//  • text fields: work by accessible name  → getByRole('textbox', { name })
//  • dropdowns: NATIVE <select> by id, chosen by option VALUE (e.g. #soortdd = 'honden')
//  • photos: click "Upload bestand" inside #adverteren_form → file chooser
import { uploadViaChooser } from '../lib/fill.js';

export const meta = { key: 'baasjegezocht', label: 'Baasje Gezocht' };

// Text inputs / textareas — [ payloadKey, element id ] (ids from the live form dump).
const TEXTS = [
  ['naam', 'roepnaam'],
  ['ras', 'ras'],
  ['leeftijd_jaar', 'jaarbx'],
  ['leeftijd_maanden', 'maandbx'],
  ['kleur', 'kleur'],
  ['karakteromschrijving', 'karakteromschrijving_html'],
  ['hoelang_alleen', 'home_alone'],
  ['reden_herplaatsing', 'reden'],
  ['extra_info', 'overige_informatie_over_het_dier_html'],
  ['prijs', 'Prijs'],
  ['youtube', 'youtubeid'],
  ['verblijfplaats', 'verblijfplaats_dier'],
  ['email', 'email_contactpersoon'],
  ['telefoon', 'telefoon_contactpersoon'],
  ['bij_kinderen_toelichting', 'kinderen_toelichting'],
  ['bij_andere_dieren_toelichting', 'dieren_toelichting']
];

// Native <select> elements — { id, field, values: { ourValue: siteOptionValue } }.
// Confirmed from codegen: Diersoort = #soortdd (value 'honden').
// The rest are filled in from the browser console dump (select ids + option values).
// If a value isn't in `values`, we fall back to selecting by the value string as-is.
const SELECTS = [
  { id: 'aangeboden', field: 'aangeboden_gezocht', values: { Aangeboden: '1', Gezocht: '0' } },
  { id: 'soortdd', field: 'diersoort', values: { Hond: 'honden' } },
  { id: 'geslachtdd', field: 'geslacht', values: { Reu: 'Man', Teef: 'Vrouw' } },
  { id: 'grootedd', field: 'grootte', values: { Klein: 'Klein', Middel: 'Middel', Groot: 'Groot' } },
  { id: 'beharingdd', field: 'beharing', values: { Kaal: 'Kaal', Kort: 'Kort', Halflang: 'Halflang', Lang: 'Lang' } },
  { id: 'stamboomdd', field: 'stamboom', values: { Ja: '1', Nee: '0', 'n.v.t.': '4' } },
  { id: 'paspoortdd', field: 'paspoort', values: { Ja: '1', Nee: '0' } },
  { id: 'gechiptdd', field: 'gechipt', values: { Ja: '1', Nee: '0' } },
  { id: 'geentdd', field: 'geent', values: { Ja: '1', Nee: '0' } },
  { id: 'asieldd', field: 'uit_asiel', values: { Ja: '1', Nee: '0' } },
  { id: 'toestemmingdd', field: 'toestemming_verplaatsing', values: { Ja: '1', Nee: '0' } },
  { id: 'sterildd', field: 'gesteriliseerd', values: { Ja: '1', Nee: '0' } },
  { id: 'ziekdd', field: 'lichamelijke_afwijking', values: { Ja: '1', Nee: '0' } },
  { id: 'meddd', field: 'medicijnen', values: { Ja: '1', Nee: '0' } },
  // baasjegezocht heeft geen "Onbekend" bij zindelijk → valt terug op N.v.t. (4)
  { id: 'zinddd', field: 'zindelijk', values: { Ja: '1', Nee: '0', Onbekend: '4' } },
  { id: 'gedraggg', field: 'gedragsproblemen', values: { Ja: '1', Nee: '0' } },
  { id: 'speciaaldd', field: 'speciaal_voer', values: { Ja: '1', Nee: '0' } },
  { id: 'kan_bij_kinderendd', field: 'bij_kinderen', values: { Ja: '1', Nee: '0', Onbekend: '3' } },
  { id: 'kan_bij_dierendd', field: 'bij_andere_dieren', values: { Ja: '1', Nee: '0', Onbekend: '3' } },
  { id: 'kan_in_de_autodd', field: 'kan_in_auto', values: { Ja: '1', Nee: '0', Onbekend: '3' } },
  { id: 'kan_in_huisdd', field: 'mag_in_huis', values: { Ja: '1', Nee: '0' } },
  { id: 'kan_buitendd', field: 'mag_naar_buiten', values: { Ja: '1', Nee: '0' } }
];

async function dismissCookies(page, log) {
  for (const mk of [
    () => page.getByRole('button', { name: /alle cookies toestaan|accepteer|akkoord/i }),
    () => page.getByRole('link', { name: /alle cookies toestaan/i }),
    () => page.getByText(/alle cookies toestaan/i)
  ]) {
    try { const b = mk(); if ((await b.count()) && (await b.first().isVisible())) { await b.first().click(); log('  ✓ cookies geaccepteerd'); return; } } catch (e) {}
  }
}

// True when a login form/link is on screen — i.e. we are NOT logged in.
export async function isLoggedOut(page) {
  try {
    const u = page.locator('#user');
    if ((await u.count()) && (await u.first().isVisible())) return true;
    const link = page.getByText(/log dan hier in/i);
    if ((await link.count()) && (await link.first().isVisible())) return true;
  } catch (e) {}
  return false;
}

async function startNewAd(page, log) {
  try {
    const l = page.getByRole('link', { name: /plaats uw huisdier/i });
    if ((await l.count()) && (await l.first().isVisible())) {
      await l.first().click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      log('  ✓ formulier geopend (Plaats uw huisdier)');
    }
  } catch (e) {}
}

// Optional auto-login (from BAASJEGEZOCHT_EMAIL/_PASSWORD in .env). No-op if already
// logged in (the "log dan hier in!" link / #user field won't be present).
export async function login(page, { email, password }, log) {
  await dismissCookies(page, log);
  // Open the login form via the "log dan hier in!" link if it's shown.
  try {
    const link = page.getByText(/log dan hier in/i).first();
    if ((await link.count()) && (await link.isVisible())) {
      await link.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await dismissCookies(page, log);
    }
  } catch (e) {}
  // Fill + submit the login form if present (wait a bit for it to render).
  try {
    const user = page.locator('#user');
    await user.waitFor({ state: 'visible', timeout: 6000 });
    await user.fill(email);
    await page.locator('#pass').fill(password);
    await page.getByRole('button', { name: /inloggen/i }).click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    log('  ✓ automatisch ingelogd');
  } catch (e) {
    log('  (geen loginformulier gevonden — waarschijnlijk al ingelogd)');
  }
}

export async function fill(page, values, photoPaths, log) {
  await dismissCookies(page, log);
  await startNewAd(page, log);

  // Text fields by unique id (avoids the search boxes that reuse the same names).
  for (const [key, id] of TEXTS) {
    const v = values[key];
    if (v == null || v === '') continue;
    try { await page.locator('#' + id).fill(String(v)); log(`  ✓ ${key} (#${id})`); }
    catch (e) { log(`  ! ${key} (#${id}) niet gelukt: ${e.message}`); }
  }

  for (const s of SELECTS) {
    const our = values[s.field];
    if (our == null || our === '') continue;
    const siteVal = (s.values && s.values[our] != null) ? s.values[our] : our;
    try { await page.locator('#' + s.id).selectOption(siteVal); log(`  ✓ ${s.field} = ${our} (#${s.id}=${siteVal})`); }
    catch (e) { log(`  ! #${s.id} (${s.field}=${our}) niet gelukt: ${e.message}`); }
  }

  await uploadViaChooser(page, '#adverteren_form', 'Upload bestand', photoPaths, log);
}
