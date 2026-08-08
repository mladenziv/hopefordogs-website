// One-off, read-only: list the pages Google Search Console has impression data for,
// so we can spot legacy URLs that need redirects. Uses a service-account JWT.
// Usage: node scripts/gsc-pages.mjs /absolute/path/to/service-account.json
import fs from 'node:fs';
import crypto from 'node:crypto';

const keyPath = process.argv[2];
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(claim));
  const sig = crypto.createSign('RSA-SHA256').update(signingInput).sign(key.private_key);
  const jwt = signingInput + '.' + b64url(sig);
  const res = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('token error: ' + JSON.stringify(j));
  return j.access_token;
}

function ymd(d) { return d.toISOString().slice(0, 10); }

(async () => {
  const token = await getToken();
  // Which properties can this service account read?
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const sites = await sitesRes.json();
  const entries = (sites.siteEntry || []).map(s => s.siteUrl);
  console.error('SITES:', JSON.stringify(entries));

  const target = entries.find(s => /hopefordogseurope/i.test(s));
  if (!target) { console.error('No hopefordogseurope property visible to this service account.'); process.exit(2); }
  console.error('USING:', target);

  const end = new Date();
  const start = new Date(); start.setDate(start.getDate() - 480);
  const qRes = await fetch(
    'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(target) + '/searchAnalytics/query',
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: ymd(start), endDate: ymd(end), dimensions: ['page'], rowLimit: 1000 }),
    }
  );
  const q = await qRes.json();
  if (!q.rows) { console.error('No rows / error:', JSON.stringify(q).slice(0, 500)); process.exit(0); }
  // Print: clicks impressions url
  q.rows
    .map(r => ({ url: r.keys[0], clicks: r.clicks, impr: r.impressions }))
    .sort((a, b) => b.impr - a.impr)
    .forEach(r => console.log(`${String(r.clicks).padStart(5)} ${String(Math.round(r.impr)).padStart(7)}  ${r.url}`));
  console.error('ROWS:', q.rows.length);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
