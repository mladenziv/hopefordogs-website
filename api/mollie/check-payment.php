<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$paymentId = isset($_GET['id']) ? trim($_GET['id']) : '';

// Mollie payment ids look like "tr_xxxxxxxx" — basic sanity check
if ($paymentId === '' || !preg_match('/^tr_[A-Za-z0-9]+$/', $paymentId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Ongeldig betaling-ID.']);
    exit;
}

if (MOLLIE_API_KEY === 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || empty(MOLLIE_API_KEY)) {
    http_response_code(500);
    echo json_encode(['error' => 'Mollie API key is niet geconfigureerd.']);
    exit;
}

$payment = mollieRequest('GET', '/payments/' . $paymentId);

if (!isset($payment['status'])) {
    http_response_code(502);
    echo json_encode(['error' => 'Kon de betalingsstatus niet ophalen.']);
    exit;
}

// Possible statuses: open, pending, authorized, paid, canceled, expired, failed
$metadata = isset($payment['metadata']) ? $payment['metadata'] : [];

echo json_encode([
    'status'    => $payment['status'],
    'frequency' => isset($metadata['frequency']) ? $metadata['frequency'] : 'eenmalig',
    'email'     => isset($metadata['donor_email']) ? $metadata['donor_email'] : '',
]);

// ---- Helper ----

function mollieRequest($method, $endpoint, $data = null) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => MOLLIE_API_URL . $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . MOLLIE_API_KEY,
            'Content-Type: application/json'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true) ?: [];
}
