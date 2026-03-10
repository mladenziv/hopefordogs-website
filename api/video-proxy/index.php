<?php
set_time_limit(300);

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

// Only allow proxying video URLs from known Facebook CDN domains
$allowed_hosts = ['scontent', 'fbcdn', 'fbsbx', 'lookaside', 'video'];
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
    echo 'Domain not allowed: ' . $host;
    exit;
}

// Single GET request — inspect response headers before streaming body
$headersSent = false;
$contentType = '';
$contentLength = 0;
$isValid = true;

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 300,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HEADER => false,
    CURLOPT_RETURNTRANSFER => false,
    CURLOPT_HEADERFUNCTION => function($ch, $header) use (&$contentType, &$contentLength, &$isValid) {
        $len = strlen($header);
        $parts = explode(':', $header, 2);
        if (count($parts) == 2) {
            $name = strtolower(trim($parts[0]));
            $value = trim($parts[1]);
            if ($name === 'content-type') {
                $contentType = $value;
                // Accept video/* and application/octet-stream (Facebook CDN sometimes uses this)
                if (strpos($value, 'video/') === false && strpos($value, 'application/octet-stream') === false) {
                    $isValid = false;
                }
            }
            if ($name === 'content-length') {
                $contentLength = (int)$value;
                if ($contentLength > 100 * 1024 * 1024) {
                    $isValid = false;
                }
            }
        }
        return $len;
    },
    CURLOPT_WRITEFUNCTION => function($ch, $data) use (&$headersSent, &$isValid, &$contentType, &$contentLength) {
        if (!$isValid) {
            return 0; // abort transfer
        }
        if (!$headersSent) {
            header('Content-Type: ' . ($contentType ?: 'video/mp4'));
            if ($contentLength > 0) {
                header('Content-Length: ' . $contentLength);
            }
            header('Cache-Control: public, max-age=3600');
            $headersSent = true;
        }
        echo $data;
        flush();
        return strlen($data);
    },
]);

curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if (!$headersSent) {
    // No data was streamed — return appropriate error
    if (!$isValid) {
        http_response_code(400);
        echo 'Not a video (content-type: ' . $contentType . ', size: ' . $contentLength . ')';
    } elseif ($httpCode !== 200 && $httpCode !== 0) {
        http_response_code(502);
        echo 'Failed to fetch video (HTTP ' . $httpCode . ')';
    } elseif ($error) {
        http_response_code(502);
        echo 'Proxy error: ' . $error;
    } else {
        http_response_code(502);
        echo 'Empty response from upstream';
    }
}
