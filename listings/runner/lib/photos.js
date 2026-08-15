// Download a listing's photo URLs (public bucket) to a temp dir so Playwright can
// upload them via the form's file input. Returns an ordered array of local paths.
//
// baasjegezocht.nl rejects WebP, so any WebP is converted to JPG (via macOS `sips`,
// no dependency) before upload. JPG is accepted everywhere, so we convert always.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// WebP magic bytes: "RIFF" at 0-3 and "WEBP" at 8-11 (independent of the URL extension).
function isWebp(buf) {
  return buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
}

export async function downloadPhotos(urls, log = console.log) {
  if (!urls || !urls.length) return [];
  const dir = mkdtempSync(join(tmpdir(), 'h4d-listing-'));
  const paths = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i]);
      if (!r.ok) { log(`  ! foto ${i + 1} download faalde (${r.status}): ${urls[i]}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      const base = String(i + 1).padStart(2, '0');

      if (isWebp(buf)) {
        const webp = join(dir, base + '.webp');
        const jpg = join(dir, base + '.jpg');
        writeFileSync(webp, buf);
        try {
          execFileSync('sips', ['-s', 'format', 'jpeg', webp, '--out', jpg], { stdio: 'ignore' });
          paths.push(jpg);
          log(`  ✓ foto ${i + 1}: webp → jpg`);
        } catch (e) {
          log(`  ! webp→jpg conversie faalde (${e.message}); origineel webp gebruikt`);
          paths.push(webp);
        }
        continue;
      }

      const ext = ((urls[i].split('?')[0].split('.').pop() || 'jpg')).slice(0, 4).replace(/[^a-z0-9]/gi, '') || 'jpg';
      const p = join(dir, base + '.' + ext);
      writeFileSync(p, buf);
      paths.push(p);
    } catch (e) { log(`  ! foto ${i + 1} fout: ${e.message}`); }
  }
  return paths;
}
