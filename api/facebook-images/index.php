<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    http_response_code(405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$url = $input['url'] ?? '';

if (empty($url) || strpos($url, 'facebook.com') === false) {
    echo json_encode(['error' => 'Invalid Facebook URL', 'images' => []]);
    exit;
}

function fetchWithRedirects($url, $maxRedirects = 5) {
    $currentUrl = $url;
    for ($i = 0; $i < $maxRedirects; $i++) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $currentUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HEADER => true,
            CURLOPT_NOBODY => false,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: nl,en;q=0.5',
                'Sec-Fetch-Dest: document',
                'Sec-Fetch-Mode: navigate',
                'Sec-Fetch-Site: none',
                'Sec-Fetch-User: ?1',
            ],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        if ($httpCode >= 300 && $httpCode < 400) {
            if (preg_match('/^Location:\s*(.+)$/mi', substr($response, 0, $headerSize), $m)) {
                $currentUrl = trim($m[1]);
                continue;
            }
        }
        return substr($response, $headerSize);
    }
    return '';
}

$html = fetchWithRedirects($url);

if (empty($html)) {
    echo json_encode(['error' => 'Could not fetch page', 'images' => []]);
    exit;
}

$images = [];
$seen = [];

// Extract og:image meta tags (most reliable for Facebook posts)
if (preg_match_all('/<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)["\']/i', $html, $matches)) {
    foreach ($matches[1] as $imgUrl) {
        $decoded = html_entity_decode($imgUrl, ENT_QUOTES, 'UTF-8');
        // Skip tiny tracking pixels and profile pictures
        if (strpos($decoded, 'safe_image.php') !== false) continue;
        if (strpos($decoded, '1x1') !== false) continue;
        if (!isset($seen[$decoded])) {
            $images[] = $decoded;
            $seen[$decoded] = true;
        }
    }
}

// Also check content="" before property="" (alternate order)
if (preg_match_all('/<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']/i', $html, $matches)) {
    foreach ($matches[1] as $imgUrl) {
        $decoded = html_entity_decode($imgUrl, ENT_QUOTES, 'UTF-8');
        if (strpos($decoded, 'safe_image.php') !== false) continue;
        if (strpos($decoded, '1x1') !== false) continue;
        if (!isset($seen[$decoded])) {
            $images[] = $decoded;
            $seen[$decoded] = true;
        }
    }
}

// Extract high-res images from data attributes and JSON-LD
if (preg_match_all('/"(?:full_?size|large|high_?res)_?(?:src|url|image)":\s*"(https:[^"]+)"/i', $html, $matches)) {
    foreach ($matches[1] as $imgUrl) {
        $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $imgUrl);
        if (!isset($seen[$decoded]) && preg_match('/\.(jpg|jpeg|png|webp)/i', $decoded)) {
            $images[] = $decoded;
            $seen[$decoded] = true;
        }
    }
}

// Extract from image JSON structures commonly found in Facebook HTML
if (preg_match_all('/"image":\s*\{[^}]*"uri":\s*"(https:[^"]+)"/', $html, $matches)) {
    foreach ($matches[1] as $imgUrl) {
        $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $imgUrl);
        if (!isset($seen[$decoded]) && preg_match('/\.(jpg|jpeg|png|webp)/i', $decoded)) {
            $images[] = $decoded;
            $seen[$decoded] = true;
        }
    }
}

// Collect photo file IDs from og:image URLs
$postFileIds = [];
foreach ($images as $img) {
    if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $img, $fm)) {
        $postFileIds[$fm[1]] = true;
    }
}

// Scan "__typename":"Photo" entries for more file IDs
$searchPos = 0;
$photoNeedle = '"__typename":"Photo"';
while (($pos = strpos($html, $photoNeedle, $searchPos)) !== false) {
    $searchPos = $pos + strlen($photoNeedle);
    $chunkStart = max(0, $pos - 1000);
    $chunk = substr($html, $chunkStart, 3000);
    $offset = 0;
    while (preg_match('/"uri"\s*:\s*"(https:[^"]+)"/i', $chunk, $um, PREG_OFFSET_CAPTURE, $offset)) {
        $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $um[1][0]);
        $offset = $um[0][1] + strlen($um[0][0]);
        if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) {
            $postFileIds[$fm[1]] = true;
        }
    }
}

// Scan "all_subattachments" for multi-photo posts
$subPos = 0;
$subNeedle = 'all_subattachments';
while (($pos = strpos($html, $subNeedle, $subPos)) !== false) {
    $subPos = $pos + strlen($subNeedle);
    $chunk = substr($html, $pos, 20000);
    $offset = 0;
    while (preg_match('/"uri"\s*:\s*"(https:[^"]+)"/i', $chunk, $um, PREG_OFFSET_CAPTURE, $offset)) {
        $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $um[1][0]);
        $offset = $um[0][1] + strlen($um[0][0]);
        if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) {
            $postFileIds[$fm[1]] = true;
        }
    }
}

// Scan media edges blocks
$edgePos = 0;
$edgeNeedle = '"edges":[{"node":';
while (($pos = strpos($html, $edgeNeedle, $edgePos)) !== false) {
    $edgePos = $pos + strlen($edgeNeedle);
    $chunk = substr($html, $pos, 20000);
    if (strpos($chunk, 'Photo') === false && strpos($chunk, 'photo') === false) continue;
    $offset = 0;
    while (preg_match('/"uri"\s*:\s*"(https:[^"]+)"/i', $chunk, $um, PREG_OFFSET_CAPTURE, $offset)) {
        $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $um[1][0]);
        $offset = $um[0][1] + strlen($um[0][0]);
        if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) {
            $postFileIds[$fm[1]] = true;
        }
    }
}

// Scan ALL "uri" fields for matching file IDs, prefer full-size
$uriNeedle = '"uri":"';
$uriNeedleLen = strlen($uriNeedle);
$uriPos = 0;
$photosByFile = [];
while (($uriPos = strpos($html, $uriNeedle, $uriPos)) !== false) {
    $uriStart = $uriPos + $uriNeedleLen;
    $uriEnd = strpos($html, '"', $uriStart);
    if ($uriEnd === false) break;
    $rawUrl = substr($html, $uriStart, $uriEnd - $uriStart);
    $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $rawUrl);
    $uriPos = $uriEnd + 1;
    if (!preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) continue;
    $fileId = $fm[1];
    if (!isset($postFileIds[$fileId])) continue;
    $isThumbnail = preg_match('/_s\d+x\d+/', $decoded);
    if (!isset($photosByFile[$fileId]) || !$isThumbnail) {
        $photosByFile[$fileId] = $decoded;
    }
}
foreach ($photosByFile as $fid => $url) {
    if (!isset($seen[$url])) {
        $images[] = $url;
        $seen[$url] = true;
    }
}

// No photo limit — return ALL photos from the post

echo json_encode(['images' => $images]);
