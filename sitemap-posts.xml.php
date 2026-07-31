<?php
// Dynamic sitemap for individual blog posts (nieuws.html links to post.html?id=...,
// which is not covered by the static sitemap.xml). Read-only, anon key — same
// published_at<=now filter used client-side in nieuws.html/post.html.

header('Content-Type: application/xml; charset=UTF-8');

$SUPABASE_URL = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
$SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

$nowIso = gmdate('Y-m-d\TH:i:s\Z');
$path = '/rest/v1/posts?select=id,published_at&published_at=lte.' . rawurlencode($nowIso) . '&order=published_at.desc';

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

$posts = ($code >= 200 && $code < 300) ? json_decode($response, true) : [];
if (!is_array($posts)) $posts = [];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($posts as $post) {
    if (empty($post['id'])) continue;
    $loc = 'https://www.hopefordogseurope.com/post.html?id=' . rawurlencode($post['id']);
    echo '  <url>' . "\n";
    echo '    <loc>' . htmlspecialchars($loc, ENT_XML1) . '</loc>' . "\n";
    if (!empty($post['published_at'])) {
        $lastmod = gmdate('Y-m-d', strtotime($post['published_at']));
        echo '    <lastmod>' . $lastmod . '</lastmod>' . "\n";
    }
    echo '    <changefreq>monthly</changefreq>' . "\n";
    echo '    <priority>0.5</priority>' . "\n";
    echo '  </url>' . "\n";
}
echo '</urlset>' . "\n";
