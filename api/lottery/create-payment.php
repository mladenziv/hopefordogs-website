<?php
// POST /api/lottery/create-payment.php
// Body: { lottery_id, numbers: [int,...], name, email }
// Reserves the chosen numbers for ~15 min, creates a Mollie payment for
// count × price, and returns the checkout URL. The reservation is race-safe via
// a unique (lottery_id, number) constraint: a concurrent buyer of the same
// number fails the insert and is asked to re-pick.

require_once __DIR__ . '/_common.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')   { jsonOut(['error' => 'Method not allowed'], 405); }

if (!mollieConfigured()) {
    jsonOut(['error' => 'Betalingen zijn nog niet geconfigureerd.'], 500);
}

$input     = json_decode(file_get_contents('php://input'), true);
$lotteryId = isset($input['lottery_id']) ? trim($input['lottery_id']) : '';
$name      = isset($input['name']) ? trim($input['name']) : '';
$email     = isset($input['email']) ? trim($input['email']) : '';
$numbers   = isset($input['numbers']) && is_array($input['numbers']) ? $input['numbers'] : [];

if (!preg_match('/^[0-9a-fA-F-]{36}$/', $lotteryId)) {
    jsonOut(['error' => 'Ongeldige loterij.'], 400);
}
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonOut(['error' => 'Vul je naam en een geldig e-mailadres in.'], 400);
}

// Normalise + validate the requested numbers.
$clean = [];
foreach ($numbers as $n) {
    if (!is_numeric($n)) continue;
    $clean[(int)$n] = true;
}
$numbers = array_keys($clean);
sort($numbers);

if (count($numbers) < 1) {
    jsonOut(['error' => 'Kies minstens één nummer.'], 400);
}
if (count($numbers) > 50) {
    jsonOut(['error' => 'Je kunt maximaal 50 nummers per keer kopen.'], 400);
}

// Lottery must exist and be visible on the site. (Visibility is the single source of
// truth in the acties model; `status` is legacy and no longer gates buying.)
$lottery = fetchLottery($lotteryId);
if (!$lottery)                                       jsonOut(['error' => 'Loterij niet gevonden.'], 404);
if (isset($lottery['visible']) && $lottery['visible'] === false) {
    jsonOut(['error' => 'Deze loterij is niet (meer) actief.'], 409);
}

$maxNum    = (int)$lottery['max_numbers'];
$priceEach = (int)$lottery['price_cents'];

foreach ($numbers as $n) {
    if ($n < 1 || $n > $maxNum) {
        jsonOut(['error' => 'Nummer ' . $n . ' valt buiten het bereik 1–' . $maxNum . '.'], 400);
    }
}

// Free up any expired reservations for this lottery first.
sbRequest('DELETE',
    'lottery_tickets?lottery_id=eq.' . rawurlencode($lotteryId)
        . '&status=eq.reserved&reserved_until=lt.' . rawurlencode(isoUtc(time())),
    null, 'return=minimal');

// Re-check availability after the sweep. Unavailable = sold/reserved tickets
// plus any numbers the admin manually blocked.
$blocked = (isset($lottery['blocked_numbers']) && is_array($lottery['blocked_numbers']))
    ? array_map('intval', $lottery['blocked_numbers']) : [];
$taken = array_values(array_unique(array_merge(takenNumbers($lotteryId), $blocked)));
$conflict = array_values(array_intersect($numbers, $taken));
if (count($conflict) > 0) {
    jsonOut(['error' => 'Sommige nummers zijn niet beschikbaar.', 'taken' => $taken, 'conflict' => $conflict], 409);
}

// Reserve the numbers (15-minute hold). One atomic insert of all rows: if any
// number was grabbed in the meantime, the unique constraint rejects the whole
// insert (PostgREST 409) and we report the fresh taken list.
$reservedUntil = isoUtc(time() + 15 * 60);
$rows = [];
foreach ($numbers as $n) {
    $rows[] = [
        'lottery_id'     => $lotteryId,
        'number'         => $n,
        'status'         => 'reserved',
        'reserved_until' => $reservedUntil,
        'buyer_name'     => $name,
        'buyer_email'    => $email,
    ];
}
$ins = sbRequest('POST', 'lottery_tickets', $rows, 'return=representation');
if ($ins['code'] === 409) {
    jsonOut(['error' => 'Sommige nummers zijn zojuist vergeven. Kies opnieuw.', 'taken' => takenNumbers($lotteryId)], 409);
}
if ($ins['code'] < 200 || $ins['code'] >= 300 || !is_array($ins['body'])) {
    jsonOut(['error' => 'Kon de nummers niet reserveren. Probeer het opnieuw.'], 502);
}
$ticketIds = array_map(function ($r) { return $r['id']; }, $ins['body']);

// Create the Mollie payment.
$total    = count($numbers) * $priceEach;                  // cents
$amountStr = number_format($total / 100, 2, '.', '');
$title    = $lottery['title_nl'] ?: 'Loterij';
$baseUrl  = siteBaseUrl();

// Keep within Mollie's limits: description ≤ 255 chars, metadata ≤ 1KB.
// The webhook confirms tickets by mollie_payment_id, so ticket ids aren't needed
// in metadata (which would overflow for large orders).
$descr = 'Loterij Hope for Dogs — ' . $title . ' (' . count($numbers) . ' lot' . (count($numbers) === 1 ? '' : 'en') . ')';
$payment = mollieRequest('POST', '/payments', [
    'amount'      => ['currency' => 'EUR', 'value' => $amountStr],
    'description' => mb_substr($descr, 0, 255),
    'redirectUrl' => $baseUrl . '/bedankt.html?type=lottery',
    'webhookUrl'  => $baseUrl . '/api/lottery/webhook.php',
    'metadata'    => [
        'type'          => 'lottery',
        'lottery_id'    => $lotteryId,
        'lottery_title' => mb_substr($title, 0, 120),
        'numbers'       => implode(',', $numbers),
        'buyer_name'    => mb_substr($name, 0, 120),
        'buyer_email'   => $email,
    ],
]);

if (!isset($payment['_links']['checkout']['href'])) {
    // Roll back the reservation so the numbers free up immediately.
    sbRequest('DELETE',
        'lottery_tickets?id=in.(' . implode(',', array_map('rawurlencode', $ticketIds)) . ')',
        null, 'return=minimal');
    $msg = isset($payment['detail']) ? $payment['detail'] : 'Kon de betaling niet aanmaken.';
    jsonOut(['error' => $msg], 502);
}

// Link the reserved tickets to the payment (so the webhook can confirm them).
sbRequest('PATCH',
    'lottery_tickets?id=in.(' . implode(',', array_map('rawurlencode', $ticketIds)) . ')',
    ['mollie_payment_id' => $payment['id']], 'return=minimal');

jsonOut([
    'checkoutUrl' => $payment['_links']['checkout']['href'],
    'paymentId'   => $payment['id'],
    'numbers'     => $numbers,
]);
