<?php
// POST /api/lottery/donate.php
// Body: { lottery_id, amount, name, email, anonymous }
// Records a pending donation for a fundraiser campaign and creates a one-time
// Mollie payment. The webhook flips it to 'paid' and emails a receipt.

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
$amount    = isset($input['amount']) ? floatval($input['amount']) : 0;
$name      = isset($input['name']) ? trim($input['name']) : '';
$email     = isset($input['email']) ? trim($input['email']) : '';
$anonymous = !empty($input['anonymous']);

if (!preg_match('/^[0-9a-fA-F-]{36}$/', $lotteryId)) {
    jsonOut(['error' => 'Ongeldige actie.'], 400);
}
if ($amount < 1 || $amount > 50000) {
    jsonOut(['error' => 'Ongeldig bedrag. Minimaal €1, maximaal €50.000.'], 400);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonOut(['error' => 'Vul een geldig e-mailadres in.'], 400);
}

// Campaign must exist, be a live fundraiser.
$lottery = fetchLottery($lotteryId);
if (!$lottery)                          jsonOut(['error' => 'Actie niet gevonden.'], 404);
if (($lottery['type'] ?? '') !== 'fundraiser') jsonOut(['error' => 'Deze actie accepteert geen donaties.'], 409);
if ($lottery['status'] !== 'live')      jsonOut(['error' => 'Deze actie is niet (meer) actief.'], 409);

$amountCents = (int) round($amount * 100);
$amountStr   = number_format($amount, 2, '.', '');
$title       = $lottery['title_nl'] ?: 'Actie';

// Record a pending donation.
$ins = sbRequest('POST', 'lottery_donations', [
    'lottery_id'   => $lotteryId,
    'amount_cents' => $amountCents,
    'donor_name'   => $name !== '' ? $name : null,
    'anonymous'    => $anonymous,
    'donor_email'  => $email !== '' ? $email : null,
    'status'       => 'pending',
], 'return=representation');

if ($ins['code'] < 200 || $ins['code'] >= 300 || empty($ins['body'][0]['id'])) {
    jsonOut(['error' => 'Kon de donatie niet vastleggen. Probeer het opnieuw.'], 502);
}
$donationId = $ins['body'][0]['id'];

// Create the Mollie payment.
$baseUrl = siteBaseUrl();
$descr   = 'Donatie Hope for Dogs — ' . $title;
$payment = mollieRequest('POST', '/payments', [
    'amount'      => ['currency' => 'EUR', 'value' => $amountStr],
    'description' => mb_substr($descr, 0, 255),
    'redirectUrl' => $baseUrl . '/bedankt.html?type=fundraiser',
    'webhookUrl'  => $baseUrl . '/api/lottery/webhook.php',
    'metadata'    => [
        'type'          => 'fundraiser',
        'lottery_id'    => $lotteryId,
        'lottery_title' => mb_substr($title, 0, 120),
        'donation_id'   => $donationId,
        'donor_name'    => mb_substr($name, 0, 120),
        'donor_email'   => $email,
        'anonymous'     => $anonymous ? '1' : '0',
    ],
]);

if (!isset($payment['_links']['checkout']['href'])) {
    // Roll back the pending donation.
    sbRequest('DELETE', 'lottery_donations?id=eq.' . rawurlencode($donationId), null, 'return=minimal');
    $msg = isset($payment['detail']) ? $payment['detail'] : 'Kon de betaling niet aanmaken.';
    jsonOut(['error' => $msg], 502);
}

// Link the donation to the payment so the webhook can confirm it.
sbRequest('PATCH', 'lottery_donations?id=eq.' . rawurlencode($donationId),
    ['mollie_payment_id' => $payment['id']], 'return=minimal');

jsonOut([
    'checkoutUrl' => $payment['_links']['checkout']['href'],
    'paymentId'   => $payment['id'],
]);
