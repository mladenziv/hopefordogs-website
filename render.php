<?php
// Shared server-side prerender helpers. Reuses the sitemap-posts.xml.php curl
// pattern (read-only anon key). Every wrapper injects real per-record tags +
// content into the existing .html template ONLY on a successful, in-time fetch;
// on ANY failure it serves the untouched template (ssr_passthru), so behaviour
// equals today's client-only render. Worst case = current state, never broken.

const SSR_SUPABASE_URL = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
const SSR_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';
const SSR_ORIGIN = 'https://www.hopefordogseurope.com';

// Language from the ORIGINAL request URI (/en/ or /de/ prefix). The .htaccess
// language rewrite strips the prefix from the filesystem path, but REQUEST_URI
// keeps it — same source h4dGetLanguage() reads client-side.
function ssr_lang() {
    return preg_match('#^/(en|de)(/|$)#', $_SERVER['REQUEST_URI'] ?? '', $m) ? $m[1] : 'nl';
}

// Mirrors h4dField() in components.js: nl uses the base column; otherwise
// <field>_<lang> when non-empty, else the base column.
function ssr_field($row, $field, $lang) {
    if ($lang === 'nl') return $row[$field] ?? '';
    $t = $row[$field . '_' . $lang] ?? '';
    return ($t !== '' && $t !== null) ? $t : ($row[$field] ?? '');
}

function ssr_h($s) { return htmlspecialchars((string)($s ?? ''), ENT_QUOTES, 'UTF-8'); }

// Absolute canonical/og URL for a bare template name in a given language (+ query).
function ssr_url($bare, $lang, $query = '') {
    $prefix = ($lang === 'nl') ? '/' : '/' . $lang . '/';
    return SSR_ORIGIN . $prefix . $bare . $query;
}

// GET Supabase REST -> decoded array, or null on any failure. 3s total cap is
// the "worst case = current state" lever: a slow origin never blocks the human
// page for long, it just falls back to the client-rendered shell.
function ssr_get($path) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => SSR_SUPABASE_URL . $path,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_TIMEOUT => 3,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SSR_SUPABASE_ANON_KEY,
            'Authorization: Bearer ' . SSR_SUPABASE_ANON_KEY,
        ],
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // No curl_close(): it's a no-op since PHP 8.0 and deprecated in 8.5 (the handle
    // is freed automatically). Calling it would emit a Deprecated warning that could
    // leak into the served HTML on a PHP 8.5+ host with display_errors on.
    if ($code < 200 || $code >= 300) return null;
    $j = json_decode($res, true);
    return is_array($j) ? $j : null;
}

// Serve the template byte-for-byte and stop. The universal fallback.
function ssr_passthru($tpl) {
    if (is_readable($tpl)) readfile($tpl);
    exit;
}

// Build the <link rel="alternate" hreflang> mesh (nl/de/en + x-default -> nl).
function ssr_hreflang($bare, $query = '') {
    $out = '';
    foreach (['nl', 'de', 'en'] as $l) {
        $out .= '  <link rel="alternate" hreflang="' . $l . '" href="' . ssr_h(ssr_url($bare, $l, $query)) . '">' . "\n";
    }
    $out .= '  <link rel="alternate" hreflang="x-default" href="' . ssr_h(ssr_url($bare, 'nl', $query)) . '">' . "\n";
    return $out;
}

// Path-based siblings of ssr_url/ssr_hreflang for slug URLs (no .html, own base
// segment). ssr_url_path('hond/bella-ec3d1a95', 'de') -> .../de/hond/bella-ec3d1a95
function ssr_url_path($path, $lang, $query = '') {
    $prefix = ($lang === 'nl') ? '/' : '/' . $lang . '/';
    return SSR_ORIGIN . $prefix . ltrim($path, '/') . $query;
}

function ssr_hreflang_path($path, $query = '') {
    $out = '';
    foreach (['nl', 'de', 'en'] as $l) {
        $out .= '  <link rel="alternate" hreflang="' . $l . '" href="' . ssr_h(ssr_url_path($path, $l, $query)) . '">' . "\n";
    }
    $out .= '  <link rel="alternate" hreflang="x-default" href="' . ssr_h(ssr_url_path($path, 'nl', $query)) . '">' . "\n";
    return $out;
}
