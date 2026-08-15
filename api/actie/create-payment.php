<?php
// POST /api/actie/create-payment.php
// Body: { actie_id, quantity, name, email }
// Creates a pending actie_purchases row, a Mollie payment for price × quantity,
// and returns the checkout URL. The webhook (api/lottery/webhook.php, type=actie)
// confirms the purchase, emails the buyer, and drops a beheer-inbox notification.
//
// Reuses the shared lottery helpers (Mollie + Supabase service key + config).

require_once __DIR__ . '/../lottery/_common.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')   { jsonOut(['error' => 'Method not allowed'], 405); }

if (!mollieConfigured()) {
    jsonOut(['error' => 'Betalingen zijn nog niet geconfigureerd.'], 500);
}

$input    = json_decode(file_get_contents('php://input'), true);
$actieId  = isset($input['actie_id']) ? trim($input['actie_id']) : '';
$name     = isset($input['name']) ? trim($input['name']) : '';
$email    = isset($input['email']) ? trim($input['email']) : '';
$quantity = isset($input['quantity']) ? (int)$input['quantity'] : 1;
$note     = isset($input['note']) ? mb_substr(trim((string)$input['note']), 0, 1000) : '';

if (!preg_match('/^[0-9a-fA-F-]{36}$/', $actieId)) {
    jsonOut(['error' => 'Ongeldige actie.'], 400);
}
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonOut(['error' => 'Vul je naam en een geldig e-mailadres in.'], 400);
}
if ($quantity < 1)  $quantity = 1;
if ($quantity > 50) $quantity = 50;

// The actie must exist, be a product, and be visible.
$actie = fetchLottery($actieId);
if (!$actie)                                jsonOut(['error' => 'Actie niet gevonden.'], 404);
if (($actie['type'] ?? '') !== 'product')   jsonOut(['error' => 'Deze actie is niet te koop.'], 409);
if (isset($actie['visible']) && !$actie['visible']) jsonOut(['error' => 'Deze actie is niet (meer) beschikbaar.'], 409);

$priceEach = (int)$actie['price_cents'];
if ($priceEach <= 0) jsonOut(['error' => 'Deze actie heeft geen geldige prijs.'], 409);

$total     = $priceEach * $quantity;                 // cents
$amountStr = number_format($total / 100, 2, '.', '');
$title     = $actie['title_nl'] ?: 'Actie';
$baseUrl   = siteBaseUrl();

// Create the pending purchase first, so the webhook has a row to confirm.
$ins = sbRequest('POST', 'actie_purchases', [[
    'lottery_id'   => $actieId,
    'quantity'     => $quantity,
    'amount_cents' => $total,
    'buyer_name'   => $name,
    'buyer_email'  => $email,
    'note'         => ($note !== '' ? $note : null),
    'status'       => 'pending',
]], 'return=representation');
if ($ins['code'] < 200 || $ins['code'] >= 300 || empty($ins['body'][0]['id'])) {
    jsonOut(['error' => 'Kon de bestelling niet aanmaken. Probeer het opnieuw.'], 502);
}
$purchaseId = $ins['body'][0]['id'];

// Create the Mollie payment.
$descr = 'Actie Hope for Dogs — ' . $title . ' (' . $quantity . '×)';
$payment = mollieRequest('POST', '/payments', [
    'amount'      => ['currency' => 'EUR', 'value' => $amountStr],
    'description' => mb_substr($descr, 0, 255),
    'redirectUrl' => $baseUrl . '/bedankt.html?type=actie',
    'webhookUrl'  => $baseUrl . '/api/lottery/webhook.php',
    'metadata'    => [
        'type'        => 'actie',
        'actie_id'    => $actieId,
        'actie_title' => mb_substr($title, 0, 120),
        'quantity'    => $quantity,
        'buyer_name'  => mb_substr($name, 0, 120),
        'buyer_email' => $email,
        'note'        => mb_substr($note, 0, 250),
    ],
]);

if (!isset($payment['_links']['checkout']['href'])) {
    // Roll back the pending purchase so it doesn't linger.
    sbRequest('DELETE', 'actie_purchases?id=eq.' . rawurlencode($purchaseId), null, 'return=minimal');
    $msg = isset($payment['detail']) ? $payment['detail'] : 'Kon de betaling niet aanmaken.';
    jsonOut(['error' => $msg], 502);
}

// Link the payment to the purchase so the webhook can confirm it.
sbRequest('PATCH', 'actie_purchases?id=eq.' . rawurlencode($purchaseId),
    ['mollie_payment_id' => $payment['id']], 'return=minimal');

jsonOut([
    'checkoutUrl' => $payment['_links']['checkout']['href'],
    'paymentId'   => $payment['id'],
]);
