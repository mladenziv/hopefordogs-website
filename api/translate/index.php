<?php
// Translation proxy for the beheer admin (backfill tool + on-save auto-translate).
//
// Calls Google's free/keyless translate endpoint server-side, falling back to
// MyMemory. Running it on our own server (instead of fetching a public API from
// the browser) means it isn't tied to the visitor's per-IP rate limit, avoids
// CORS, and handles long text in a single request. No API key / secrets needed.
//
// Request:  GET or POST  q=<text>&to=<lang>&from=<lang, default nl>
// Response: {"translated":"...","engine":"google|mymemory"}  or  {"error":"..."}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) { $body = array(); }
$pick = function ($k, $d = '') use ($body) {
    if (isset($_REQUEST[$k])) return $_REQUEST[$k];
    if (isset($body[$k]))     return $body[$k];
    return $d;
};

$q    = (string) $pick('q', '');
$to   = (string) $pick('to', '');
$from = (string) $pick('from', 'nl');

if ($q === '' || !preg_match('/^[a-z]{2}$/', $to) || !preg_match('/^[a-z]{2}$/', $from)) {
    http_response_code(400);
    echo json_encode(array('error' => 'Bad request'));
    exit;
}
// Guard: keep the upstream query within a sane size (clients chunk anything long).
if (strlen($q) > 6000) { $q = substr($q, 0, 6000); }

function tp_http_get($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; HopeForDogs/1.0)',
        CURLOPT_HTTPHEADER     => array('Accept: application/json'),
    ));
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return array($code, $res);
}

// 1) Google (keyless gtx endpoint). Response: [[[translated, source, ...], ...], ...]
$gurl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' . urlencode($from)
      . '&tl=' . urlencode($to) . '&dt=t&q=' . urlencode($q);
list($gcode, $gres) = tp_http_get($gurl);
if ($gcode === 200 && $gres) {
    $data = json_decode($gres, true);
    if (is_array($data) && isset($data[0]) && is_array($data[0])) {
        $out = '';
        foreach ($data[0] as $seg) {
            if (isset($seg[0])) { $out .= $seg[0]; }
        }
        if ($out !== '') {
            echo json_encode(array('translated' => $out, 'engine' => 'google'), JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 2) Fallback: MyMemory
$murl = 'https://api.mymemory.translated.net/get?q=' . urlencode($q)
      . '&langpair=' . urlencode($from) . '|' . urlencode($to) . '&de=info@hopefordogseurope.com';
list($mcode, $mres) = tp_http_get($murl);
if ($mcode === 200 && $mres) {
    $data = json_decode($mres, true);
    $t = isset($data['responseData']['translatedText']) ? $data['responseData']['translatedText'] : '';
    if ($t !== '' && stripos($t, 'MYMEMORY WARNING') === false && stripos($t, 'QUERY LENGTH LIMIT') === false) {
        echo json_encode(array('translated' => $t, 'engine' => 'mymemory'), JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(502);
echo json_encode(array('error' => 'Translation upstream failed', 'google' => $gcode, 'mymemory' => $mcode));
