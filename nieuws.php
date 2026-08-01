<?php
// Server-side prerender wrapper for nieuws.html (blog / news list). Same approach
// as honden.php: localize head per language + inject a server-rendered list of
// published posts (crawlable <a href> to /nieuws/<slug>, matching the client card
// markup) + CollectionPage/ItemList JSON-LD. Draft/scheduled posts are excluded
// (published_at <= now, mirroring the client). JS wholesale-replaces #blogTimeline
// on hydrate. On ANY failure -> untouched shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/nieuws.html';

$TITLES = [
    'nl' => 'Nieuws — Updates uit het Asiel | Hope for Dogs',
    'de' => 'Neuigkeiten — Updates aus dem Tierheim | Hope for Dogs',
    'en' => 'News — Updates from the Shelter | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Blijf op de hoogte van het laatste nieuws van Hope for Dogs. Reddingsverhalen, updates uit het asiel en meer over onze straathonden.',
    'de' => 'Bleib auf dem Laufenden mit den neuesten Nachrichten von Hope for Dogs. Rettungsgeschichten, Updates aus dem Tierheim und mehr über unsere Streunerhunde.',
    'en' => 'Stay up to date with the latest news from Hope for Dogs. Rescue stories, updates from the shelter, and more about our stray dogs.',
];

// Dutch date, matching the template's client-side formatDate().
function ssr_news_date($s) {
    if (!$s) return '';
    $ts = strtotime($s);
    if ($ts === false) return '';
    $months = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
    return (int) gmdate('j', $ts) . ' ' . $months[(int) gmdate('n', $ts) - 1] . ' ' . gmdate('Y', $ts);
}

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('nieuws.html', $lang);

    // --- HEAD ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Nieuws — Updates uit het Asiel | Hope for Dogs</title>', '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Blijf op de hoogte van het laatste nieuws van Hope for Dogs. Reddingsverhalen, updates uit het asiel en meer over onze straathonden.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/nieuws.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Nieuws — Updates uit het Asiel | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Blijf op de hoogte van het laatste nieuws van Hope for Dogs. Reddingsverhalen, updates uit het asiel en meer.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/nieuws.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $headInsert = ssr_hreflang('nieuws.html');

    // --- Published posts + ItemList (best-effort) ---
    $nowIso = gmdate('Y-m-d\TH:i:s\Z');
    $posts = ssr_get('/rest/v1/posts?select=id,slug,title,title_de,title_en,excerpt,excerpt_de,excerpt_en,photo_url,published_at&published_at=lte.' . rawurlencode($nowIso) . '&order=published_at.desc');
    if ($posts !== null && count($posts) > 0) {
        $nieuwsPath = ($lang === 'nl') ? '/nieuws/' : '/' . $lang . '/nieuws/';
        $postPath   = ($lang === 'nl') ? '/post.html' : '/' . $lang . '/post.html';
        $readmore   = ['nl' => 'Lees meer', 'de' => 'Mehr lesen', 'en' => 'Read more'][$lang] ?? 'Lees meer';
        $cards = '';
        $items = [];
        $pos = 0;
        foreach ($posts as $p) {
            $pid = $p['id'] ?? '';
            $pt = trim((string) ssr_field($p, 'title', $lang));
            if ($pid === '' || $pt === '') continue;
            $ps = trim((string) ($p['slug'] ?? ''));
            $href = ($ps !== '') ? ($nieuwsPath . rawurlencode($ps)) : ($postPath . '?id=' . rawurlencode($pid));
            $img = !empty($p['photo_url']) ? $p['photo_url'] : '';
            $ex = trim((string) ssr_field($p, 'excerpt', $lang));
            $dt = ssr_news_date($p['published_at'] ?? null);
            $cards .= '<a href="' . ssr_h($href) . '" class="blog-post">'
                . '<div class="blog-dot"></div>'
                . ($img !== '' ? '<img src="' . ssr_h($img) . '" alt="' . ssr_h($pt) . '" class="blog-post-img" loading="lazy">' : '')
                . '<div class="blog-post-content">'
                . '<div class="blog-post-date t-body-sm">' . ssr_h($dt) . '</div>'
                . '<div class="blog-post-title t-heading-sm">' . ssr_h($pt) . '</div>'
                . '<div class="blog-post-excerpt t-body-sm">' . ssr_h($ex) . '</div>'
                . '<span class="blog-post-link">' . ssr_h($readmore) . '</span>'
                . '</div></a>';
            $pos++;
            $items[] = ['@type' => 'ListItem', 'position' => $pos, 'url' => SSR_ORIGIN . $href, 'name' => $pt];
        }
        if ($cards !== '') {
            // Inject after the timeline's opening tag (before the "Laden..." row).
            // JS replaces #blogTimeline wholesale on hydrate.
            $html = str_replace('<div class="blog-timeline" id="blogTimeline">',
                '<div class="blog-timeline" id="blogTimeline">' . $cards, $html);
            $list = ['@context' => 'https://schema.org', '@type' => 'CollectionPage',
                'name' => $title, 'url' => $canonical,
                'mainEntity' => ['@type' => 'ItemList', 'itemListElement' => $items]];
            $headInsert .= '  <script type="application/ld+json" id="ssr-ld-itemlist">'
                . json_encode($list, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
        }
    }

    $html = str_replace('</head>', $headInsert . '</head>', $html);
    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
