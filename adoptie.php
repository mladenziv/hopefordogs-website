<?php
// Server-side prerender wrapper for adoptie.html (adoption process). Localizes the
// <head> per language (nl/en/de) and injects the reciprocal hreflang mesh, so /en/
// and /de/ are real, self-canonical pages instead of Dutch duplicates. Mirrors the
// over-ons.php pattern. Title/description are the same strings the client sets from
// H4D_PAGE_SEO['adoptie']. On ANY failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/adoptie.html';

$TITLES = [
    'nl' => 'Buitenlandse Hond Adopteren uit Bosnië & Servië | Hope for Dogs',
    'de' => 'Rettungshund aus Europa adoptieren — aus Bosnien & Serbien | Hope for Dogs',
    'en' => 'Adopt a Rescue Dog from Europe — from Bosnia & Serbia | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Een buitenlandse straathond uit Bosnië of Servië adopteren? Ontdek het proces, de kosten (€230 + €200 transport) en hoe wij alles regelen. Bekijk onze honden.',
    'de' => 'Einen Straßenhund aus dem Ausland (Bosnien/Serbien) adoptieren? Ablauf, Kosten (230 € + 200 € Transport) und wie wir alles organisieren. Entdecke unsere Hunde.',
    'en' => 'Adopt a foreign street dog from Bosnia or Serbia? Discover the process, the costs (€230 + €200 transport) and how we arrange everything. Browse our dogs.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url_path('buitenlandse-hond-adopteren', $lang);

    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Buitenlandse Hond Adopteren uit Bosnië & Servië | Hope for Dogs</title>',
        '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Een buitenlandse straathond uit Bosnië of Servië adopteren? Ontdek het proces, de kosten (€230 + €200 transport) en hoe wij alles regelen. Bekijk onze honden.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/buitenlandse-hond-adopteren">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Buitenlandse Hond Adopteren uit Bosnië & Servië | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Een buitenlandse straathond uit Bosnië of Servië adopteren? Ontdek het proces, de kosten (€230 + €200 transport) en hoe wij alles regelen. Bekijk onze honden.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/buitenlandse-hond-adopteren">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $html = str_replace('</head>', ssr_hreflang_path('buitenlandse-hond-adopteren') . '</head>', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
