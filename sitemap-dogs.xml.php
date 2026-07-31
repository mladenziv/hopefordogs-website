<?php
// Dynamic sitemap for individual dog pages (honden.html links to hond.html?id=...,
// which is not covered by the static sitemap.xml). Read-only, anon key — same
// draft/status filter used client-side. Only AVAILABLE dogs are listed; adopted
// dogs are noindex and intentionally excluded. Mirrors sitemap-posts.xml.php.

header('Content-Type: application/xml; charset=UTF-8');

$SUPABASE_URL = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

// Available dogs only: not a draft, not adopted (opzoek + in_gesprek).
$path = '/rest/v1/dogs?select=id,updated_at&draft=eq.false&status=neq.geadopteerd&order=updated_at.desc';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $SUPABASE_URL . $path,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'apikey: ' . $SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . $SUPABASE_ANON_KEY,
    ],
]);
$response = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$dogs = ($code >= 200 && $code < 300) ? json_decode($response, true) : [];
if (!is_array($dogs)) $dogs = [];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
$prefixes = ['', 'en/', 'de/'];
foreach ($dogs as $dog) {
    if (empty($dog['id'])) continue;
    $lastmod = !empty($dog['updated_at']) ? gmdate('Y-m-d', strtotime($dog['updated_at'])) : null;
    foreach ($prefixes as $prefix) {
        $loc = 'https://www.hopefordogseurope.com/' . $prefix . 'hond.html?id=' . rawurlencode($dog['id']);
        echo '  <url>' . "\n";
        echo '    <loc>' . htmlspecialchars($loc, ENT_XML1) . '</loc>' . "\n";
        if ($lastmod) {
            echo '    <lastmod>' . $lastmod . '</lastmod>' . "\n";
        }
        echo '    <changefreq>weekly</changefreq>' . "\n";
        echo '    <priority>0.7</priority>' . "\n";
        echo '  </url>' . "\n";
    }
}
echo '</urlset>' . "\n";
