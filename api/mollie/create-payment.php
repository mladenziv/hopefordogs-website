<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);

$amount = isset($input['amount']) ? floatval($input['amount']) : 0;
$frequency = isset($input['frequency']) ? $input['frequency'] : 'eenmalig';
$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';

// Validate amount
if ($amount < 1 || $amount > 50000) {
    http_response_code(400);
    echo json_encode(['error' => 'Ongeldig bedrag. Minimaal €1, maximaal €50.000.']);
    exit;
}

// Check API key is configured
if (MOLLIE_API_KEY === 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || empty(MOLLIE_API_KEY)) {
    http_response_code(500);
    echo json_encode(['error' => 'Mollie API key is niet geconfigureerd.']);
    exit;
}

$amountStr = number_format($amount, 2, '.', '');
$description = 'Donatie Hope for Dogs - €' . $amountStr;

if ($frequency === 'maandelijks') {
    // RECURRING: Create customer first, then first payment
    $customerId = null;

    if ($email) {
        // Create or find customer
        $customerData = [
            'name' => $name ?: 'Donateur',
            'email' => $email
        ];

        $customerResponse = mollieRequest('POST', '/customers', $customerData);

        if (isset($customerResponse['id'])) {
            $customerId = $customerResponse['id'];
        }
    }

    // Create first payment for recurring mandate
    $paymentData = [
        'amount' => [
            'currency' => 'EUR',
            'value' => $amountStr
        ],
        'description' => $description . ' (eerste betaling)',
        'redirectUrl' => SITE_URL . '/doneer.html?betaling=succes',
        'webhookUrl' => SITE_URL . '/api/mollie/webhook.php',
        'metadata' => [
            'frequency' => 'maandelijks',
            'amount' => $amountStr,
            'donor_name' => $name,
            'donor_email' => $email
        ]
    ];

    if ($customerId) {
        $paymentData['customerId'] = $customerId;
        $paymentData['sequenceType'] = 'first';
    }

    $payment = mollieRequest('POST', '/payments', $paymentData);

} else {
    // ONE-TIME: Create a simple payment
    $paymentData = [
        'amount' => [
            'currency' => 'EUR',
            'value' => $amountStr
        ],
        'description' => $description,
        'redirectUrl' => SITE_URL . '/doneer.html?betaling=succes',
        'webhookUrl' => SITE_URL . '/api/mollie/webhook.php',
        'metadata' => [
            'frequency' => 'eenmalig',
            'donor_name' => $name,
            'donor_email' => $email
        ]
    ];

    $payment = mollieRequest('POST', '/payments', $paymentData);
}

if (isset($payment['_links']['checkout']['href'])) {
    echo json_encode([
        'checkoutUrl' => $payment['_links']['checkout']['href'],
        'paymentId' => $payment['id']
    ]);
} else {
    $errorMsg = isset($payment['detail']) ? $payment['detail'] : 'Onbekende fout bij het aanmaken van de betaling.';
    http_response_code(500);
    echo json_encode(['error' => $errorMsg]);
}

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
    } elseif ($method === 'GET') {
        // default
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return json_decode($response, true) ?: [];
}
