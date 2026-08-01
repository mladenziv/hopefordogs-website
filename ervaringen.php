<?php
// Server-side prerender wrapper for ervaringen.html (adoption-stories list).
// Same approach as honden.php: localize head per language + inject a server-
// rendered grid of story cards (crawlable <a href> to ervaring.html?id=,
// matching the client card markup) + CollectionPage/ItemList JSON-LD. The client
// wholesale-replaces #storiesGrid on hydrate. On ANY failure -> untouched shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/ervaringen.html';

$TITLES = [
    'nl' => 'Adoptieverhalen — Ervaringen van Adoptanten | Hope for Dogs',
    'de' => 'Adoptionsgeschichten — Erfahrungen von Adoptanten | Hope for Dogs',
    'en' => 'Adoption Stories — Experiences from Adopters | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Lees de mooiste adoptieverhalen van Hope for Dogs. Onze honden vonden hun thuis in Nederland, België, Duitsland en Oostenrijk.',
    'de' => 'Lies die schönsten Adoptionsgeschichten von Hope for Dogs. Unsere Hunde fanden ihr Zuhause in den Niederlanden, Belgien, Deutschland und Österreich.',
    'en' => 'Read the most heartwarming adoption stories from Hope for Dogs. Our dogs found their homes in the Netherlands, Belgium, Germany and Austria.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('ervaringen.html', $lang);

    // --- HEAD (per-language localization; no fetch needed) ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Adoptieverhalen — Ervaringen van Adoptanten | Hope for Dogs</title>', '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Lees de mooiste adoptieverhalen van Hope for Dogs. Onze honden vonden hun thuis in Nederland, België, Duitsland en Oostenrijk.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/ervaringen.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Adoptieverhalen — Ervaringen van Adoptanten | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Lees de mooiste adoptieverhalen van Hope for Dogs. Van straathond tot huisdier — ontdek hoe onze honden hun thuis vonden.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/ervaringen.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    $headInsert = ssr_hreflang('ervaringen.html');

    // --- Stories grid + ItemList (best-effort; skip on fetch failure) ---
    $stories = ssr_get('/rest/v1/stories?select=id,dog_name,adopter_name,description,description_de,description_en,photo_url&order=sort_order.asc.nullslast,created_at.desc');
    if ($stories !== null && count($stories) > 0) {
        $ervPath = ($lang === 'nl') ? '/ervaring.html' : '/' . $lang . '/ervaring.html';
        $cards = '';
        $items = [];
        $pos = 0;
        foreach ($stories as $st) {
            $sid = $st['id'] ?? '';
            $dn = trim((string) ($st['dog_name'] ?? ''));
            if ($sid === '' || $dn === '') continue;
            $href = $ervPath . '?id=' . rawurlencode($sid);
            $img = !empty($st['photo_url']) ? $st['photo_url'] : '/images/placeholder-dog.svg';
            $d = trim((string) ssr_field($st, 'description', $lang));
            $ad = trim((string) ($st['adopter_name'] ?? ''));
            $cards .= '<a href="' . ssr_h($href) . '" class="testimonial-card">'
                . '<img src="' . ssr_h($img) . '" alt="' . ssr_h($dn) . '" class="testimonial-card-img" loading="lazy" decoding="async">'
                . '<div class="testimonial-card-body">'
                . '<div class="testimonial-card-name t-heading-sm">' . ssr_h($dn) . '</div>'
                . ($ad !== '' ? '<div class="testimonial-card-adopter">' . ssr_h($ad) . '</div>' : '')
                . '<div class="testimonial-card-desc t-body-sm">' . ssr_h($d) . '</div>'
                . '</div></a>';
            $pos++;
            $items[] = ['@type' => 'ListItem', 'position' => $pos, 'url' => SSR_ORIGIN . $href, 'name' => $dn];
        }
        if ($cards !== '') {
            // Inject after the grid's opening tag (before the skeletons). JS replaces
            // #storiesGrid wholesale on hydrate.
            $html = str_replace('<div class="testimonials-grid" id="storiesGrid">',
                '<div class="testimonials-grid" id="storiesGrid">' . $cards, $html);
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
