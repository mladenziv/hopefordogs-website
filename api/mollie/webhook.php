<?php
require_once __DIR__ . '/config.php';

// Mollie sends a POST with "id" parameter when payment status changes
$paymentId = isset($_POST['id']) ? $_POST['id'] : '';

if (empty($paymentId)) {
    http_response_code(400);
    exit;
}

// Fetch payment details from Mollie
$payment = mollieRequest('GET', '/payments/' . $paymentId);

if (!isset($payment['status'])) {
    http_response_code(400);
    exit;
}

$status = $payment['status'];
$metadata = isset($payment['metadata']) ? $payment['metadata'] : [];
$frequency = isset($metadata['frequency']) ? $metadata['frequency'] : 'eenmalig';

if ($status === 'paid' && $frequency === 'maandelijks') {
    // First payment succeeded — create a monthly subscription
    $customerId = isset($payment['customerId']) ? $payment['customerId'] : null;
    $amount = isset($metadata['amount']) ? $metadata['amount'] : null;

    if ($customerId && $amount) {
        // Idempotency: Mollie may call this webhook more than once for the
        // same payment. Since each donation uses a fresh customer, any
        // existing subscription means we already handled this one — skip it
        // so retries can't create duplicate subscriptions.
        $existing = mollieRequest('GET', '/customers/' . $customerId . '/subscriptions');
        $hasSubscription = false;
        if (isset($existing['count']) && $existing['count'] > 0) {
            $hasSubscription = true;
        } elseif (isset($existing['_embedded']['subscriptions']) && count($existing['_embedded']['subscriptions']) > 0) {
            $hasSubscription = true;
        }

        if (!$hasSubscription) {
            $subscriptionData = [
                'amount' => [
                    'currency' => 'EUR',
                    'value' => $amount
                ],
                'interval' => '1 month',
                // The first payment already covers this month — start the
                // recurring charges one month from now to avoid a double charge.
                'startDate' => date('Y-m-d', strtotime('+1 month')),
                'description' => 'Maandelijkse donatie Hope for Dogs - €' . $amount,
                'webhookUrl' => siteBaseUrl() . '/api/mollie/webhook.php'
            ];

            mollieRequest('POST', '/customers/' . $customerId . '/subscriptions', $subscriptionData);
        }
    }
}

// Always return 200 to acknowledge the webhook
http_response_code(200);

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

// Derive the site's base URL (scheme + host) from the incoming request.
// Falls back to the SITE_URL constant if the host can't be determined.
function siteBaseUrl() {
    $https = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        || (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on');
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    if ($host === '') {
        return defined('SITE_URL') ? rtrim(SITE_URL, '/') : '';
    }
    return ($https ? 'https' : 'http') . '://' . $host;
}
