<?php
// Server-side prerender wrapper for doneer.html (donate). Localizes the <head> per
// language (nl/en/de) and injects the reciprocal hreflang mesh, so /en/ and /de/ are
// real, self-canonical pages instead of Dutch duplicates. Mirrors over-ons.php.
// Strings match H4D_PAGE_SEO['doneer']. On ANY failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/doneer.html';

$TITLES = [
    'nl' => 'Doneer — Help Straathonden in Nood | Hope for Dogs',
    'de' => 'Spenden — Hilf Streunerhunden in Not | Hope for Dogs',
    'en' => 'Donate — Help Stray Dogs in Need | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Steun Hope for Dogs met een donatie. Elke bijdrage helpt bij voeding, medische zorg en opvang van straathonden in Bosnië en Servië.',
    'de' => 'Unterstütze Hope for Dogs mit einer Spende. Jeder Beitrag hilft bei Futter, medizinischer Versorgung und Unterbringung von Streunerhunden in Bosnien und Serbien.',
    'en' => 'Support Hope for Dogs with a donation. Every contribution helps with food, medical care, and shelter for stray dogs in Bosnia and Serbia.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('doneer.html', $lang);

    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Doneer — Help Straathonden in Nood | Hope for Dogs</title>',
        '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Steun Hope for Dogs met een donatie. Elke bijdrage helpt bij voeding, medische zorg en opvang van straathonden in Bosnië en Servië.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/doneer.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Doneer — Help Straathonden in Nood | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Steun Hope for Dogs met een donatie. Elke bijdrage helpt bij voeding, medische zorg en opvang van straathonden in Bosnië en Servië.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/doneer.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $html = str_replace('</head>', ssr_hreflang('doneer.html') . '</head>', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
