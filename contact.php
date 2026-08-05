<?php
// Server-side prerender wrapper for contact.html. Localizes the <head> per language
// (nl/en/de) and injects the reciprocal hreflang mesh, so /en/ and /de/ are real,
// self-canonical pages instead of Dutch duplicates. Mirrors the over-ons.php pattern.
// Strings match H4D_PAGE_SEO['contact']. On ANY failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/contact.html';

$TITLES = [
    'nl' => 'Contact | Hope for Dogs',
    'de' => 'Kontakt | Hope for Dogs',
    'en' => 'Contact | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Neem contact op met Hope for Dogs. Vragen over adoptie, ons werk of hoe je kunt helpen? Stuur ons een bericht.',
    'de' => 'Kontaktiere Hope for Dogs. Fragen zur Adoption, unserer Arbeit oder wie du helfen kannst? Schick uns eine Nachricht.',
    'en' => 'Get in touch with Hope for Dogs. Questions about adoption, our work, or how you can help? Send us a message.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('contact.html', $lang);

    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Contact | Hope for Dogs</title>',
        '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Neem contact op met Hope for Dogs. Vragen over adoptie, ons werk of hoe je kunt helpen? Stuur ons een bericht.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/contact.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Contact | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace('<meta property="og:description" content="Neem contact op met Hope for Dogs.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/contact.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $html = str_replace('</head>', ssr_hreflang('contact.html') . '</head>', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
