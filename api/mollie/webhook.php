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

// Handle a successful payment once. Mollie may call this webhook multiple
// times for the same payment, so guard the whole block with a processed-marker.
if ($status === 'paid' && !alreadyProcessed($paymentId)) {
    $donorEmail  = isset($metadata['donor_email']) ? trim($metadata['donor_email']) : '';
    $donorName   = isset($metadata['donor_name']) ? trim($metadata['donor_name']) : '';
    $amountValue = isset($payment['amount']['value']) ? $payment['amount']['value']
                 : (isset($metadata['amount']) ? $metadata['amount'] : '');

    // Monthly: create the recurring subscription
    if ($frequency === 'maandelijks') {
        $customerId = isset($payment['customerId']) ? $payment['customerId'] : null;
        $amount = isset($metadata['amount']) ? $metadata['amount'] : $amountValue;

        if ($customerId && $amount) {
            // Extra safety on top of the processed-marker: if a subscription
            // already exists for this (fresh) customer, don't create another.
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

    // Send a confirmation email (both one-time and monthly donations)
    if ($donorEmail && filter_var($donorEmail, FILTER_VALIDATE_EMAIL)) {
        sendDonationConfirmation($donorEmail, $donorName, $amountValue, $frequency);
    }

    markProcessed($paymentId);
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

// ---- Idempotency (avoid duplicate emails / subscriptions on webhook retries) ----

function processedMarkerPath($paymentId) {
    $dir = sys_get_temp_dir() . '/h4d_mollie_processed';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir . '/' . preg_replace('/[^A-Za-z0-9_]/', '', $paymentId);
}

function alreadyProcessed($paymentId) {
    return file_exists(processedMarkerPath($paymentId));
}

function markProcessed($paymentId) {
    @file_put_contents(processedMarkerPath($paymentId), gmdate('c'));
}

// ---- Donor confirmation email ----

function sendDonationConfirmation($to, $name, $amountValue, $frequency) {
    $fromEmail = defined('DONATION_FROM_EMAIL') ? DONATION_FROM_EMAIL : 'info@hopefordogseurope.com';
    $fromName  = defined('DONATION_FROM_NAME')  ? DONATION_FROM_NAME  : 'Hope for Dogs';
    $replyTo   = defined('DONATION_REPLY_TO')   ? DONATION_REPLY_TO   : 'info@hopefordogseurope.com';

    $isMonthly = ($frequency === 'maandelijks');
    $greeting  = $name !== '' ? ('Beste ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8')) : 'Beste donateur';
    $amountFmt = '€' . number_format((float)$amountValue, 2, ',', '.');
    $freqLine  = $isMonthly
        ? ('Je hebt gekozen voor een maandelijkse donatie van ' . $amountFmt . '. Elke maand help je onze honden opnieuw — daar zijn we je enorm dankbaar voor.')
        : ('We hebben je eenmalige donatie van ' . $amountFmt . ' in goede orde ontvangen.');

    $subject = 'Bedankt voor je donatie aan Hope for Dogs';

    $html = '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"></head>'
        . '<body style="margin:0;padding:0;background:#faf8f4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
        . '<div style="max-width:560px;margin:0 auto;padding:32px 24px;">'
        . '<div style="background:#ffffff;border-radius:16px;padding:32px 28px;">'
        . '<div style="font-size:40px;line-height:1;margin-bottom:12px;">🧡</div>'
        . '<h1 style="font-size:24px;margin:0 0 16px;color:#1a1a1a;">Bedankt voor je donatie!</h1>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 14px;">' . $greeting . ',</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 14px;">' . $freqLine . '</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 14px;">Met jouw steun kunnen wij straathonden blijven redden, verzorgen en een nieuw thuis geven.</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 24px;">Heb je een vraag? Reageer gerust op deze e-mail.</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0;">Met warme groet,<br>Team Hope for Dogs</p>'
        . '</div>'
        . '<p style="font-size:12px;color:#888;text-align:center;margin:20px 0 0;">Hope for Dogs · Samen voor straathonden in Bosnië en Servië</p>'
        . '</div></body></html>';

    $textGreeting = $name !== '' ? ('Beste ' . $name) : 'Beste donateur';
    $text = $textGreeting . ",\r\n\r\n"
        . $freqLine . "\r\n\r\n"
        . "Met jouw steun kunnen wij straathonden blijven redden, verzorgen en een nieuw thuis geven.\r\n\r\n"
        . "Heb je een vraag? Reageer gerust op deze e-mail.\r\n\r\n"
        . "Met warme groet,\r\nTeam Hope for Dogs";

    $boundary = 'h4d' . md5(uniqid('', true));
    $headers = implode("\r\n", [
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    ]);
    $body = '--' . $boundary . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
        . $text . "\r\n\r\n"
        . '--' . $boundary . "\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n"
        . $html . "\r\n\r\n"
        . '--' . $boundary . "--";

    $subjectEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    @mail($to, $subjectEnc, $body, $headers, '-f' . $fromEmail);
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
