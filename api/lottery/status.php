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

// Fundraiser: return goal + amount raised + a sanitized donor wall (no email;
// anonymous donors show as "Anoniem"; others as first name only).
if (isset($lottery['type']) && $lottery['type'] === 'fundraiser') {
    $r = sbRequest('GET', 'lottery_donations?lottery_id=eq.' . rawurlencode($id)
        . '&status=eq.paid&select=amount_cents,donor_name,anonymous,created_at&order=created_at.desc');
    $raised = 0; $donors = [];
    if (is_array($r['body'])) {
        foreach ($r['body'] as $d) {
            $raised += (int)$d['amount_cents'];
            $donors[] = [
                'name'         => !empty($d['anonymous']) ? 'Anoniem' : firstNameOnly($d['donor_name']),
                'amount_cents' => (int)$d['amount_cents'],
            ];
        }
    }
    jsonOut([
        'lottery'      => $lottery,
        'raised_cents' => $raised,
        'goal_cents'   => isset($lottery['goal_cents']) ? (int)$lottery['goal_cents'] : null,
        'donor_count'  => count($donors),
        'donors'       => array_slice($donors, 0, 30),
    ]);
}

// ---- Raffle: unavailable = sold/reserved tickets + admin-blocked numbers. ----
$taken = takenNumbers($id);
$blocked = (isset($lottery['blocked_numbers']) && is_array($lottery['blocked_numbers']))
    ? array_map('intval', $lottery['blocked_numbers']) : [];
$taken = array_values(array_unique(array_merge($taken, $blocked)));
sort($taken);

jsonOut([
    'lottery' => $lottery,
    'taken'   => $taken,
]);

// First word of a name (for the public donor wall); falls back to "Donateur".
function firstNameOnly($name) {
    $name = trim((string)$name);
    if ($name === '') return 'Donateur';
    $parts = preg_split('/\s+/', $name);
    return $parts[0];
}
