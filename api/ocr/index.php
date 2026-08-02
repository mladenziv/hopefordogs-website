<?php
// OCR / vision proxy for the beheer "Administratie".
//
// Sends an uploaded image to the Anthropic Messages API (Claude vision) and returns
// structured JSON: receipt fields, or a list of bank transactions.
//
// The secret ANTHROPIC_API_KEY lives in config.php (NOT in git — see .gitignore).
// Only a logged-in beheer admin may call this: we validate the caller's Supabase
// JWT against Supabase before spending the paid key.
//
// Request (POST JSON): { "kind":"receipt"|"bank", "image_base64":"...", "mime":"image/jpeg" }
// Header:              Authorization: Bearer <supabase access token>
// Response:            { "data": {...} }   or   { "error": "..." }

// Never let PHP notices/deprecations leak into the JSON response body (they still
// go to the server error log). PHP 8.5 on GoDaddy would otherwise corrupt output.
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_STRICT);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ---- config (secret key) ----
$cfg = __DIR__ . '/config.php';
if (!file_exists($cfg)) { http_response_code(500); echo json_encode(array('error' => 'OCR niet geconfigureerd (config.php ontbreekt op de server)')); exit; }
require $cfg;
if (!defined('ANTHROPIC_API_KEY') || strpos(ANTHROPIC_API_KEY, 'sk-ant-') !== 0) {
    http_response_code(500); echo json_encode(array('error' => 'ANTHROPIC_API_KEY niet ingesteld')); exit;
}
$MODEL = defined('OCR_MODEL') ? OCR_MODEL : 'claude-haiku-4-5-20251001';

// Public Supabase project details (same values as the frontend — not secret).
$SB   = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
$ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

// ---- auth: require a valid Supabase session (so the paid key can't be abused) ----
// Read the Authorization header robustly — some Apache/FastCGI setups (GoDaddy)
// expose it as REDIRECT_HTTP_AUTHORIZATION or only via getallheaders().
function ocr_auth_header() {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    if (function_exists('getallheaders')) { foreach (getallheaders() as $k => $v) { if (strcasecmp($k, 'Authorization') === 0) return $v; } }
    if (function_exists('apache_request_headers')) { foreach (apache_request_headers() as $k => $v) { if (strcasecmp($k, 'Authorization') === 0) return $v; } }
    return '';
}
$authz = ocr_auth_header();
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
$kind = isset($body['kind']) ? $body['kind'] : 'receipt';

// ---- build the message content per kind (ask for JSON only) ----
if ($kind === 'adopters' || $kind === 'bank_statement') {
    // TEXT mode: extract from a document's text (transport list, or a bank statement PDF)
    $text = isset($body['text']) ? (string) $body['text'] : '';
    if (trim($text) === '') { http_response_code(400); echo json_encode(array('error' => 'Geen tekst')); exit; }
    if (strlen($text) > 60000) { $text = substr($text, 0, 60000); }
    if ($kind === 'bank_statement') {
        $prompt = 'The text below is a bank account statement (ING, Netherlands; text may be in Dutch). Extract EVERY transaction. '
            . 'Respond with ONLY a JSON object and no other text: '
            . '{"transactions":[{"date":"YYYY-MM-DD","counterparty":"the other party name","amount":<positive number in euros>,"direction":"in or uit","description":"the payment description/notification text, or empty string"}]}. '
            . 'The +/- sign on the amount gives the direction: + = in (received), - = uit (paid). Convert dates from DD/MM/YYYY to YYYY-MM-DD. Text:' . "\n\n" . $text;
    } else {
        $prompt = 'The text below is a transport/adoption list for a dog rescue (often in Dutch). '
            . 'Extract every adopter/person. Respond with ONLY a JSON object and no other text: '
            . '{"adopters":[{"naam":"person name","bedrag":<number in euros or null>,"hond":"dog name or null"}]}. '
            . 'One entry per person who adopted or paid. Text:' . "\n\n" . $text;
    }
    $content = array(array('type' => 'text', 'text' => $prompt));
} else {
    // IMAGE mode: receipt or bank screenshot
    $img  = isset($body['image_base64']) ? (string) $body['image_base64'] : '';
    $mime = isset($body['mime']) ? (string) $body['mime'] : 'image/jpeg';
    if ($img === '') { http_response_code(400); echo json_encode(array('error' => 'Geen afbeelding')); exit; }
    if (strpos($img, 'base64,') !== false) { $img = substr($img, strpos($img, 'base64,') + 7); }
    if (!in_array($mime, array('image/jpeg', 'image/png', 'image/webp', 'image/gif'), true)) { $mime = 'image/jpeg'; }
    if ($kind === 'bank') {
        $year = isset($body['year']) ? intval($body['year']) : 0;
        $yearRule = ($year >= 2000 && $year <= 2100)
            ? 'EVERY transaction in this image is from the year ' . $year . '. Output each date as ' . $year . '-MM-DD, reading only the day and month from each row (mobile bank apps group by "1 August", "30 July" etc. without a year). '
            : 'ALWAYS output a full YYYY-MM-DD date: if a row shows only day and month, take the year from the statement header, or if no year is visible use the current calendar year (today is ' . date('Y-m-d') . '). ';
        $prompt = 'This image is a screenshot of one or more bank transactions (a Dutch bank; text may be in Dutch). '
            . 'Extract EVERY transaction you can see. Respond with ONLY a JSON object and no other text: '
            . '{"transactions":[{"date":"YYYY-MM-DD","counterparty":"the other party name","amount":<positive number in euros>,"direction":"in or uit"}]}. '
            . $yearRule
            . 'direction "in" = money received by the account holder, "uit" = money paid out.';
    } else {
        $prompt = 'This image is a photo of a receipt or invoice (often Serbian; amounts often in RSD dinar). '
            . 'Respond with ONLY a JSON object and no other text: '
            . '{"vendor":"shop or company name","date":"YYYY-MM-DD or null","currency":"RSD or EUR","total":<number, the total paid>,"vat":<number or null>,"invoice_no":"string or null","category_guess":"<one of: dierenarts, diervoeding, dierbenodigdheden, bouwmaterialen, gemengd, overig>","total_box":{"x":<number 0-1>,"y":<number 0-1>,"w":<number 0-1>,"h":<number 0-1>}}. '
            . 'Category meaning: dierenarts=vet/medical, diervoeding=pet food, dierbenodigdheden=pet supplies, bouwmaterialen=building materials, gemengd=mixed, overig=other. '
            . 'total_box is the bounding box around the printed TOTAL amount on the receipt, normalized 0-1 with the origin at the TOP-LEFT of the image (x=left edge, y=top edge, w=width, h=height). Draw it tightly around just the total price digits. If you cannot locate the total, set total_box to null.';
    }
    $content = array(
        array('type' => 'image', 'source' => array('type' => 'base64', 'media_type' => $mime, 'data' => $img)),
        array('type' => 'text', 'text' => $prompt),
    );
}

$payload = array(
    'model' => $MODEL,
    'max_tokens' => 4096,
    'messages' => array(array('role' => 'user', 'content' => $content)),
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
    echo json_encode(array('error' => 'OCR-dienst gaf een fout', 'code' => $code, 'detail' => substr((string) $res, 0, 300)));
    exit;
}

// pull the text out of the Anthropic response, then the JSON object out of that text
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
if ($parsed === null) { http_response_code(502); echo json_encode(array('error' => 'Kon OCR-uitvoer niet lezen', 'raw' => substr($text, 0, 300))); exit; }

echo json_encode(array('data' => $parsed), JSON_UNESCAPED_UNICODE);
