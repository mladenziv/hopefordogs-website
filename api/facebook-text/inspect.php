<?php
// TEMPORARY diagnostic tool. Fetches a FB post (and its first photo page) the same
// way the extractor does, and reports WHERE photos live in the current HTML, so we
// can write correct extraction. Returns counts + short snippets only (no huge dumps).
// Delete after we've fixed the extractor.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$url = isset($_REQUEST['url']) ? $_REQUEST['url'] : '';
if ($url === '' || strpos($url, 'facebook.com') === false) {
    echo json_encode(array('error' => 'pass ?url=<facebook post url>'));
    exit;
}

function ins_fetch($u) {
    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $u,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => array(
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: nl,en;q=0.5',
            'Sec-Fetch-Dest: document', 'Sec-Fetch-Mode: navigate', 'Sec-Fetch-Site: none', 'Sec-Fetch-User: ?1',
        ),
    ));
    $html = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return array($code, $html ?: '');
}

// Report: for a haystack, count occurrences of each needle + distinct id/file harvests.
function ins_report($html) {
    $patterns = array(
        '__typename":"Photo"', '__typename":"PhotoImage', 'all_subattachments', '"subattachments"',
        '"photo_image"', '"image":{"uri":"', '"viewer_image"', 't39.30808-6', 'scontent', 'fbcdn',
        '"fbid":"', 'fbid=', '"__isMedia":"Photo"', 'curr_media', '"large_share_image"', 'accessibility_caption',
    );
    $counts = array();
    foreach ($patterns as $p) { $counts[$p] = substr_count($html, $p); }

    // distinct photo file-ids (the CDN image identity: 123_456_789_n)
    preg_match_all('/\/(\d+_\d+_\d+_n)\./', str_replace('\\/', '/', $html), $fm);
    $fileIds = array_values(array_unique($fm[1]));

    // distinct 12+ digit fbids from several shapes
    preg_match_all('/"fbid":"(\d{12,})"/', $html, $a);
    preg_match_all('/fbid[=:](\d{12,})/', $html, $b);
    preg_match_all('/"id":"(\d{12,})"/', $html, $cc);
    $fbids = array_values(array_unique(array_merge($a[1], $b[1], $cc[1])));

    // one snippet around the first fbcdn -6/ image uri, to see the surrounding JSON shape
    $snip = null;
    if (preg_match('/https:[^"\\\\]*t39\.30808-6[^"\\\\]{0,200}/', str_replace('\\/', '/', $html), $sm)) {
        $snip = substr($sm[0], 0, 220);
    }
    $snip2 = null;
    $pos = strpos($html, 'all_subattachments');
    if ($pos !== false) { $snip2 = substr($html, $pos, 400); }

    // PROPOSED extraction: normalize ALL backslash-escaped slashes (\/ , \\/ , \\\/),
    // then grab every post-photo CDN url, deduped by file-id.
    $norm = preg_replace('#\\\\+/#', '/', $html);
    preg_match_all('#https://[^"\s<]*/t39\.\d+-6/(\d+_\d+_\d+_n)\.[a-z0-9]+[^"\s<]*#i', $norm, $pm);
    $proposedByFid = array();
    foreach ($pm[0] as $k => $u) {
        $u = html_entity_decode($u, ENT_QUOTES, 'UTF-8');
        $fid = $pm[1][$k];
        if (!isset($proposedByFid[$fid])) $proposedByFid[$fid] = $u;
    }
    $subCount = null;
    if (preg_match('/all_subattachments"\s*:\s*\{\s*"count"\s*:\s*(\d+)/', $html, $scm)) $subCount = (int)$scm[1];

    // Dump the all_subattachments block (normalized) + how many photo URLs live inside it.
    $subBlock = null; $subBlockPhotoUrls = null; $subBlockFileIds = null;
    $sp = strpos($norm, 'all_subattachments');
    if ($sp !== false) {
        $subBlock = substr($norm, $sp, 16000);
        preg_match_all('#https://[^"\s<]*/t39\.\d+-6/(\d+_\d+_\d+_n)\.#i', $subBlock, $sbm);
        $subBlockPhotoUrls = count($sbm[0]);
        $subBlockFileIds = count(array_unique($sbm[1]));
    }

    return array(
        'len' => strlen($html),
        'counts' => $counts,
        'distinct_file_ids' => count($fileIds),
        'file_ids_sample' => array_slice($fileIds, 0, 30),
        'distinct_fbids' => count($fbids),
        'fbids_sample' => array_slice($fbids, 0, 30),
        'snippet_image_uri' => $snip,
        'snippet_all_subattachments' => $snip2,
        'PROPOSED_photo_count' => count($proposedByFid),
        'PROPOSED_sample' => array_slice(array_values($proposedByFid), 0, 3),
        'all_subattachments_count' => $subCount,
        'subblock_photo_urls' => $subBlockPhotoUrls,
        'subblock_file_ids' => $subBlockFileIds,
        'subblock_dump' => $subBlock,
    );
}

list($pc, $ph) = ins_fetch($url);
$out = array('post' => array('http' => $pc) + ins_report($ph));

// Also inspect the first photo page (that's where sibling photos should be discoverable)
if (preg_match('/fbid[=:](\d{12,})/', $ph, $fm) || preg_match('/"id":"(\d{12,})"/', $ph, $fm)) {
    list($pc2, $ph2) = ins_fetch('https://www.facebook.com/photo/?fbid=' . $fm[1]);
    $out['photo_page'] = array('fbid' => $fm[1], 'http' => $pc2) + ins_report($ph2);
}

echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
