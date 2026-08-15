<?php
// Karakteromschrijving generator for the beheer "Aanbiedingen" pipeline.
//
// Takes a dog's raw description and returns (a) a fun, positive, enthusiastic
// Dutch character text for the external listing sites, and (b) the breed —
// detected from the description if clearly stated, otherwise "Mix".
//
// Reuses the Anthropic key from ../ocr/config.php (NOT in git). Auth-gated on a
// valid Supabase session, exactly like ocr/index.php, so the paid key can't be
// abused by anonymous callers.
//
// Request (POST JSON): { "naam": "...", "beschrijving": "..." }
// Header:              Authorization: Bearer <supabase access token>
// Response:            { "karakter": "...", "ras": "..." }  or  { "error": "..." }

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_STRICT);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ---- config (secret key, shared with the OCR endpoint) ----
$cfg = __DIR__ . '/../ocr/config.php';
if (!file_exists($cfg)) { http_response_code(500); echo json_encode(array('error' => 'Niet geconfigureerd (api/ocr/config.php ontbreekt)')); exit; }
require $cfg;
if (!defined('ANTHROPIC_API_KEY') || strpos(ANTHROPIC_API_KEY, 'sk-ant-') !== 0) {
    http_response_code(500); echo json_encode(array('error' => 'ANTHROPIC_API_KEY niet ingesteld')); exit;
}
$MODEL = defined('OCR_MODEL') ? OCR_MODEL : 'claude-haiku-4-5-20251001';

// Public Supabase project details (same values as the frontend — not secret).
$SB   = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
$ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

// ---- auth: require a valid Supabase session (paid key) ----
function kar_auth_header() {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    if (function_exists('getallheaders')) { foreach (getallheaders() as $k => $v) { if (strcasecmp($k, 'Authorization') === 0) return $v; } }
    if (function_exists('apache_request_headers')) { foreach (apache_request_headers() as $k => $v) { if (strcasecmp($k, 'Authorization') === 0) return $v; } }
    return '';
}
$authz = kar_auth_header();
if (stripos($authz, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(array('error' => 'Niet ingelogd')); exit; }
$jwt = substr($authz, 7);
$uch = curl_init($SB . '/auth/v1/user');
curl_setopt_array($uch, array(
    CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER => array('Authorization: Bearer ' . $jwt, 'apikey: ' . $ANON),
));
curl_exec($uch); $ucode = curl_getinfo($uch, CURLINFO_HTTP_CODE);
if ($ucode !== 200) { http_response_code(401); echo json_encode(array('error' => 'Sessie ongeldig — log opnieuw in')); exit; }

// ---- input ----
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) { http_response_code(400); echo json_encode(array('error' => 'Bad request')); exit; }
$naam = isset($body['naam']) ? trim((string) $body['naam']) : '';
$beschrijving = isset($body['beschrijving']) ? trim((string) $body['beschrijving']) : '';
if ($beschrijving === '') { http_response_code(400); echo json_encode(array('error' => 'Geen beschrijving')); exit; }
if (strlen($beschrijving) > 6000) { $beschrijving = substr($beschrijving, 0, 6000); }

// ---- prompt ----
$prompt = 'Je bent copywriter voor hondenasiel/rescue "Stichting Hope for Dogs Europe". '
    . 'Op basis van onderstaande info over een hond, geef je UITSLUITEND een JSON-object terug (geen andere tekst) met deze velden:'
    . "\n" . '{"karakter":"...","ras":"...","geslacht":"reu|teefje|null","leeftijd_jaar":<geheel getal of null>,"leeftijd_maand":<geheel getal of null>}'
    . "\n\n" . 'Regels per veld:'
    . "\n" . '- karakter: een KORTE, vrolijke, positieve en enthousiaste karakteromschrijving in het Nederlands die adoptanten warm maakt (60-120 woorden, warme oprechte toon, spreek de hond bij naam aan, wees eerlijk — verzin geen medische claims of eigenschappen die niet in de info staan, geen aanhef/afsluiting, max 1 emoji).'
    . "\n" . '- ras: als er duidelijk een ras in de info staat gebruik dat, anders exact "Mix".'
    . "\n" . '- geslacht: "reu" (mannelijk) of "teefje" (vrouwelijk) als dat blijkt uit de info (naam, "hij/zij", "reu/teef"), anders null.'
    . "\n" . '- leeftijd_jaar / leeftijd_maand: haal de leeftijd uit de info. "1 jaar" => leeftijd_jaar=1, leeftijd_maand=null. "6 maanden" => leeftijd_jaar=null, leeftijd_maand=6. "1 jaar en 6 maanden" => leeftijd_jaar=1, leeftijd_maand=6. Onbekend => beide null.'
    . "\n\n" . 'Naam: ' . ($naam !== '' ? $naam : 'onbekend') . "\nInfo:\n" . $beschrijving;

$payload = array(
    'model' => $MODEL,
    'max_tokens' => 1500,
    'messages' => array(array('role' => 'user', 'content' => array(array('type' => 'text', 'text' => $prompt)))),
);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60, CURLOPT_CONNECTTIMEOUT => 15, CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => array('Content-Type: application/json', 'x-api-key: ' . ANTHROPIC_API_KEY, 'anthropic-version: 2023-06-01'),
    CURLOPT_POSTFIELDS => json_encode($payload),
));
$res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($code !== 200 || !$res) {
    http_response_code(502);
    echo json_encode(array('error' => 'AI-dienst gaf een fout', 'code' => $code, 'detail' => substr((string) $res, 0, 300)));
    exit;
}

$data = json_decode($res, true);
$text = '';
if (isset($data['content']) && is_array($data['content'])) {
    foreach ($data['content'] as $blk) { if (isset($blk['type']) && $blk['type'] === 'text') { $text .= $blk['text']; } }
}
$parsed = null;
if ($text !== '') {
    $start = strpos($text, '{'); $end = strrpos($text, '}');
    if ($start !== false && $end !== false && $end > $start) { $parsed = json_decode(substr($text, $start, $end - $start + 1), true); }
}
if (!is_array($parsed) || !isset($parsed['karakter'])) {
    http_response_code(502); echo json_encode(array('error' => 'Kon AI-uitvoer niet lezen', 'raw' => substr($text, 0, 300))); exit;
}

$ras = isset($parsed['ras']) && trim((string) $parsed['ras']) !== '' ? trim((string) $parsed['ras']) : 'Mix';
$geslacht = isset($parsed['geslacht']) ? strtolower(trim((string) $parsed['geslacht'])) : '';
if ($geslacht !== 'reu' && $geslacht !== 'teefje') { $geslacht = null; }
$lj = (isset($parsed['leeftijd_jaar']) && $parsed['leeftijd_jaar'] !== null && $parsed['leeftijd_jaar'] !== '') ? intval($parsed['leeftijd_jaar']) : null;
$lm = (isset($parsed['leeftijd_maand']) && $parsed['leeftijd_maand'] !== null && $parsed['leeftijd_maand'] !== '') ? intval($parsed['leeftijd_maand']) : null;
echo json_encode(array(
    'karakter' => trim((string) $parsed['karakter']),
    'ras' => $ras,
    'geslacht' => $geslacht,
    'leeftijd_jaar' => $lj,
    'leeftijd_maand' => $lm,
), JSON_UNESCAPED_UNICODE);
