<?php
// Server-side prerender wrapper for over-ons.html (about page). Localizes the
// head per language (title/description/canonical/og + hreflang mesh). The FAQ was
// moved to the adoption flagship (adoptie) to avoid duplicate FAQ content + schema
// across pages, so this wrapper no longer injects FAQPage JSON-LD.
// On ANY failure -> untouched shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/over-ons.html';

$TITLES = [
    'nl' => 'Over Ons — Ons Verhaal & Missie | Hope for Dogs',
    'de' => 'Europäische Hunderettung — Straßenhunde aus Bosnien & Serbien retten | Hope for Dogs',
    'en' => 'European Dog Rescue — Rescuing Street Dogs from Bosnia & Serbia | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Leer meer over Hope for Dogs, een non-profit die straathonden redt in Bosnië en Servië. Ons team van vrijwilligers zet zich dag en nacht in voor een beter leven.',
    'de' => 'Erfahre mehr über Hope for Dogs, eine gemeinnützige Organisation, die Streunerhunde in Bosnien und Serbien rettet. Unser Team aus Freiwilligen setzt sich Tag und Nacht für ein besseres Leben ein.',
    'en' => 'Learn more about Hope for Dogs, a non-profit rescuing stray dogs in Bosnia and Serbia. Our team of volunteers works day and night for a better life.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('over-ons.html', $lang);

    // --- HEAD ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Over Ons — Ons Verhaal & Missie | Hope for Dogs</title>', '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Leer meer over Hope for Dogs, een non-profit die straathonden redt in Bosnië en Servië. Ons team van vrijwilligers zet zich dag en nacht in voor een beter leven.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/over-ons.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Over Ons — Ons Verhaal & Missie | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Leer meer over Hope for Dogs, een non-profit die straathonden redt in Bosnië en Servië. Ons team van vrijwilligers zet zich dag en nacht in.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/over-ons.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $headInsert = ssr_hreflang('over-ons.html');

    $html = str_replace('</head>', $headInsert . '</head>', $html);
    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
