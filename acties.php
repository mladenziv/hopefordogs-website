<?php
// Server-side prerender wrapper for acties.html. Localizes the <head> per language
// (nl/en/de) and injects the reciprocal hreflang mesh, so /en/ and /de/ are real,
// self-canonical pages instead of Dutch duplicates. Mirrors the contact.php pattern.
// Strings match H4D_PAGE_SEO['acties']. On ANY failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/acties.html';

$TITLES = [
    'nl' => 'Acties — Steun onze straathonden | Hope for Dogs',
    'de' => 'Aktionen — Unterstütze unsere Straßenhunde | Hope for Dogs',
    'en' => 'Campaigns — Support our street dogs | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Doe mee met onze acties: koop een lot, bestel onze kalender of steun een inzameling. Elke bijdrage helpt straathonden in Bosnië en Servië.',
    'de' => 'Mach bei unseren Aktionen mit: Kaufe ein Los, bestelle unseren Kalender oder unterstütze eine Sammlung. Jeder Beitrag hilft Straßenhunden in Bosnien und Serbien.',
    'en' => 'Join our campaigns: buy a raffle ticket, order our calendar, or support a fundraiser. Every contribution helps street dogs in Bosnia and Serbia.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('acties.html', $lang);

    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Acties | Hope for Dogs</title>',
        '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Doe mee met onze acties: koop een lot, bestel onze kalender of steun een inzameling. Elke bijdrage helpt straathonden in Bosnië en Servië.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/acties.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Acties | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace('<meta property="og:description" content="Doe mee met onze acties en steun straathonden in Bosnië en Servië.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/acties.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $html = str_replace('</head>', ssr_hreflang('acties.html') . '</head>', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
