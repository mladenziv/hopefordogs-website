<?php
// ========================================
// SUPABASE CONFIGURATION (server-side) — TEMPLATE
// ========================================
// The real config.php is NOT in git (see .gitignore).
//
// To set up on the server:
//   1. In cPanel File Manager, go to public_html/api/social-media/
//   2. Copy this file to config.php
//   3. Fill in the service_role key from:
//      Supabase Dashboard > Project Settings > API > service_role (secret)
// ========================================

define('SUPABASE_URL', 'https://YOUR-PROJECT.supabase.co');
define('SUPABASE_SERVICE_KEY', 'PASTE_SERVICE_ROLE_KEY_HERE'); // secret — never commit
define('SUPABASE_BUCKET', 'social-media');

// Anon key — used only to proxy non-Facebook (e.g. TikTok) URLs to the
// existing download-social-video edge function so that path is unchanged.
define('SUPABASE_ANON_KEY', 'PASTE_ANON_KEY_HERE');
