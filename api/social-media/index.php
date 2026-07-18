<?php
// Social-post media extractor.
// Mirrors the JSON contract of the Supabase `download-social-video` edge
// function, but for Facebook it uses the fast, reliable on-server extractor
// (/api/facebook-text/) and stores the media in Supabase storage so the URLs
// are permanent. Non-Facebook URLs (e.g. TikTok) are proxied to the existing
// edge function unchanged.
//
// Response shapes (matching what the beheer app expects):
//   video:   { success, type:'video',   platform, videoUrl, thumbnailUrl, caption, originalUrl }
//   gallery: { success, type:'gallery', platform, galleryImages[], thumbnailUrl, caption, originalUrl }
//   none:    { error, caption, originalUrl }

require_once __DIR__ . '/config.php';

set_time_limit(180);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$url = isset($input['url']) ? trim($input['url']) : '';

if ($url === '') {
    echo json_encode(['error' => 'Geen URL opgegeven.']);
    exit;
}

$isFacebook = (strpos($url, 'facebook.com') !== false) || (strpos($url, 'fb.watch') !== false);

// ---- Non-Facebook (TikTok, etc.): proxy to the existing edge function ----
if (!$isFacebook) {
    echo proxyToEdgeFunction($url);
    exit;
}

// ---- Facebook: extract via the proven on-server endpoint ----
$ext = callFacebookText($url);
$caption = isset($ext['text']) && $ext['text'] ? $ext['text'] : null;
$videos = isset($ext['videos']) && is_array($ext['videos']) ? $ext['videos'] : [];
$imageData = isset($ext['image_data']) && is_array($ext['image_data']) ? $ext['image_data'] : [];
$images = isset($ext['images']) && is_array($ext['images']) ? $ext['images'] : [];

// ---- Video post / reel ----
if (!empty($videos)) {
    $videoUrl = null;
    foreach ($videos as $v) {
        $bin = downloadBinary($v, 100 * 1024 * 1024, ['video/', 'application/octet-stream']);
        if ($bin) {
            $videoUrl = supabaseUpload($bin['bytes'], 'video/' . uniqueName('mp4'), 'video/mp4');
            if ($videoUrl) break;
        }
    }

    if ($videoUrl) {
        // Thumbnail: use a post image if we have one, else the page's og:image.
        $thumbnailUrl = null;
        $thumbSrc = !empty($images) ? $images[0] : fetchOgImage($url);
        if ($thumbSrc) {
            $tb = downloadBinary($thumbSrc, 15 * 1024 * 1024, ['image/']);
            if ($tb) {
                $thumbnailUrl = supabaseUpload($tb['bytes'], 'gallery/' . uniqueName('jpg'), $tb['type'] ?: 'image/jpeg');
            }
        }
        echo json_encode([
            'success'      => true,
            'type'         => 'video',
            'platform'     => 'facebook',
            'videoUrl'     => $videoUrl,
            'thumbnailUrl' => $thumbnailUrl,
            'caption'      => $caption,
            'originalUrl'  => $url,
        ]);
        exit;
    }
    // If the video couldn't be downloaded, fall through to try photos.
}

// ---- Photo post: build a gallery ----
$gallery = [];

// Prefer already-fetched base64 image_data (no second download needed).
foreach ($imageData as $dataUri) {
    if (count($gallery) >= 30) break;
    $decoded = decodeDataUri($dataUri);
    if (!$decoded) continue;
    $pub = supabaseUpload($decoded['bytes'], 'gallery/' . uniqueName($decoded['ext']), $decoded['mime']);
    if ($pub) $gallery[] = $pub;
}

// Fallback: download raw image URLs if no base64 was available.
if (empty($gallery)) {
    foreach ($images as $imgUrl) {
        if (count($gallery) >= 30) break;
        $ib = downloadBinary($imgUrl, 15 * 1024 * 1024, ['image/']);
        if (!$ib) continue;
        $pub = supabaseUpload($ib['bytes'], 'gallery/' . uniqueName('jpg'), $ib['type'] ?: 'image/jpeg');
        if ($pub) $gallery[] = $pub;
    }
}

if (!empty($gallery)) {
    echo json_encode([
        'success'      => true,
        'type'         => 'gallery',
        'platform'     => 'facebook',
        'galleryImages'=> $gallery,
        'thumbnailUrl' => $gallery[0],
        'caption'      => $caption,
        'originalUrl'  => $url,
    ]);
    exit;
}

// ---- Nothing usable found ----
echo json_encode([
    'error'       => 'Geen media gevonden op deze pagina.',
    'caption'     => $caption,
    'originalUrl' => $url,
]);
exit;


// ============================ Helpers ============================

function uniqueName($ext) {
    return time() . '-' . substr(md5(uniqid('', true)), 0, 8) . '.' . $ext;
}

// Derive the site's base URL (scheme + host) from the incoming request.
function siteBaseUrl() {
    $https = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        || (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on');
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    if ($host === '') return defined('SUPABASE_URL') ? '' : '';
    return ($https ? 'https' : 'http') . '://' . $host;
}

function callFacebookText($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => siteBaseUrl() . '/api/facebook-text/',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['url' => $url]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 120,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
    return json_decode($resp, true) ?: [];
}

function decodeDataUri($dataUri) {
    if (!preg_match('/^data:([^;]+);base64,(.*)$/s', $dataUri, $m)) return null;
    $mime = $m[1];
    $bytes = base64_decode($m[2]);
    if ($bytes === false || strlen($bytes) < 100) return null;
    $ext = 'jpg';
    if (strpos($mime, 'png') !== false) $ext = 'png';
    elseif (strpos($mime, 'webp') !== false) $ext = 'webp';
    elseif (strpos($mime, 'gif') !== false) $ext = 'gif';
    return ['bytes' => $bytes, 'mime' => $mime, 'ext' => $ext];
}

// Download a URL, verifying the content-type prefix and size cap.
function downloadBinary($url, $maxBytes, $allowedTypePrefixes) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $data = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: '';
    curl_close($ch);

    if ($code !== 200 || $data === false || strlen($data) < 500) return null;
    if (strlen($data) > $maxBytes) return null;

    $ok = false;
    foreach ($allowedTypePrefixes as $prefix) {
        if ($type === '' || strpos($type, $prefix) !== false) { $ok = true; break; }
    }
    if (!$ok) return null;

    return ['bytes' => $data, 'type' => $type];
}

// Upload bytes to the Supabase storage bucket; returns the public URL or null.
function supabaseUpload($bytes, $path, $mime) {
    $endpoint = rtrim(SUPABASE_URL, '/') . '/storage/v1/object/' . SUPABASE_BUCKET . '/' . $path;
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $bytes,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
            'Content-Type: ' . $mime,
            'x-upsert: true',
            'Cache-Control: max-age=31536000',
        ],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 && $code !== 201) return null;
    return rtrim(SUPABASE_URL, '/') . '/storage/v1/object/public/' . SUPABASE_BUCKET . '/' . $path;
}

// Quick fetch of the page's og:image (used as a video/reel thumbnail).
function fetchOgImage($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: nl,en;q=0.5',
            'Sec-Fetch-Dest: document',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: none',
            'Sec-Fetch-User: ?1',
        ],
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $html = curl_exec($ch);
    curl_close($ch);
    if (!$html) return null;
    if (preg_match('/<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)["\']/i', $html, $m)) {
        $img = html_entity_decode($m[1], ENT_QUOTES, 'UTF-8');
        if (strpos($img, 'safe_image.php') === false) return $img;
    }
    if (preg_match('/<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']/i', $html, $m)) {
        return html_entity_decode($m[1], ENT_QUOTES, 'UTF-8');
    }
    return null;
}

// Proxy non-Facebook URLs to the existing Supabase edge function unchanged.
function proxyToEdgeFunction($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => rtrim(SUPABASE_URL, '/') . '/functions/v1/download-social-video',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['url' => $url]),
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . SUPABASE_ANON_KEY,
            'apikey: ' . SUPABASE_ANON_KEY,
        ],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($resp === false || $code < 200 || $code >= 300) {
        return json_encode(['error' => 'Automatisch downloaden mislukt.']);
    }
    return $resp;
}
