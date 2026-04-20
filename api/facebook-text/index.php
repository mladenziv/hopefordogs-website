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

function cleanText($text) {
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
// Step 1: Find post photo file IDs via "__typename":"Photo" entries
$searchPos = 0;
$photoNeedle = '"__typename":"Photo"';
$postFileIds = [];
foreach ($images as $img) {
    if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $img, $fm)) {
        $postFileIds[$fm[1]] = true;
    }
}
while (($pos = strpos($html, $photoNeedle, $searchPos)) !== false) {
    $searchPos = $pos + strlen($photoNeedle);
    $chunk = substr($html, $pos, 500);
    if (preg_match('/"uri":\s*"(https:[^"]+)"/i', $chunk, $um)) {
        $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $um[1]);
        if (preg_match('/\/(\d+_\d+_\d+_n\.)/i', $decoded, $fm)) {
            $postFileIds[$fm[1]] = true;
        }
    }
}

// Step 2: Scan ALL "uri" fields in the HTML for these file IDs, prefer full-size
$uriNeedle = '"uri":"';
$uriNeedleLen = strlen($uriNeedle);
$uriPos = 0;
$photosByFile = [];
while (($uriPos = strpos($html, $uriNeedle, $uriPos)) !== false) {
    $uriStart = $uriPos + $uriNeedleLen; // points to start of URL
    $uriEnd = strpos($html, '"', $uriStart);
    if ($uriEnd === false) break;
    $rawUrl = substr($html, $uriStart, $uriEnd - $uriStart);
    $decoded = str_replace(['\\/', '\\u0025'], ['/', '%'], $rawUrl);
    $uriPos = $uriEnd + 1;

    // Only process URLs that match our post photo file IDs
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
$images = array_slice($images, 0, 10);

// Fetch images server-side and return as base64 (Facebook CDN URLs are session-bound)
$imageData = [];
foreach ($images as $imgUrl) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $imgUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ]);
    $imgData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/jpeg';
    curl_close($ch);
    if ($httpCode === 200 && !empty($imgData) && strlen($imgData) > 1000) {
        $imageData[] = 'data:' . $contentType . ';base64,' . base64_encode($imgData);
    }
}

// Extract videos
$videos = [];
$seenVideos = [];
$isVideoPost = strpos($url, '/reel/') !== false || strpos($url, '/watch/') !== false;

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
        if (!isBoilerplate($cleaned) && (!$text || mb_strlen($cleaned, 'UTF-8') > mb_strlen($text, 'UTF-8'))) {
            $text = $cleaned;
        }
    }
}

// Debug mode
$debug = $input['debug'] ?? false;
$debugInfo = null;
if ($debug) {
    $debugInfo = ['html_length' => strlen($html), 'is_video_post' => $isVideoPost];
    // Check for video patterns
    foreach (['"playable_url_quality_hd"', '"browser_native_hd_url"', '"playable_url"', '"browser_native_sd_url"'] as $p) {
        $debugInfo['has_' . trim($p, '"')] = strpos($html, $p) !== false;
    }
    // Check for message text
    $debugInfo['has_message_text'] = strpos($html, '"message":{"text":"') !== false;
    // Find og:description
    $debugInfo['has_og_description'] = strpos($html, 'og:description') !== false;
    // Find any video CDN URLs
    preg_match_all('/video-[a-z0-9-]+\.xx\.fbcdn\.net/', $html, $vcdn);
    $debugInfo['video_cdn_domains'] = count(array_unique($vcdn[0] ?? []));
    // Sample of what's around browser_native_hd_url
    $ppos = strpos($html, 'browser_native_hd_url');
    if ($ppos !== false) {
        $debugInfo['hd_url_context'] = substr($html, max(0,$ppos-10), 300);
    }
    // Check message text context
    $mpos = strpos($html, '"message":{"text":"');
    if ($mpos !== false) {
        $debugInfo['message_context'] = substr($html, $mpos, 200);
    }
    // Check the URL we received
    $debugInfo['input_url'] = $url;
}

// Parse structured dog fields from text
$fields = parseFields($text);
$result = array_merge(['text' => $text, 'images' => $images, 'image_data' => $imageData, 'videos' => $videos], $fields);
if ($debug) $result['debug'] = $debugInfo;
echo json_encode($result);
