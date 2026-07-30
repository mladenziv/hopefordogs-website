<?php
// v8-surrogate
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['version' => 'v8-surrogate', 'php' => PHP_VERSION]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    http_response_code(405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$url = $input['url'] ?? '';
$originalUrl = $url;

if (empty($url) || strpos($url, 'facebook.com') === false) {
    echo json_encode(['error' => 'Invalid Facebook URL', 'text' => null]);
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

// Rank Facebook CDN image variants by ACTUAL served resolution so we keep the
// largest version of each photo. Facebook signs every sized variant separately
// (oh/oe), so we can't strip params for the original — we must pick the biggest
// URL already in the HTML. The real output size is the "scale-to" value: modern
// URLs put it in ctp=s{W}x{H}; older ones use _s{W}x{H} / _p{W}x{H}. IMPORTANT:
// cstp=mx{W}x{H} is only the max *canvas* and lies about size (a 160x160 crop
// can carry cstp=mx1500x1500), so it's only a last-resort fallback. Runs on a
// single URL string (never the whole HTML) → no PCRE backtrack risk.
function fbSizeScore($url) {
    if (preg_match('/[?&]ctp=[^&]*?(\d{2,5})x(\d{2,5})/', $url, $m)) return max((int)$m[1], (int)$m[2]);
    if (preg_match('#[_/][sp](\d{2,5})x(\d{2,5})#', $url, $m)) return max((int)$m[1], (int)$m[2]);
    if (preg_match('/[?&]cstp=[^&]*?(\d{2,5})x(\d{2,5})/', $url, $m)) return max((int)$m[1], (int)$m[2]);
    return 100000; // no scale markers at all → full-size original, rank highest
}

function cleanText($text) {
    // Convert literal \n and \t to real newlines/tabs
    $text = str_replace(['\\n', '\\t'], ["\n", "\t"], $text);
    // Unescape forward slashes (Facebook JSON escapes / as \/)
    $text = str_replace('\\/', '/', $text);
    // Decode HTML entities
    $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
    // Normalize unicode escapes (handle surrogate pairs for emoji)
    $text = preg_replace_callback('/\\\\u([0-9a-fA-F]{4})(?:\\\\u([0-9a-fA-F]{4}))?/', function ($m) {
        $cp = hexdec($m[1]);
        if ($cp >= 0xD800 && $cp <= 0xDBFF && isset($m[2])) {
            $lo = hexdec($m[2]);
            $cp = 0x10000 + (($cp - 0xD800) << 10) + ($lo - 0xDC00);
        } elseif ($cp >= 0xD800 && $cp <= 0xDFFF) {
            return "\xEF\xBF\xBD";
        }
        return mb_chr($cp, 'UTF-8');
    }, $text);
    // Normalize whitespace (preserve intentional line breaks)
    $text = preg_replace('/[ \t]+/', ' ', $text);
    $text = preg_replace('/\n{3,}/', "\n\n", $text);
    $text = trim($text);
    return $text;
}

function isBoilerplate($text) {
    $lower = mb_strtolower($text, 'UTF-8');
    $boilerplate = [
        'log in or sign up to view',
        'see more of',
        'join facebook',
        'create new account',
        'facebook helps you connect',
        'see posts, photos and more',
    ];
    foreach ($boilerplate as $phrase) {
        if (strpos($lower, $phrase) !== false) {
            return true;
        }
    }
    // Too short to be a real description
    if (mb_strlen($text, 'UTF-8') < 20) {
        return true;
    }
    return false;
}

function parseFields($text) {
    $result = ['naam' => null, 'ras' => null, 'leeftijd' => null, 'geslacht' => null];

    if (empty($text)) {
        return $result;
    }

    $t = $text;
    $tl = mb_strtolower($t, 'UTF-8');

    // --- Name ---
    // Pattern: "Naam: X" or "Name: X" or "Dit is X" or "Ovo je X" or "This is X"
    if (preg_match('/(?:naam|name|dit is|ovo je|this is|ime)[:\s]+([A-Z\x{0100}-\x{024F}][A-Za-z\x{0100}-\x{024F}]+)/iu', $t, $m)) {
        $result['naam'] = mb_convert_case(trim($m[1]), MB_CASE_TITLE, 'UTF-8');
    }
    // Pattern: ALL-CAPS name surrounded by emoji or on its own line (very common in shelter posts)
    // e.g. "🩷 AIRA 🩷" or "❤️ BELLA ❤️" or just "AIRA\n"
    // Use [^\n\r\p{L}\p{N}] instead of specific Unicode categories for server compatibility
    if (!$result['naam'] && preg_match('/(?:^|[\n\r])[^\n\r\p{L}\p{N}]*([A-Z\x{0100}-\x{024F}]{2,15})[^\n\r\p{L}\p{N}]*(?:[\n\r]|$)/u', $t, $m)) {
        $candidate = trim($m[1]);
        $skipUpper = ['UPDATE', 'INFO', 'HELP', 'URGENT', 'DRINGEND', 'ADOPTED', 'GEADOPTEERD',
                       'LOOKING', 'ZOEKEN', 'FOSTER', 'RESCUE', 'SHELTER', 'NEW', 'STICHTING',
                       'HOPE', 'DOGS', 'EUROPE', 'SHARE', 'PLEASE', 'HOME', 'FOREVER'];
        if (!in_array($candidate, $skipUpper)) {
            $result['naam'] = mb_convert_case($candidate, MB_CASE_TITLE, 'UTF-8');
        }
    }
    // Fallback: first capitalized word at start of text (common in shelter posts)
    if (!$result['naam'] && preg_match('/^[^\p{L}\p{N}]*([A-Z\x{0100}-\x{024F}][a-z\x{0100}-\x{024F}]{2,15})[\s,!\.\-]/u', $t, $m)) {
        // Skip common non-name words
        $skipWords = ['the', 'this', 'deze', 'een', 'het', 'hij', 'zij', 'wij', 'new', 'our', 'ons', 'onze',
                      'update', 'info', 'help', 'please', 'dringend', 'urgent', 'adopted', 'geadopteerd',
                      'looking', 'zoeken', 'foster', 'rescue', 'shelter', 'asiel', 'stichting',
                      'today', 'vandaag', 'just', 'nog', 'meer', 'more', 'lieve', 'sweet', 'beautiful',
                      'ovaj', 'ova', 'ovo', 'ovde', 'jos'];
        if (!in_array(mb_strtolower($m[1], 'UTF-8'), $skipWords)) {
            $result['naam'] = trim($m[1]);
        }
    }
    // Pattern: name in bold/quotes: **Name** or "Name" at start
    if (!$result['naam'] && preg_match('/(?:\*\*|"|„|")([A-Z\x{0100}-\x{024F}][A-Za-z\x{0100}-\x{024F}]{2,15})(?:\*\*|"|"|")/u', $t, $m)) {
        $result['naam'] = mb_convert_case(trim($m[1]), MB_CASE_TITLE, 'UTF-8');
    }

    // --- Breed ---
    // "ras: X" or "breed: X"
    if (preg_match('/(?:ras|breed|rasa)[:\s]+([^\n,\.]{2,40})/iu', $t, $m)) {
        $result['ras'] = trim($m[1]);
    }
    // Detect specific breed names (before trying generic kruising/mix)
    if (!$result['ras']) {
        $breeds = [
            'labrador', 'herder', 'shepherd', 'terrier', 'husky', 'beagle', 'boxer',
            'rottweiler', 'doberman', 'pitbull', 'pit bull', 'stafford', 'akita',
            'border collie', 'golden retriever', 'jack russell', 'malinois',
            'poodle', 'chihuahua', 'dachshund', 'teckel', 'bulldog', 'mastiff',
            'pointer', 'setter', 'spaniel', 'cocker', 'shih tzu', 'maltese',
            'pomeranian', 'samoyed', 'chow chow', 'dalmatian', 'dalmatiner',
            'tornjak', 'šarplaninac', 'sarplaninac',
        ];
        foreach ($breeds as $breed) {
            if (mb_stripos($tl, $breed) !== false) {
                // Check if it says "mix" or "kruising" nearby
                if (preg_match('/' . preg_quote($breed, '/') . '\s*(?:mix|kruising|mješanac)/iu', $t, $m)) {
                    $result['ras'] = trim($m[0]);
                } else {
                    $result['ras'] = ucfirst($breed);
                }
                break;
            }
        }
        // "kruising" or "mix" alone (no specific breed found nearby)
        if (!$result['ras']) {
            if (mb_stripos($tl, 'kruising') !== false || mb_stripos($tl, 'mješanac') !== false || mb_stripos($tl, 'mešanac') !== false) {
                $result['ras'] = 'Kruising';
            } elseif (preg_match('/\b(?:een|is|a)\s+mix\b/iu', $tl)) {
                $result['ras'] = 'Kruising';
            }
        }
    }

    // --- Age ---
    $agePatterns = [
        // "X jaar" / "X years" / "X godina"
        '/(\d{1,2})\s*(?:jaar|years?|godina|let)/iu',
        // "X maanden" / "X months" / "X mjeseci"
        '/(\d{1,2})\s*(?:maanden?|months?|mjesec[ia]?|mesec[ia]?)/iu',
        // "X weken" / "X weeks" / "X sedmica"
        '/(\d{1,2})\s*(?:weken|weeks?|sedmic[ae]?|nedelj[ae]?)/iu',
        // "leeftijd: X" / "age: X"
        '/(?:leeftijd|age|starost|dob)[:\s]+([^\n,]{2,20})/iu',
        // "geboren in 2022" / "born in 2022" / "rodjen 2022"
        '/(?:geboren|born|ro[dđ]en[a]?)\s+(?:in\s+)?(\d{4})/iu',
        // "puppy" / "štene"
        '/\b(puppy|pup|štene|štenad|welp)\b/iu',
    ];
    foreach ($agePatterns as $p) {
        if (preg_match($p, $t, $m)) {
            $age = trim($m[0]);
            // Normalize: "puppy" variants -> "Puppy"
            if (preg_match('/puppy|pup|štene|štenad|welp/i', $age)) {
                $result['leeftijd'] = 'Puppy';
            }
            // "geboren in YYYY" -> calculate age
            elseif (preg_match('/(\d{4})/', $age, $ym)) {
                $birthYear = (int)$ym[1];
                $currentYear = (int)date('Y');
                $years = $currentYear - $birthYear;
                if ($years > 0 && $years < 25) {
                    $result['leeftijd'] = $years . ' jaar';
                }
            }
            // "X maanden" -> "X maanden"
            elseif (preg_match('/(\d{1,2})\s*(?:maanden?|months?|mjesec|mesec)/i', $age, $am)) {
                $result['leeftijd'] = $am[1] . ' maanden';
            }
            // "X weken"
            elseif (preg_match('/(\d{1,2})\s*(?:weken|weeks?|sedmic|nedelj)/i', $age, $am)) {
                $result['leeftijd'] = $am[1] . ' weken';
            }
            // "X jaar" / "X years"
            elseif (preg_match('/(\d{1,2})\s*(?:jaar|years?|godina|let)/i', $age, $am)) {
                $result['leeftijd'] = $am[1] . ' jaar';
            }
            // Explicit "leeftijd: ..." value
            elseif (preg_match('/(?:leeftijd|age|starost|dob)[:\s]+(.+)/i', $age, $am)) {
                $result['leeftijd'] = trim($am[1]);
            }
            break;
        }
    }

    // --- Gender ---
    // Dutch: reu (male), teef/teefje (female)
    // Bosnian/Serbian: mužjak (male), ženka (female)
    if (preg_match('/\b(reu|male|mužjak|mušk[oa]|dečko)\b/iu', $tl)) {
        $result['geslacht'] = 'reu';
    } elseif (preg_match('/\b(teef|teefje|female|ženka|žensk[oa]|djevojčica|devojčica|cura)\b/iu', $tl)) {
        $result['geslacht'] = 'teefje';
    }
    // Pronoun hints: hij/hem/zijn -> male, zij/haar -> female
    if (!$result['geslacht']) {
        $maleCount = preg_match_all('/\b(hij|hem|zijn|his|him|he)\b/iu', $tl);
        $femaleCount = preg_match_all('/\b(zij|ze|haar|she|her|hers)\b/iu', $tl);
        if ($maleCount > 0 && $maleCount > $femaleCount) {
            $result['geslacht'] = 'reu';
        } elseif ($femaleCount > 0 && $femaleCount > $maleCount) {
            $result['geslacht'] = 'teefje';
        }
    }

    return $result;
}

$html = fetchWithRedirects($url);

if (empty($html)) {
    echo json_encode(['error' => 'Could not fetch page', 'text' => null]);
    exit;
}

// Multi-photo posts only server-render ~5 of N photos in the post HTML. The full
// set lives at the post's photo-set page (set=pcb.<id>). Fetch it and fold it
// into the image/fbid scans so we discover every photo (and every photo fbid,
// which then gets upgraded to full-res by the photo-page traversal below).
// Use the pcb. set (this post's photos) — NOT set=a.<id>, which is the page's
// entire album. Kept in a separate var so the post text/video detection (which
// read $html) are unaffected; only the image + fbid scans read $imgHtml.
$imgHtml = $html;
$setFileIds = [];
if (preg_match('/set=(pcb\.\d+)/', $html, $setMatch)) {
    $setHtml = fetchWithRedirects('https://www.facebook.com/media/set/?set=' . $setMatch[1]);
    if (!empty($setHtml)) {
        $imgHtml .= "\n" . $setHtml;
        // The set page lists EXACTLY this post's photos. Record their file-ids so
        // we can bound the final list to them — the photo-page traversal below
        // can otherwise wander into unrelated photos and over-pull.
        if (preg_match_all('#-6/(\d+_\d+_\d+_n\.)#', str_replace('\\/', '/', $setHtml), $sfm)) {
            foreach ($sfm[1] as $sfid) { $setFileIds[$sfid] = true; }
        }
    }
}

$text = null;

// Strategy 1: og:description meta tag (most reliable for public posts)
if (!$text) {
    // property before content
    if (preg_match('/<meta\s+(?:property|name)=["\']og:description["\']\s+content=["\']([^"\']+)["\']/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
    // content before property
    if (!$text && preg_match('/<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:description["\']/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
}

// Strategy 2: Standard description meta tag
if (!$text) {
    if (preg_match('/<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
    if (!$text && preg_match('/<meta\s+content=["\']([^"\']+)["\']\s+name=["\']description["\']/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
}

// Strategy 3: JSON-LD articleBody
if (!$text) {
    if (preg_match('/"articleBody"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
}

// Strategy 4: Facebook inline JSON message text
if (!$text) {
    if (preg_match('/"message"\s*:\s*\{\s*"text"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
}

// Strategy 5: twitter:description meta tag
if (!$text) {
    if (preg_match('/<meta\s+(?:property|name)=["\']twitter:description["\']\s+content=["\']([^"\']+)["\']/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
    if (!$text && preg_match('/<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']twitter:description["\']/i', $html, $m)) {
        $candidate = cleanText($m[1]);
        if (!isBoilerplate($candidate)) {
            $text = $candidate;
        }
    }
}

// Extract images from og:image meta tags
$images = [];
$seen = [];
if (preg_match_all('/<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)["\']/i', $html, $imgMatches)) {
    foreach ($imgMatches[1] as $imgUrl) {
        $decoded = html_entity_decode($imgUrl, ENT_QUOTES, 'UTF-8');
        if (strpos($decoded, 'safe_image.php') !== false) continue;
        if (strpos($decoded, '1x1') !== false) continue;
        if (!isset($seen[$decoded])) {
            $images[] = $decoded;
            $seen[$decoded] = true;
        }
    }
}
if (preg_match_all('/<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']/i', $html, $imgMatches)) {
    foreach ($imgMatches[1] as $imgUrl) {
        $decoded = html_entity_decode($imgUrl, ENT_QUOTES, 'UTF-8');
        if (strpos($decoded, 'safe_image.php') !== false) continue;
        if (strpos($decoded, '1x1') !== false) continue;
        if (!isset($seen[$decoded])) {
            $images[] = $decoded;
            $seen[$decoded] = true;
        }
    }
}
// Step 1: Extract photo fbids from the post HTML
// Facebook only renders ~5 photos server-side; we'll fetch photo pages to find the rest
$photoFbids = [];
$searchPos = 0;
$photoNeedle = '"__typename":"Photo"';
while (($pos = strpos($imgHtml, $photoNeedle, $searchPos)) !== false) {
    $searchPos = $pos + strlen($photoNeedle);
    $chunk = substr($imgHtml, max(0, $pos - 500), 1500);
    if (preg_match('/"id"\s*:\s*"(\d{12,})"/', $chunk, $idm)) {
        $photoFbids[$idm[1]] = true;
    }
}
// Also extract from fbid= links
if (preg_match_all('/fbid[=:](\d{12,})/', $imgHtml, $fbidMatches)) {
    foreach ($fbidMatches[1] as $fid) {
        $photoFbids[$fid] = true;
    }
}

// Step 2: Collect post photo URIs from the post HTML (only actual post photos, not profile pics)
// Post photos use path /t39.30808-6/, profile pics use /t39.30808-1/ or /t1.6435-1/
$postFileIds = [];
$uriNeedle = '"uri":"';
$uriNeedleLen = strlen($uriNeedle);
$uriPos = 0;
$photosByFile = [];
while (($uriPos = strpos($imgHtml, $uriNeedle, $uriPos)) !== false) {
    $uriStart = $uriPos + $uriNeedleLen;
    $uriEnd = strpos($imgHtml, '"', $uriStart);
    if ($uriEnd === false) break;
    $rawUrl = substr($imgHtml, $uriStart, $uriEnd - $uriStart);
    $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $rawUrl);
    $uriPos = $uriEnd + 1;

    // Only include actual post photos (path contains -6/), skip profile pics (-1/)
    if (strpos($decoded, '-6/') === false) continue;
    if (!preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) continue;
    $fileId = $fm[1];
    $postFileIds[$fileId] = true;

    // Keep the highest-resolution variant of each photo.
    if (!isset($photosByFile[$fileId]) || fbSizeScore($decoded) > fbSizeScore($photosByFile[$fileId])) {
        $photosByFile[$fileId] = $decoded;
    }
}

// Filter existing og:image results to only post photos
$filteredImages = [];
foreach ($images as $img) {
    if (strpos($img, '-6/') !== false || strpos($img, 'stp=') !== false) {
        $filteredImages[] = $img;
    }
}
$images = $filteredImages;
// Rebuild seen list
$seen = [];
foreach ($images as $img) { $seen[$img] = true; }

// Add photos found via URI scanning
foreach ($photosByFile as $fid => $url) {
    if (!isset($seen[$url])) {
        $images[] = $url;
        $seen[$url] = true;
    }
}

// Step 3: Fetch individual photo pages to discover ALL photos in the post
// Facebook only puts ~5 photos in the post HTML; the rest need individual fetches
// Each photo page contains the image + next/prev photo IDs
$allFoundFbids = $photoFbids;
$pendingFbids = array_keys($photoFbids);
$fetchedFbids = [];
$maxFetches = 25; // safety limit
$fetchCount = 0;
$_debugPhotoFetches = [];

while (!empty($pendingFbids) && $fetchCount < $maxFetches) {
    // Batch fetch up to 5 photo pages at a time using curl_multi
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
            CURLOPT_SSL_VERIFYPEER => false,
        ]);
        $handles[$fbid] = $ch;
        curl_multi_add_handle($mh, $ch);
    }

    // Execute all requests in parallel
    do {
        $status = curl_multi_exec($mh, $active);
        if ($active) {
            curl_multi_select($mh, 1);
        }
    } while ($active && $status == CURLM_OK);

    // Process results
    foreach ($handles as $fbid => $ch) {
        $photoHtml = curl_multi_getcontent($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);

        $debugEntry = [
            'fbid' => $fbid,
            'httpCode' => $httpCode,
            'htmlLen' => strlen($photoHtml ?: ''),
            'error' => $curlError ?: null,
            'hasPhotoData' => $photoHtml ? (strpos($photoHtml, '__typename":"Photo"') !== false) : false,
            'isErrorPage' => $photoHtml ? (strpos($photoHtml, 'Sorry, something went wrong') !== false) : true,
        ];

        if (empty($photoHtml) || strlen($photoHtml) < 5000) {
            $debugEntry['snippet'] = substr($photoHtml ?: '', 0, 300);
            $_debugPhotoFetches[] = $debugEntry;
            continue;
        }

        // Extract post photo URIs (only -6/ path = actual photos)
        $newPhotosFound = 0;
        $pOffset = 0;
        while (preg_match('/"uri"\s*:\s*"(https:[^"]+)"/i', $photoHtml, $pum, PREG_OFFSET_CAPTURE, $pOffset)) {
            $pDecoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $pum[1][0]);
            $pOffset = $pum[0][1] + strlen($pum[0][0]);
            if (strpos($pDecoded, '-6/') === false) continue;
            if (!preg_match('/\/(\d+_\d+_\d+_n\.)/i', $pDecoded, $pfm)) continue;
            $pFileId = $pfm[1];
            if (!isset($photosByFile[$pFileId]) || fbSizeScore($pDecoded) > fbSizeScore($photosByFile[$pFileId])) {
                $photosByFile[$pFileId] = $pDecoded;
                $newPhotosFound++;
            }
        }
        $debugEntry['newPhotos'] = $newPhotosFound;

        // Discover new photo fbids from this page
        $newFbidsFound = [];
        if (preg_match_all('/fbid[=:](\d{12,})/', $photoHtml, $newFbids)) {
            foreach ($newFbids[1] as $nfid) {
                if (!isset($allFoundFbids[$nfid])) {
                    $allFoundFbids[$nfid] = true;
                    $pendingFbids[] = $nfid;
                    $newFbidsFound[] = $nfid;
                }
            }
        }
        // Also check "id" fields near Photo typename
        $pSearchPos = 0;
        while (($pPos = strpos($photoHtml, $photoNeedle, $pSearchPos)) !== false) {
            $pSearchPos = $pPos + strlen($photoNeedle);
            $pChunk = substr($photoHtml, max(0, $pPos - 500), 1500);
            if (preg_match('/"id"\s*:\s*"(\d{12,})"/', $pChunk, $pidm)) {
                if (!isset($allFoundFbids[$pidm[1]])) {
                    $allFoundFbids[$pidm[1]] = true;
                    $pendingFbids[] = $pidm[1];
                    $newFbidsFound[] = $pidm[1];
                }
            }
        }
        $debugEntry['newFbids'] = $newFbidsFound;
        $_debugPhotoFetches[] = $debugEntry;
    }
    curl_multi_close($mh);
}

// Add all newly discovered photos to the image list
foreach ($photosByFile as $fid => $url) {
    if (!isset($seen[$url])) {
        $images[] = $url;
        $seen[$url] = true;
    }
}

// Deduplicate by file ID (keep the best URL for each)
$finalByFileId = [];
foreach ($images as $img) {
    if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $img, $fm)) {
        $fid = $fm[1];
        if (!isset($finalByFileId[$fid]) || fbSizeScore($img) > fbSizeScore($finalByFileId[$fid])) {
            $finalByFileId[$fid] = $img;
        }
    } else {
        $finalByFileId[md5($img)] = $img;
    }
}
$images = array_values($finalByFileId);

// If we found this post's photo set, bound the results to exactly those photos.
// The photo-page traversal can wander into unrelated photos (next/prev links go
// beyond the post), so without this a 10-photo post could return 20+ images.
if (!empty($setFileIds)) {
    $bounded = [];
    foreach ($images as $img) {
        if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $img, $bm) && isset($setFileIds[$bm[1]])) {
            $bounded[] = $img;
        }
    }
    if (!empty($bounded)) {
        $images = $bounded;
    }
}

$seen = [];
foreach ($images as $img) { $seen[$img] = true; }

// For reels/video posts, skip images (they're just video thumbnails)
$isReel = strpos($originalUrl, '/reel/') !== false || strpos($originalUrl, '/watch/') !== false;
if ($isReel) {
    $images = [];
}

// Fetch images server-side and return as base64 (Facebook CDN URLs are session-bound)
// Use curl_multi for parallel downloading
$imageData = [];
$imgChunks = array_chunk($images, 5);
foreach ($imgChunks as $chunk) {
    $mh = curl_multi_init();
    $handles = [];
    foreach ($chunk as $idx => $imgUrl) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $imgUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ]);
        $handles[$idx] = $ch;
        curl_multi_add_handle($mh, $ch);
    }
    do {
        $status = curl_multi_exec($mh, $active);
        if ($active) curl_multi_select($mh, 1);
    } while ($active && $status == CURLM_OK);
    foreach ($handles as $idx => $ch) {
        $imgData = curl_multi_getcontent($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/jpeg';
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
        if ($httpCode === 200 && !empty($imgData) && strlen($imgData) > 1000) {
            $imageData[] = 'data:' . $contentType . ';base64,' . base64_encode($imgData);
        }
    }
    curl_multi_close($mh);
}

// Extract videos
$videos = [];
$seenVideos = [];
// Treat as a video post for reels/watch/videos and share links (which redirect
// to those), and — most reliably — whenever the page itself contains a native
// video URL. Share links (/share/v/, /share/r/) don't have /reel/ or /watch/ in
// the URL, so detect the markers directly.
$isVideoPost = strpos($originalUrl, '/reel/') !== false
    || strpos($originalUrl, '/watch/') !== false
    || strpos($originalUrl, '/videos/') !== false
    || strpos($originalUrl, '/share/v/') !== false
    || strpos($originalUrl, '/share/r/') !== false
    || strpos($html, 'browser_native_hd_url') !== false
    || strpos($html, 'browser_native_sd_url') !== false
    || strpos($html, 'playable_url') !== false;

// og:video meta tags indicate this is a video post
if (preg_match_all('/<meta\s+(?:property|name)=["\']og:video(?::url)?["\']\s+content=["\']([^"\']+)["\']/i', $html, $vidMatches)) {
    foreach ($vidMatches[1] as $vidUrl) {
        $decoded = html_entity_decode($vidUrl, ENT_QUOTES, 'UTF-8');
        $vHost = parse_url($decoded, PHP_URL_HOST);
        if ($vHost && (strpos($vHost, 'facebook.com') !== false || strpos($vHost, 'fb.com') !== false)) continue;
        if (!isset($seenVideos[$decoded])) { $videos[] = $decoded; $seenVideos[$decoded] = true; $isVideoPost = true; }
    }
}
if (preg_match_all('/<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:video(?::url)?["\']/i', $html, $vidMatches)) {
    foreach ($vidMatches[1] as $vidUrl) {
        $decoded = html_entity_decode($vidUrl, ENT_QUOTES, 'UTF-8');
        $vHost = parse_url($decoded, PHP_URL_HOST);
        if ($vHost && (strpos($vHost, 'facebook.com') !== false || strpos($vHost, 'fb.com') !== false)) continue;
        if (!isset($seenVideos[$decoded])) { $videos[] = $decoded; $seenVideos[$decoded] = true; $isVideoPost = true; }
    }
}
// Look for inline JSON video URLs for video posts and reels
if ($isVideoPost) {
    foreach (['"playable_url_quality_hd"', '"browser_native_hd_url"', '"playable_url"', '"browser_native_sd_url"'] as $pattern) {
        if (preg_match('/' . preg_quote($pattern, '/') . '\s*:\s*"(https:[^"]+)"/i', $html, $vidMatch)) {
            $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $vidMatch[1]);
            if ($decoded !== 'https:' && strlen($decoded) > 20 && !isset($seenVideos[$decoded])) {
                array_unshift($videos, $decoded);
                $seenVideos[$decoded] = true;
            }
        }
    }
}
$videos = array_slice($videos, 0, 3);

// Try to get full untruncated text from JSON using strpos (no regex, no crash risk)
$needle = '"message":{"text":"';
$msgPos = strpos($html, $needle);
if ($msgPos !== false) {
    $start = $msgPos + strlen($needle);
    // Walk forward to find the closing quote (skip escaped quotes)
    $end = $start;
    $len = strlen($html);
    while ($end < $len) {
        if ($html[$end] === '"' && $html[$end - 1] !== '\\') break;
        $end++;
    }
    if ($end > $start) {
        $rawMsg = substr($html, $start, $end - $start);
        $cleaned = cleanText($rawMsg);
        // Only replace if JSON text is longer (og:description is often truncated)
        // For reels/videos, accept short text (captions can be just a name)
        $isReel = strpos($originalUrl, '/reel/') !== false || strpos($originalUrl, '/watch/') !== false;
        if (($isReel || !isBoilerplate($cleaned)) && (!$text || mb_strlen($cleaned, 'UTF-8') > mb_strlen($text, 'UTF-8'))) {
            $text = $cleaned;
        }
    }
}

// Parse structured dog fields from text
$fields = parseFields($text);
$result = array_merge(['text' => $text, 'images' => $images, 'image_data' => $imageData, 'videos' => $videos], $fields);
// Include debug info about photo page fetches (temporary, for troubleshooting)
if (!empty($_debugPhotoFetches)) {
    $result['_debug_photo_fetches'] = $_debugPhotoFetches;
    $result['_debug_initial_fbids'] = array_keys($photoFbids);
    $result['_debug_total_fbids_found'] = count($allFoundFbids);
}
// Always-on counts so we can see WHERE photos are lost (set page vs traversal vs download).
$result['_debug_counts'] = array(
    'set_link_found'   => !empty($setFileIds),      // did the post HTML contain set=pcb.<id>?
    'set_fileids'      => count($setFileIds),         // photos the set page listed (0 = set page blocked/empty)
    'fbids_found'      => count($allFoundFbids),      // total photo IDs discovered
    'images_urls'      => count($images),             // photo URLs after bounding
    'image_data'       => count($imageData),          // photos actually downloaded & returned
);
echo json_encode($result);
