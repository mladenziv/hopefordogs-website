<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$url = $_GET['url'] ?? '';

if (empty($url)) {
    http_response_code(400);
    echo 'Missing url parameter';
    exit;
}

// Only allow proxying image URLs from known Facebook CDN domains
$allowed_hosts = ['scontent', 'fbcdn', 'facebook', 'fbsbx', 'lookaside'];
$host = parse_url($url, PHP_URL_HOST);
$is_allowed = false;
foreach ($allowed_hosts as $allowed) {
    if (strpos($host, $allowed) !== false) {
        $is_allowed = true;
        break;
    }
}

if (!$is_allowed) {
    http_response_code(403);
    echo 'Domain not allowed';
    exit;
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    CURLOPT_SSL_VERIFYPEER => true,
]);

$data = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($httpCode !== 200 || empty($data)) {
    http_response_code(502);
    echo 'Failed to fetch image';
    exit;
}

// Validate it's actually an image
if (strpos($contentType, 'image/') !== 0) {
    // Try to detect from data
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $detectedType = $finfo->buffer($data);
    if (strpos($detectedType, 'image/') !== 0) {
        http_response_code(400);
        echo 'Not an image';
        exit;
    }
    $contentType = $detectedType;
}

header('Content-Type: ' . $contentType);
header('Content-Length: ' . strlen($data));
header('Cache-Control: public, max-age=3600');
echo $data;
