<?php
// Dynamic sitemap for individual adoption stories (ervaringen.html links to
// ervaring.html?id=..., not covered by the static sitemap.xml). Read-only, anon
// key. Stories have no slug column, so URLs are ervaring.html?id=<id>.

header('Content-Type: application/xml; charset=UTF-8');

$SUPABASE_URL = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

$path = '/rest/v1/stories?select=id,created_at&order=sort_order.asc.nullslast,created_at.desc';

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

$stories = ($code >= 200 && $code < 300) ? json_decode($response, true) : [];
if (!is_array($stories)) $stories = [];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
$prefixes = ['', 'en/', 'de/'];
foreach ($stories as $story) {
    if (empty($story['id'])) continue;
    $lastmod = !empty($story['created_at']) ? gmdate('Y-m-d', strtotime($story['created_at'])) : null;
    foreach ($prefixes as $prefix) {
        $loc = 'https://www.hopefordogseurope.com/' . $prefix . 'ervaring.html?id=' . rawurlencode($story['id']);
        echo '  <url>' . "\n";
        echo '    <loc>' . htmlspecialchars($loc, ENT_XML1) . '</loc>' . "\n";
        if ($lastmod) {
            echo '    <lastmod>' . $lastmod . '</lastmod>' . "\n";
        }
        echo '    <changefreq>monthly</changefreq>' . "\n";
        echo '    <priority>0.5</priority>' . "\n";
        echo '  </url>' . "\n";
    }
}
echo '</urlset>' . "\n";
