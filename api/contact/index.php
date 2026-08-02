<?php
// General contact form endpoint.
// Inserts into the Supabase `contact_messages` table using the service key
// (RLS blocks anonymous inserts), so the message shows up in the beheer inbox
// alongside dog inquiries. Best-effort email notification to the team too.
//
// Reuses the Supabase credentials from the social-media config (already set on
// the server): SUPABASE_URL, SUPABASE_SERVICE_KEY.

require_once __DIR__ . '/../social-media/config.php';

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

$input     = json_decode(file_get_contents('php://input'), true);
$naam      = isset($input['naam']) ? trim($input['naam']) : '';
$email     = isset($input['email']) ? trim($input['email']) : '';
$telefoon  = isset($input['telefoon']) ? trim($input['telefoon']) : '';
$onderwerp = isset($input['onderwerp']) ? trim($input['onderwerp']) : '';
$bericht   = isset($input['bericht']) ? trim($input['bericht']) : '';

// Honeypot spam trap: a hidden form field that real visitors never see or fill.
// Automated form-spam bots fill every field, so a non-empty value means it's a bot.
// Silently pretend it succeeded (don't tip off the bot) and skip the save + email.
$honeypot = isset($input['website']) ? trim($input['website']) : '';
if ($honeypot !== '') {
    echo json_encode(['success' => true]);
    exit;
}

if ($naam === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $bericht === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Vul je naam, een geldig e-mailadres en een bericht in.']);
    exit;
}

// Optional dog inquiry: dog_id (a UUID) links the message to a specific dog;
// "hond" is that dog's name (for the notification email only).
$dogId = (isset($input['dog_id']) && is_string($input['dog_id']) && preg_match('/^[0-9a-fA-F-]{36}$/', $input['dog_id']))
    ? $input['dog_id'] : null;
$hond  = isset($input['hond']) ? trim($input['hond']) : '';

// Fold the optional subject into the message body (no dedicated column).
$fullMessage = ($onderwerp !== '' ? ('Onderwerp: ' . $onderwerp . "\n\n") : '') . $bericht;

$row = [
    'dog_id'   => $dogId,
    'naam'     => $naam,
    'email'    => $email,
    'telefoon' => ($telefoon !== '' ? $telefoon : null),
    'bericht'  => $fullMessage,
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => rtrim(SUPABASE_URL, '/') . '/rest/v1/contact_messages',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($row),
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'apikey: ' . SUPABASE_SERVICE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json',
        'Prefer: return=minimal',
    ],
    CURLOPT_SSL_VERIFYPEER => true,
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code < 200 || $code >= 300) {
    http_response_code(502);
    echo json_encode(['error' => 'Kon het bericht niet opslaan. Probeer het later opnieuw.']);
    exit;
}

// Best-effort email notification to the team (does not affect the response).
$to      = 'info@hopefordogseurope.com';
$subjectText = $hond !== '' ? ('Interesse in ' . $hond . ' — via de website') : 'Nieuw contactbericht via de website';
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
$body    = "Naam: $naam\nE-mail: $email\nTelefoon: " . ($telefoon !== '' ? $telefoon : '-') . "\n"
         . ($hond !== '' ? "Interesse in hond: $hond\n" : '')
         . ($onderwerp !== '' ? "Onderwerp: $onderwerp\n" : '')
         . "\nBericht:\n$bericht\n";
$fromEmail = defined('DONATION_FROM_EMAIL') ? DONATION_FROM_EMAIL : 'info@hopefordogseurope.com';
// Strip CR/LF from the name before it goes into a mail header — prevents email
// header injection (a bot smuggling extra Bcc:/Cc: recipients via a newline in
// the name field, turning this notification into a spam relay). $email is already
// validated by FILTER_VALIDATE_EMAIL above, which rejects newlines.
$naamHeader = str_replace(["\r", "\n"], ' ', $naam);
$headers = implode("\r\n", [
    'From: Hope for Dogs <' . $fromEmail . '>',
    'Reply-To: ' . $naamHeader . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
]);
@mail($to, $subject, $body, $headers, '-f' . $fromEmail);

echo json_encode(['success' => true]);
