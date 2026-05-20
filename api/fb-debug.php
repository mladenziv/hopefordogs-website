<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test fetching a single photo page from this server
$fbid = '982589924686880';
$url = 'https://www.facebook.com/photo/?fbid=' . $fbid;

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    CURLOPT_HTTPHEADER => [
        'Accept: text/html,application/xhtml+xml',
        'Accept-Language: nl,en;q=0.5',
    ],
    CURLOPT_SSL_VERIFYPEER => true,
]);
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
$error = curl_error($ch);
curl_close($ch);

$htmlLen = strlen($html);
$hasPhoto = strpos($html, '__typename":"Photo"') !== false;
$hasError = strpos($html, 'Sorry, something went wrong') !== false;
$hasLogin = strpos($html, 'log in') !== false || strpos($html, 'Log In') !== false;

// Count photo-related URIs
preg_match_all('/"uri"\s*:\s*"(https:[^"]*-6\/[^"]*)"/', $html, $uriMatches);
$postPhotoUris = count($uriMatches[1]);

// Find fbids
preg_match_all('/fbid[=:](\d{12,})/', $html, $fbidMatches);
$foundFbids = array_unique($fbidMatches[1]);

echo json_encode([
    'httpCode' => $httpCode,
    'effectiveUrl' => $effectiveUrl,
    'error' => $error,
    'htmlLength' => $htmlLen,
    'hasPhotoTypename' => $hasPhoto,
    'hasError' => $hasError,
    'hasLogin' => $hasLogin,
    'postPhotoUriCount' => $postPhotoUris,
    'foundFbids' => array_values($foundFbids),
    'htmlSnippet' => substr($html, 0, 500),
]);
