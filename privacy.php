<?php
// Server-side prerender wrapper for privacy.html (privacy policy). Localizes the
// <head> per language (nl/en/de) and injects the reciprocal hreflang mesh, so /en/
// and /de/ are real, self-canonical pages instead of Dutch duplicates. Mirrors
// over-ons.php. The NL description is kept exactly as the template has it; en/de use
// the H4D_PAGE_SEO['privacy'] strings. On ANY failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/privacy.html';

$TITLES = [
    'nl' => 'Privacybeleid | Hope for Dogs',
    'de' => 'Datenschutz | Hope for Dogs',
    'en' => 'Privacy Policy | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Privacyverklaring van Stichting Hope for Dogs Europe: welke persoonsgegevens wij verwerken, waarom, hoelang wij ze bewaren en welke rechten je hebt volgens de AVG.',
    'de' => 'Datenschutzerklärung der Stiftung Hope for Dogs Europe: welche personenbezogenen Daten wir verarbeiten und welche Rechte du gemäß DSGVO hast.',
    'en' => 'Privacy policy of Stichting Hope for Dogs Europe: which personal data we process and your rights under the GDPR.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('privacy.html', $lang);

    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Privacybeleid | Hope for Dogs</title>',
        '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Privacyverklaring van Stichting Hope for Dogs Europe: welke persoonsgegevens wij verwerken, waarom, hoelang wij ze bewaren en welke rechten je hebt volgens de AVG.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/privacy.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Privacybeleid | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Privacyverklaring van Stichting Hope for Dogs Europe: hoe wij omgaan met je persoonsgegevens volgens de AVG.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/privacy.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $html = str_replace('</head>', ssr_hreflang('privacy.html') . '</head>', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
