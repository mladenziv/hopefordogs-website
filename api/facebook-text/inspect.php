<?php
// TEMPORARY: album-set fetch experiment. Given a post URL, find its set ids
// (a.<id> / pcb.<id>) and see how many photos the media/set page exposes to an
// anonymous server (www + mbasic), to decide if it beats the ~5 inline cap.
// Retire to a stub when done.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$url = isset($_REQUEST['url']) ? $_REQUEST['url'] : '';
if ($url === '' || strpos($url, 'facebook.com') === false) {
    echo json_encode(array('error' => 'pass ?url=<facebook post url>'));
    exit;
}

function ins_fetch($u) {
    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $u,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => array(
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: nl,en;q=0.5',
            'Sec-Fetch-Dest: document', 'Sec-Fetch-Mode: navigate', 'Sec-Fetch-Site: none', 'Sec-Fetch-User: ?1',
        ),
    ));
    $html = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return array($code, $html ?: '');
}

// Count distinct post-photo file-ids in a haystack (all CDN buckets), plus login-wall signal.
function ins_photos($html) {
    $norm = preg_replace('#\\\\+/#', '/', $html);
    preg_match_all('#https://[^"\s<]*/t39\.\d+-6/(\d+_\d+_\d+_n)\.[a-z0-9]+[^"\s<]*#i', $norm, $m);
    $byfid = array();
    foreach ($m[0] as $k => $u) { $byfid[$m[1][$k]] = html_entity_decode($u, ENT_QUOTES, 'UTF-8'); }
    $lower = strtolower($html);
    return array(
        'http_len' => strlen($html),
        'distinct_photos' => count($byfid),
        'sample' => array_slice(array_values($byfid), 0, 3),
        'looks_login_walled' => (strlen($html) < 8000) || (strpos($lower, 'log in to facebook') !== false) || (strpos($lower, 'you must log in') !== false),
    );
}

list($pc, $ph) = ins_fetch($url);

// Find set ids in the post HTML
$sets = array();
if (preg_match('/set=(pcb\.\d+)/', $ph, $mm)) $sets['pcb'] = $mm[1];
if (preg_match('/set=(a\.\d+)/', $ph, $mm)) $sets['a'] = $mm[1];

$out = array(
    'post' => array('http' => $pc) + ins_photos($ph),
    'sets_found' => $sets,
    'tests' => array(),
);

foreach ($sets as $label => $setId) {
    foreach (array('www' => 'https://www.facebook.com/media/set/?set=' . $setId,
                   'mbasic' => 'https://mbasic.facebook.com/media/set/?set=' . $setId) as $host => $setUrl) {
        list($sc, $sh) = ins_fetch($setUrl);
        $out['tests'][$label . '_' . $host] = array('url' => $setUrl, 'http' => $sc) + ins_photos($sh);
    }
}

echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
