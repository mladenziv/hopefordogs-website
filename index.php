<?php
// Server-side prerender wrapper for the homepage (index.html). Same approach as
// over-ons.php: localizes the <head> per language (nl/en/de via ssr_lang) and
// injects the reciprocal hreflang mesh, so /en/ and /de/ are REAL, self-canonical
// pages instead of Dutch duplicates (the homepage was the one page missing a wrapper:
// it served <html lang="nl">, a Dutch title/description and a canonical pointing at
// the Dutch root, so Google folded /en/ and /de/ into /).
//
// Homepage special-case: canonical/og:url/hreflang use the CLEAN root paths
// (/, /en/, /de/) via ssr_url_path('')/ssr_hreflang_path(''), NOT ssr_url('index.html')
// which would wrongly emit /en/index.html.
//
// index.html already carries NGO + WebSite JSON-LD, so none is injected here.
// On ANY failure -> untouched template shell (worst case = today's behaviour).

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/index.html';

$TITLES = [
    'nl' => 'Hope for Dogs — Adopteer een Straathond uit Bosnië en Servië',
    'de' => 'Hope for Dogs — Adoptiere einen Streunerhund aus Bosnien und Serbien',
    'en' => 'Rescue Dogs from Europe — Adopt a Street Dog | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Hope for Dogs redt straathonden in Bosnië en Servië en vindt hen een liefdevol thuis in Nederland, België, Duitsland en Oostenrijk. Bekijk onze honden.',
    'de' => 'Hope for Dogs rettet Streunerhunde in Bosnien und Serbien und vermittelt sie in die Niederlande, Belgien, Deutschland und Österreich. Entdecke unsere Hunde.',
    'en' => 'We rescue street dogs from Serbia & Bosnia and rehome them across Europe — the Netherlands, Belgium, Germany & Austria. Meet our rescue dogs looking for a home.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url_path('', $lang);

    // --- HEAD ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Hope for Dogs — Adopteer een Straathond uit Bosnië en Servië</title>',
        '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Hope for Dogs redt straathonden in Bosnië en Servië en vindt hen een liefdevol thuis in Nederland, België, Duitsland en Oostenrijk. Bekijk onze honden.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Hope for Dogs — Adopteer een Straathond uit Bosnië en Servië">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Hope for Dogs redt straathonden in Bosnië en Servië en vindt hen een liefdevol thuis in Nederland, België, Duitsland en Oostenrijk. Bekijk onze honden.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $html = str_replace('</head>', ssr_hreflang_path('') . '</head>', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
