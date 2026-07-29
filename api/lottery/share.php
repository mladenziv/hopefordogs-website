<?php
// GET /api/lottery/share.php?id=<uuid>
// A share-friendly landing page: emits per-lottery Open Graph tags (so a
// Facebook/WhatsApp/etc. link preview shows the prize image + title), then
// bounces real visitors to the homepage with the lottery modal open.

require_once __DIR__ . '/_common.php';

$id = isset($_GET['id']) ? trim($_GET['id']) : '';
$base = siteBaseUrl();

// Invalid id → just send them to the homepage.
if (!preg_match('/^[0-9a-fA-F-]{36}$/', $id)) {
    header('Location: ' . $base . '/index.html');
    exit;
}

$lottery = fetchLottery($id);
$target  = $base . '/index.html?lottery=' . rawurlencode($id);
if (!$lottery) {
    header('Location: ' . $base . '/index.html');
    exit;
}

$title = $lottery['title_nl'] ?: 'Loterij';
$desc  = $lottery['description_nl'] ?: ($lottery['prize_nl'] ?: 'Doe mee met onze loterij en steun de straathonden.');
$image = $lottery['prize_image_url'] ?: ($lottery['image_url'] ?: ($base . '/images/hero-1.png'));

$h = function ($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); };

header('Content-Type: text/html; charset=UTF-8');
?><!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $h($title); ?> | Hope for Dogs</title>
  <meta name="description" content="<?php echo $h($desc); ?>">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Hope for Dogs">
  <meta property="og:title" content="<?php echo $h($title); ?>">
  <meta property="og:description" content="<?php echo $h($desc); ?>">
  <meta property="og:image" content="<?php echo $h($image); ?>">
  <meta property="og:url" content="<?php echo $h($target); ?>">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?php echo $h($title); ?>">
  <meta name="twitter:description" content="<?php echo $h($desc); ?>">
  <meta name="twitter:image" content="<?php echo $h($image); ?>">
  <meta http-equiv="refresh" content="0;url=<?php echo $h($target); ?>">
  <link rel="canonical" href="<?php echo $h($target); ?>">
</head>
<body>
  <p>Je wordt doorgestuurd… <a href="<?php echo $h($target); ?>">Klik hier</a> als dat niet automatisch gebeurt.</p>
  <script>location.replace(<?php echo json_encode($target); ?>);</script>
</body>
</html>
