<?php
// Server-side prerender wrapper for over-ons.html (about page). Localizes the
// head per language and injects the FAQPage JSON-LD (built from the faqs table,
// full Q&A) into <head> so the FAQ is machine-readable and AI-citable without JS.
// The visible FAQ accordion + team stay client-rendered (a client guard on
// #ssr-ld-faq prevents a duplicate schema). On ANY failure -> untouched shell.

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

    // --- FAQPage schema (best-effort) — full Q&A, machine-readable + AI-citable.
    // The faqs table uses question_<lang>/answer_<lang> columns (no bare base col),
    // so read them directly the way the client does (f['question_'+lang] || question_nl).
    $faqs = ssr_get('/rest/v1/faqs?select=*&order=sort_order.asc,created_at.asc');
    if ($faqs !== null && count($faqs) > 0) {
        $mainEntity = [];
        foreach ($faqs as $f) {
            $q = !empty($f['question_' . $lang]) ? $f['question_' . $lang] : ($f['question_nl'] ?? '');
            $a = !empty($f['answer_' . $lang]) ? $f['answer_' . $lang] : ($f['answer_nl'] ?? '');
            if (trim((string) $q) === '' || trim((string) $a) === '') continue;
            $mainEntity[] = ['@type' => 'Question', 'name' => $q,
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $a]];
        }
        if (count($mainEntity) > 0) {
            $faqSchema = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $mainEntity];
            $headInsert .= '  <script type="application/ld+json" id="ssr-ld-faq">'
                . json_encode($faqSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
        }
    }

    $html = str_replace('</head>', $headInsert . '</head>', $html);
    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
