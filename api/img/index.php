<?php
// Never let a PHP notice/warning leak into the image byte stream.
error_reporting(0);
@ini_set('display_errors', '0');

// Lightweight on-the-fly image resizer with a file cache.
//
// Usage: /api/img/?src=<url>&w=700[&q=72]
// - Only resizes images from our own Supabase storage bucket (allow-list).
// - Caches the resized JPEG on disk so each size is generated once.
// - On ANY problem it 302-redirects to the original URL, so the frontend
//   always gets a working image (graceful degradation). The frontend also
//   has an onerror fallback as a second safety net.

header('Access-Control-Allow-Origin: *');

$src = isset($_GET['src']) ? $_GET['src'] : '';
$w   = isset($_GET['w']) ? (int) $_GET['w'] : 700;
$q   = isset($_GET['q']) ? (int) $_GET['q'] : 72;

$w = max(80, min(1600, $w));
$q = max(40, min(90, $q));

function bail_to_original($src) {
    // Send the browser straight to the original if we can't help.
    if ($src !== '' && preg_match('#^https://#', $src)) {
        header('Location: ' . $src, true, 302);
    } else {
        http_response_code(400);
    }
    exit;
}

// Allow-list: only our Supabase storage public objects.
if ($src === '' || !preg_match('#^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/#i', $src)) {
    bail_to_original($src);
}

if (!function_exists('imagecreatefromstring')) {
    bail_to_original($src); // GD not available -> serve original
}

// Cache path
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}
// If we can't cache, don't waste a server-side fetch+resize on every hit —
// send the browser straight to the original instead.
if (!is_dir($cacheDir) || !is_writable($cacheDir)) {
    bail_to_original($src);
}
$key   = md5($src . '|' . $w . '|' . $q) . '.jpg';
$cache = $cacheDir . '/' . $key;

// Serve from cache if present
if (is_file($cache) && filesize($cache) > 0) {
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=31536000, immutable');
    header('Content-Length: ' . filesize($cache));
    readfile($cache);
    exit;
}

// Fetch the original
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $src,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$data = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code !== 200 || !$data) {
    bail_to_original($src);
}

$srcImg = @imagecreatefromstring($data);
if ($srcImg === false) {
    bail_to_original($src);
}

$sw = imagesx($srcImg);
$sh = imagesy($srcImg);
if ($sw <= 0 || $sh <= 0) {
    imagedestroy($srcImg);
    bail_to_original($src);
}

// Only downscale (never upscale)
$targetW = min($w, $sw);
$targetH = (int) round($sh * ($targetW / $sw));

$dst = imagecreatetruecolor($targetW, $targetH);
imagecopyresampled($dst, $srcImg, 0, 0, 0, 0, $targetW, $targetH, $sw, $sh);
imagedestroy($srcImg);

// Write to cache
imagejpeg($dst, $cache, $q);
imagedestroy($dst);

if (!is_file($cache) || filesize($cache) === 0) {
    // Couldn't cache (e.g. non-writable dir) -> just fall back
    bail_to_original($src);
}

header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=31536000, immutable');
header('Content-Length: ' . filesize($cache));
readfile($cache);
