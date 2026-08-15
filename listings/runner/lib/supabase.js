// Service-key Supabase REST helpers (bypass RLS). Used only by the local runner.
export function makeDb({ SUPABASE_URL, SUPABASE_SERVICE_KEY }) {
  const base = SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/';
  const h = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json'
  };
  async function get(q) {
    const r = await fetch(base + q, { headers: h });
    if (!r.ok) throw new Error('GET ' + r.status + ' ' + (await r.text()));
    return r.json();
  }
  async function patch(q, body, prefer) {
    const r = await fetch(base + q, { method: 'PATCH', headers: prefer ? { ...h, Prefer: prefer } : h, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('PATCH ' + r.status + ' ' + (await r.text()));
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }

  return {
    // Which rows to attempt, by mode.
    async queue({ platform, ids, dogSlug, allReady }) {
      let q = 'dog_listings?select=*,dogs(naam,slug)';
      if (ids && ids.length) q += '&id=in.(' + ids.join(',') + ')';
      else if (dogSlug) {
        const d = await get('dogs?select=id&slug=eq.' + encodeURIComponent(dogSlug));
        if (!d.length) return [];
        q += '&dog_id=eq.' + d[0].id;
      } else if (allReady) q += '&status=eq.ready';
      else q += '&status=eq.ready&queued=eq.true';
      if (platform) q += '&platform=eq.' + platform;
      return get(q + '&order=created_at.asc');
    },

    // Atomic claim: flip ready → posting. PostgREST updates 0 rows if anything
    // else already moved it, so two runs / a retry can't grab the same listing.
    // Returns the claimed row, or null if we didn't claim it.
    async claim(id, requireQueued) {
      let q = 'dog_listings?id=eq.' + id + '&status=eq.ready';
      if (requireQueued) q += '&queued=eq.true';
      const rows = await patch(q, { status: 'posting' }, 'return=representation');
      return (rows && rows.length) ? rows[0] : null;
    },

    async finish(id, obj) { return patch('dog_listings?id=eq.' + id, obj); }
  };
}
