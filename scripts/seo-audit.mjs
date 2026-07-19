#!/usr/bin/env node
// Lightweight standalone SEO audit for the static site.
// Usage:  node scripts/seo-audit.mjs
// No dependencies — parses the public .html files with regex and reports
// errors (should block launch) and warnings. Keeps it small/maintainable per
// the shelter-seo skill (no heavy black-box SEO plugin).

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Public routes to audit (exclude admin, internal, thank-you/utility pages).
const EXCLUDE = new Set([
  'translate.html', 'typography.html', 'bedankt.html', 'betaling-mislukt.html',
  'post.html', 'hond.html', 'ervaring.html', // CSR detail pages: meta set via JS
]);

const pages = readdirSync(root)
  .filter((f) => f.endsWith('.html') && !EXCLUDE.has(f))
  .sort();

const errors = [];
const warnings = [];
const titles = new Map();
const descs = new Map();

function pick(re, html) { const m = html.match(re); return m ? m[1].trim() : null; }

for (const file of pages) {
  const html = readFileSync(join(root, file), 'utf8');
  const E = (msg) => errors.push(`${file}: ${msg}`);
  const W = (msg) => warnings.push(`${file}: ${msg}`);

  // lang
  if (!/<html[^>]*\blang=/.test(html)) E('missing <html lang="...">');

  // title
  const title = pick(/<title>([^<]*)<\/title>/i, html);
  if (!title) E('missing <title>');
  else {
    if (titles.has(title)) W(`duplicate <title> (also ${titles.get(title)})`);
    else titles.set(title, file);
  }

  // meta description
  const desc = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, html);
  if (!desc) W('missing meta description');
  else {
    if (descs.has(desc)) W(`duplicate meta description (also ${descs.get(desc)})`);
    else descs.set(desc, file);
    if (desc.length > 165) W(`meta description long (${desc.length} chars)`);
  }

  // canonical
  const canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i, html);
  if (!canonical) E('missing canonical');
  else if (/localhost|127\.0\.0\.1|mytemp\.website|staging/.test(canonical)) E(`canonical points to non-production host: ${canonical}`);

  // noindex
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) E('has noindex robots meta');

  // single h1
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s === 0) E('no <h1>');
  else if (h1s > 1) W(`multiple <h1> (${h1s})`);

  // images without alt (static markup only)
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter((t) => !/\balt=/.test(t)).length;
  if (noAlt) W(`${noAlt} <img> without alt attribute`);

  // hreflang (informational — currently none; flagged as a known TODO)
  const hreflang = (html.match(/hreflang=/gi) || []).length;
  if (hreflang === 0) W('no hreflang tags (multilingual URLs not yet implemented)');

  // OG basics
  if (!/property=["']og:title["']/.test(html)) W('missing og:title');
  if (!/property=["']og:image["']/.test(html)) W('missing og:image');
}

console.log(`\nSEO audit — ${pages.length} public pages\n${'='.repeat(40)}`);
console.log(`\nERRORS (${errors.length}):`);
errors.forEach((e) => console.log('  ✗ ' + e));
if (!errors.length) console.log('  none');
console.log(`\nWARNINGS (${warnings.length}):`);
warnings.forEach((w) => console.log('  ! ' + w));
if (!warnings.length) console.log('  none');
console.log('');

process.exit(errors.length ? 1 : 0);
