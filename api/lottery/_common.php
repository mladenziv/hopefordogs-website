<?php
// Shared helpers for the lottery endpoints.
// Reuses the existing server-side config:
//   - Mollie key/URL      (api/mollie/config.php)     : MOLLIE_API_KEY, MOLLIE_API_URL, SITE_URL
//   - Supabase service key (api/social-media/config.php): SUPABASE_URL, SUPABASE_SERVICE_KEY
// Both files are placed on the server and gitignored.

require_once __DIR__ . '/../mollie/config.php';
require_once __DIR__ . '/../social-media/config.php';

// Emit JSON and stop.
function jsonOut($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// ---- Mollie (same request helper used by api/mollie/*) ----
function mollieRequest($method, $endpoint, $data = null) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => MOLLIE_API_URL . $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . MOLLIE_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true) ?: [];
}

function mollieConfigured() {
    return !(MOLLIE_API_KEY === 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || empty(MOLLIE_API_KEY));
}

// ---- Supabase REST via the service_role key (bypasses RLS) ----
// $path is everything after /rest/v1/ (table + query string).
// Returns ['code' => int, 'body' => mixed].
function sbRequest($method, $path, $data = null, $prefer = null) {
    $headers = [
        'apikey: ' . SUPABASE_SERVICE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json',
    ];
    if ($prefer) $headers[] = 'Prefer: ' . $prefer;

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => rtrim(SUPABASE_URL, '/') . '/rest/v1/' . $path,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    if ($data !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => json_decode($resp, true)];
}

// Fetch one lottery by id (service key). Returns the row array or null.
function fetchLottery($id) {
    $r = sbRequest('GET', 'lotteries?id=eq.' . rawurlencode($id) . '&select=*&limit=1');
    if ($r['code'] >= 200 && $r['code'] < 300 && !empty($r['body'][0])) return $r['body'][0];
    return null;
}

// Numbers currently taken for a lottery: all 'paid', plus 'reserved' whose hold
// has not expired. Expired reservations are treated as free.
function takenNumbers($lotteryId) {
    $r = sbRequest('GET', 'lottery_tickets?lottery_id=eq.' . rawurlencode($lotteryId)
        . '&status=in.(paid,reserved)&select=number,status,reserved_until');
    $taken = [];
    if (is_array($r['body'])) {
        $nowTs = time();
        foreach ($r['body'] as $row) {
            if ($row['status'] === 'paid') {
                $taken[$row['number']] = true;
            } elseif ($row['status'] === 'reserved'
                && !empty($row['reserved_until'])
                && strtotime($row['reserved_until']) > $nowTs) {
                $taken[$row['number']] = true;
            }
        }
    }
    $out = array_map('intval', array_keys($taken));
    sort($out);
    return $out;
}

// Best-effort ISO8601 (UTC) helper.
function isoUtc($ts) { return gmdate('Y-m-d\TH:i:s\Z', $ts); }

// Derive the site's base URL from the incoming request (same as api/mollie/*).
function siteBaseUrl() {
    $https = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        || (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on');
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    if ($host === '') return defined('SITE_URL') ? rtrim(SITE_URL, '/') : '';
    return ($https ? 'https' : 'http') . '://' . $host;
}
