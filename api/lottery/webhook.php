<?php
// POST /api/lottery/webhook.php  (called by Mollie when a payment changes state)
// On 'paid': confirm the reserved tickets → 'paid' and email the buyer their
// number(s). On failed/canceled/expired: release the reserved numbers.

require_once __DIR__ . '/_common.php';

$paymentId = isset($_POST['id']) ? $_POST['id'] : '';
if (empty($paymentId)) { http_response_code(400); exit; }

$payment = mollieRequest('GET', '/payments/' . $paymentId);
if (!isset($payment['status'])) { http_response_code(400); exit; }

$status   = $payment['status'];
$metadata = isset($payment['metadata']) ? $payment['metadata'] : [];

// Only handle lottery payments here.
if (!isset($metadata['type']) || $metadata['type'] !== 'lottery') {
    http_response_code(200);
    exit;
}

$pidEnc = rawurlencode($paymentId);

if ($status === 'paid' && !alreadyProcessed($paymentId)) {
    // Confirm the tickets tied to this payment.
    sbRequest('PATCH',
        'lottery_tickets?mollie_payment_id=eq.' . $pidEnc . '&status=eq.reserved',
        ['status' => 'paid', 'reserved_until' => null], 'return=minimal');

    // Email the buyer their number(s).
    $email   = isset($metadata['buyer_email']) ? trim($metadata['buyer_email']) : '';
    $name    = isset($metadata['buyer_name']) ? trim($metadata['buyer_name']) : '';
    $numbers = isset($metadata['numbers']) ? $metadata['numbers'] : '';
    $title   = isset($metadata['lottery_title']) ? $metadata['lottery_title'] : 'Loterij';
    if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendTicketConfirmation($email, $name, $numbers, $title);
    }

    markProcessed($paymentId);
} elseif (in_array($status, ['failed', 'canceled', 'expired'], true)) {
    // Payment did not complete — release the held numbers.
    sbRequest('DELETE',
        'lottery_tickets?mollie_payment_id=eq.' . $pidEnc . '&status=eq.reserved',
        null, 'return=minimal');
}

http_response_code(200);

// ---- Idempotency (webhook may fire multiple times) ----
function processedMarkerPath($paymentId) {
    $dir = sys_get_temp_dir() . '/h4d_lottery_processed';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    return $dir . '/' . preg_replace('/[^A-Za-z0-9_]/', '', $paymentId);
}
function alreadyProcessed($paymentId) { return file_exists(processedMarkerPath($paymentId)); }
function markProcessed($paymentId)    { @file_put_contents(processedMarkerPath($paymentId), gmdate('c')); }

// ---- Buyer confirmation email ----
function sendTicketConfirmation($to, $name, $numbers, $title) {
    $fromEmail = defined('DONATION_FROM_EMAIL') ? DONATION_FROM_EMAIL : 'info@hopefordogseurope.com';
    $fromName  = defined('DONATION_FROM_NAME')  ? DONATION_FROM_NAME  : 'Hope for Dogs';
    $replyTo   = defined('DONATION_REPLY_TO')   ? DONATION_REPLY_TO   : 'info@hopefordogseurope.com';

    $greeting   = $name !== '' ? ('Beste ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8')) : 'Beste deelnemer';
    $numbersOut = htmlspecialchars($numbers, ENT_QUOTES, 'UTF-8');
    $titleOut   = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $subject    = 'Je lot(en) voor ' . $title . ' — Hope for Dogs';

    $html = '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"></head>'
        . '<body style="margin:0;padding:0;background:#faf8f4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">'
        . '<div style="max-width:560px;margin:0 auto;padding:32px 24px;">'
        . '<div style="background:#ffffff;border-radius:16px;padding:32px 28px;">'
        . '<div style="font-size:40px;line-height:1;margin-bottom:12px;">🎟️</div>'
        . '<h1 style="font-size:24px;margin:0 0 16px;color:#1a1a1a;">Bedankt voor je deelname!</h1>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 14px;">' . $greeting . ',</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 14px;">Je doet mee aan <strong>' . $titleOut . '</strong>. '
        . 'Dit zijn jouw nummer(s):</p>'
        . '<p style="font-size:22px;font-weight:bold;color:#ff5314;margin:0 0 18px;">' . $numbersOut . '</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0 0 14px;">We trekken binnenkort de winnende nummers en nemen contact op met de winnaar(s). '
        . 'Met jouw steun helpen we straathonden — bedankt!</p>'
        . '<p style="font-size:16px;line-height:26px;margin:0;">Met warme groet,<br>Team Hope for Dogs</p>'
        . '</div>'
        . '<p style="font-size:12px;color:#888;text-align:center;margin:20px 0 0;">Hope for Dogs · Samen voor straathonden in Bosnië en Servië</p>'
        . '</div></body></html>';

    $textGreeting = $name !== '' ? ('Beste ' . $name) : 'Beste deelnemer';
    $text = $textGreeting . ",\r\n\r\n"
        . 'Je doet mee aan ' . $title . ". Jouw nummer(s): " . $numbers . "\r\n\r\n"
        . "We trekken binnenkort de winnende nummers en nemen contact op met de winnaar(s).\r\n\r\n"
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
