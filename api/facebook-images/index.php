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

// Extract photo fbids from the HTML
$photoFbids = [];
$photoNeedle = '"__typename":"Photo"';
$searchPos = 0;
while (($pos = strpos($html, $photoNeedle, $searchPos)) !== false) {
    $searchPos = $pos + strlen($photoNeedle);
    $chunk = substr($html, max(0, $pos - 500), 1500);
    if (preg_match('/"id"\s*:\s*"(\d{12,})"/', $chunk, $idm)) {
        $photoFbids[$idm[1]] = true;
    }
}
if (preg_match_all('/fbid[=:](\d{12,})/', $html, $fbidMatches)) {
    foreach ($fbidMatches[1] as $fid) { $photoFbids[$fid] = true; }
}

// Collect post photo URIs (only -6/ path = actual post photos, not -1/ profile pics)
$photosByFile = [];
$uriNeedle = '"uri":"';
$uriNeedleLen = strlen($uriNeedle);
$uriPos = 0;
while (($uriPos = strpos($html, $uriNeedle, $uriPos)) !== false) {
    $uriStart = $uriPos + $uriNeedleLen;
    $uriEnd = strpos($html, '"', $uriStart);
    if ($uriEnd === false) break;
    $rawUrl = substr($html, $uriStart, $uriEnd - $uriStart);
    $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $rawUrl);
    $uriPos = $uriEnd + 1;
    if (strpos($decoded, '-6/') === false) continue;
    if (!preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) continue;
    $isThumbnail = preg_match('/_s\d+x\d+/', $decoded);
    if (!isset($photosByFile[$fm[1]]) || !$isThumbnail) {
        $photosByFile[$fm[1]] = $decoded;
    }
}

// Filter og:image results to only post photos
$filteredImages = [];
foreach ($images as $img) {
    if (strpos($img, '-6/') !== false || strpos($img, 'stp=') !== false) {
        $filteredImages[] = $img;
    }
}
$images = $filteredImages;
$seen = [];
foreach ($images as $img) { $seen[$img] = true; }
foreach ($photosByFile as $fid => $url) {
    if (!isset($seen[$url])) { $images[] = $url; $seen[$url] = true; }
}

// Fetch individual photo pages to discover ALL photos (Facebook only renders ~5 in post HTML)
$allFoundFbids = $photoFbids;
$pendingFbids = array_keys($photoFbids);
$fetchedFbids = [];
$maxFetches = 25;
$fetchCount = 0;

while (!empty($pendingFbids) && $fetchCount < $maxFetches) {
    $batch = array_splice($pendingFbids, 0, 5);
    $mh = curl_multi_init();
    $handles = [];
    foreach ($batch as $fbid) {
        if (isset($fetchedFbids[$fbid])) continue;
        $fetchedFbids[$fbid] = true;
        $fetchCount++;
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://www.facebook.com/photo/?fbid=' . $fbid,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_HTTPHEADER => ['Accept: text/html', 'Accept-Language: nl,en;q=0.5'],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $handles[$fbid] = $ch;
        curl_multi_add_handle($mh, $ch);
    }
    do {
        $status = curl_multi_exec($mh, $active);
        if ($active) curl_multi_select($mh, 1);
    } while ($active && $status == CURLM_OK);
    foreach ($handles as $fbid => $ch) {
        $photoHtml = curl_multi_getcontent($ch);
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
        if (empty($photoHtml)) continue;
        $pOffset = 0;
        while (preg_match('/"uri"\s*:\s*"(https:[^"]+)"/i', $photoHtml, $pum, PREG_OFFSET_CAPTURE, $pOffset)) {
            $pDecoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $pum[1][0]);
            $pOffset = $pum[0][1] + strlen($pum[0][0]);
            if (strpos($pDecoded, '-6/') === false) continue;
            if (!preg_match('/\/(\d+_\d+_\d+_n\.)/i', $pDecoded, $pfm)) continue;
            $pIsThumbnail = preg_match('/_s\d+x\d+/', $pDecoded);
            if (!isset($photosByFile[$pfm[1]]) || !$pIsThumbnail) {
                $photosByFile[$pfm[1]] = $pDecoded;
            }
        }
        if (preg_match_all('/fbid[=:](\d{12,})/', $photoHtml, $newFbids)) {
            foreach ($newFbids[1] as $nfid) {
                if (!isset($allFoundFbids[$nfid])) {
                    $allFoundFbids[$nfid] = true;
                    $pendingFbids[] = $nfid;
                }
            }
        }
        $pSearchPos = 0;
        while (($pPos = strpos($photoHtml, $photoNeedle, $pSearchPos)) !== false) {
            $pSearchPos = $pPos + strlen($photoNeedle);
            $pChunk = substr($photoHtml, max(0, $pPos - 500), 1500);
            if (preg_match('/"id"\s*:\s*"(\d{12,})"/', $pChunk, $pidm)) {
                if (!isset($allFoundFbids[$pidm[1]])) {
                    $allFoundFbids[$pidm[1]] = true;
                    $pendingFbids[] = $pidm[1];
                }
            }
        }
    }
    curl_multi_close($mh);
}
foreach ($photosByFile as $fid => $url) {
    if (!isset($seen[$url])) { $images[] = $url; $seen[$url] = true; }
}

// Deduplicate by file ID
$finalByFileId = [];
foreach ($images as $img) {
    if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $img, $fm)) {
        $isThumbnail = preg_match('/_s\d+x\d+/', $img);
        if (!isset($finalByFileId[$fm[1]]) || !$isThumbnail) {
            $finalByFileId[$fm[1]] = $img;
        }
    } else {
        $finalByFileId[md5($img)] = $img;
    }
}
$images = array_values($finalByFileId);

echo json_encode(['images' => $images]);
