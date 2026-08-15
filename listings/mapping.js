// =============================================================================
// listings/mapping.js — shared, dependency-free ESM used by BOTH
//   • beheer/listings.html  (browser, <script type="module">)
//   • listings/runner/post.js (Node, Phase 2)
// so the review UI, the copy-paste packet, and the auto-poster all agree on
// exactly how a dog maps onto each site's form.
//
// No imports, no framework, no Date.now-free constraints (this is normal JS —
// it runs in a browser/Node, not the workflow sandbox).
// =============================================================================

// ---- small helpers ---------------------------------------------------------
function jaNeeWord(v) { return v === true ? 'ja' : v === false ? 'nee' : 'onbekend'; }
function jaNee(v) { return v === true ? 'Ja' : v === false ? 'Nee' : 'Onbekend'; }

// Age from an (approximate) birth date, relative to today.
function ageParts(dob) {
  if (!dob) return { years: '', months: '' };
  var b = new Date(dob);
  if (isNaN(b.getTime())) return { years: '', months: '' };
  var now = new Date();
  var months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months--;
  if (months < 0) months = 0;
  return { years: Math.floor(months / 12), months: months % 12 };
}

// baasjegezocht has ONE "andere dieren" field; we track cats + dogs separately.
// Cautious combine: both known-good → Ja; any known-bad → Nee; else Onbekend.
function combineAndereDieren(hond, kat) {
  if (hond === true && kat === true) return 'Ja';
  if (hond === false || kat === false) return 'Nee';
  return 'Onbekend';
}

function isEmpty(v) { return v === '' || v === null || v === undefined; }

function toISODate(v) {
  if (!v) return '';
  var s = String(v);
  // already yyyy-mm-dd or an ISO timestamp → take the date part
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  var d = new Date(s);
  if (isNaN(d.getTime())) return '';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function compute(name, dog) {
  switch (name) {
    case 'ageYears': return ageParts(dog.geboortedatum).years;
    case 'ageMonths': return ageParts(dog.geboortedatum).months;
    case 'birthDate': return toISODate(dog.geboortedatum);
    case 'andereDierenBaasje': return combineAndereDieren(dog.hondvriendelijk, dog.katvriendelijk);
    case 'andereDierenToelichting':
      return 'Honden: ' + jaNeeWord(dog.hondvriendelijk) + ' · Katten: ' + jaNeeWord(dog.katvriendelijk);
    default: return '';
  }
}

// ---- resolve one field spec → a concrete value -----------------------------
function resolveField(spec, dog, plat, config) {
  var src = spec.src || ['const', ''];
  var kind = src[0];
  var value;
  switch (kind) {
    case 'dog': value = dog[src[1]]; break;
    // dog column with a fallback literal when empty (e.g. ras → "Mix"). Editable.
    case 'dogOr': value = (dog[src[1]] !== undefined && dog[src[1]] !== null && String(dog[src[1]]).trim() !== '') ? dog[src[1]] : src[2]; break;
    case 'const': value = src[1]; break;
    case 'org': value = (config.org || {})[src[1]]; break;
    case 'default': value = (plat.defaults || {})[src[1]]; break;
    case 'template': value = (plat.templates || {})[src[1]]; break;
    case 'boolJaNee': value = jaNee(dog[src[1]]); break;
    case 'boolCheck': value = dog[src[1]] === true; break;
    case 'optionMap': value = ((plat.options || {})[src[2]] || {})[dog[src[1]]]; break;
    case 'compute': value = compute(src[1], dog); break;
    default: value = '';
  }
  if (value === undefined || value === null) value = (spec.type === 'checkbox') ? false : '';
  return {
    key: spec.key,
    label: spec.label,
    type: spec.type || 'text',
    value: value,
    required: !!spec.required,
    maxlen: spec.maxlen || null,
    enum: spec.enum || null,
    note: spec.note || null,
    // locked = comes straight from config (const/org/template) — editable in the
    // review modal but visually marked as "from settings".
    locked: (kind === 'const' || kind === 'org' || kind === 'template'),
    source: kind,
    // compute-sourced fields are re-derived (never hand-edited) so the review
    // modal can refresh them live when geboortedatum changes.
    computeName: (kind === 'compute' ? src[1] : null),
    // 'karakter' → filled by the AI character generator; 'ras' → AI-detected breed.
    ai: spec.ai || null
  };
}

// ---- public: build the platform-specific payload ---------------------------
// dog    — a row from the `dogs` table
// photos — array of dog_photos rows (or plain URL strings), already ordered
// platform — 'baasjegezocht' | 'petrescue'
// config — the parsed listings/config.json
export function buildPayload(dog, photos, platform, config) {
  var plat = (config.platforms || {})[platform];
  if (!plat) throw new Error('Unknown platform: ' + platform);
  var fields = (plat.fields || []).map(function (spec) { return resolveField(spec, dog, plat, config); });
  var photoUrls = (photos || [])
    .map(function (p) { return typeof p === 'string' ? p : (p && p.photo_url); })
    .filter(Boolean);
  return {
    platform: platform,
    fields: fields,
    photos: photoUrls,
    meta: { geboortedatum: dog.geboortedatum || null, dogName: dog.naam || '' }
  };
}

// ---- public: validate a payload against the guidelines ----------------------
export function validate(payload, config, platform) {
  var errors = [], warnings = [];
  var g = config.guidelines || {};

  (payload.fields || []).forEach(function (f) {
    if (f.type === 'checkbox') return; // booleans are never "empty"
    if (f.required && isEmpty(f.value)) errors.push('Verplicht veld ontbreekt: ' + f.label);
    if (f.maxlen && typeof f.value === 'string' && f.value.length > f.maxlen) {
      if (f.key === 'naam') errors.push(f.label + ' is te lang (max ' + f.maxlen + ' tekens).');
      else warnings.push(f.label + ' is langer dan ' + f.maxlen + ' tekens en wordt mogelijk afgekapt.');
    }
  });

  var minP = g.min_photos || 1;
  var n = (payload.photos || []).length;
  if (n < minP) errors.push('Minimaal ' + minP + ' foto\'s nodig (nu ' + n + ').');

  return { errors: errors, warnings: warnings };
}

// ---- public: re-derive compute fields in place (e.g. after geboortedatum edit)
export function recomputeDerived(payload, dog) {
  (payload.fields || []).forEach(function (f) {
    if (f.computeName) f.value = compute(f.computeName, dog);
  });
  if (payload.meta) payload.meta.geboortedatum = dog.geboortedatum || null;
  return payload;
}

// ---- public: render the copy-paste "packet" (assisted posting) --------------
export function packetText(payload, config, platform) {
  var plat = (config.platforms || {})[platform] || {};
  var lines = [];
  lines.push('=== ' + (plat.label || platform) + ' — ' + (payload.meta && payload.meta.dogName || '') + ' ===');
  if (plat.new_listing_url) lines.push('Formulier: ' + plat.new_listing_url);
  lines.push('');
  (payload.fields || []).forEach(function (f) {
    var v = f.type === 'checkbox' ? (f.value ? 'Ja' : 'Nee') : (isEmpty(f.value) ? '—' : f.value);
    lines.push(f.label + ': ' + v);
  });
  lines.push('');
  lines.push("Foto's (" + (payload.photos || []).length + '):');
  (payload.photos || []).forEach(function (u, i) { lines.push('  ' + (i + 1) + '. ' + u); });
  return lines.join('\n');
}
