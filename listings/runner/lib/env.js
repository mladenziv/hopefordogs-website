// Resolve the Supabase URL + service key for the runner.
// Order: process.env → listings/runner/.env → (local fallback) the gitignored
// PHP config the rest of the site already uses. So local runs need zero setup.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const RUNNER_DIR = resolve(__dirname, '..');        // listings/runner
export const REPO_ROOT = resolve(RUNNER_DIR, '..', '..');  // repo root

function parseDotenv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

export function loadEnv() {
  const dot = parseDotenv(resolve(RUNNER_DIR, '.env'));
  const raw = Object.assign({}, dot, process.env); // process.env wins over .env
  const SUPABASE_URL = raw.SUPABASE_URL || 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
  let SUPABASE_SERVICE_KEY = raw.SUPABASE_SERVICE_KEY || '';
  if (!SUPABASE_SERVICE_KEY) {
    const php = resolve(REPO_ROOT, 'api', 'social-media', 'config.php');
    if (existsSync(php)) {
      const m = readFileSync(php, 'utf8').match(/SUPABASE_SERVICE_KEY['"]\s*,\s*['"]([^'"]+)['"]/);
      if (m) SUPABASE_SERVICE_KEY = m[1];
    }
  }
  return { SUPABASE_URL, SUPABASE_SERVICE_KEY, raw };
}
