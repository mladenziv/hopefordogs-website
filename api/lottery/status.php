<?php
// GET /api/lottery/status.php?id=<uuid>
// Returns the lottery (public fields) + the list of numbers already taken
// (paid, or reserved and not yet expired). Availability is computed server-side
// so buyer PII in lottery_tickets never reaches the browser.

require_once __DIR__ . '/_common.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$id = isset($_GET['id']) ? trim($_GET['id']) : '';
if (!preg_match('/^[0-9a-fA-F-]{36}$/', $id)) {
    jsonOut(['error' => 'Ongeldige loterij.'], 400);
}

$lottery = fetchLottery($id);
if (!$lottery) {
    jsonOut(['error' => 'Loterij niet gevonden.'], 404);
}

// Unavailable = sold/reserved tickets + numbers the admin manually blocked.
$taken = takenNumbers($id);
$blocked = (isset($lottery['blocked_numbers']) && is_array($lottery['blocked_numbers']))
    ? array_map('intval', $lottery['blocked_numbers']) : [];
$taken = array_values(array_unique(array_merge($taken, $blocked)));
sort($taken);

jsonOut([
    'lottery' => $lottery,
    'taken'   => $taken,
]);
