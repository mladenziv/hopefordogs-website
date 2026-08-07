<?php
// Server-side prerender wrapper for honden.html (dog listing / category page).
// Two jobs: (1) localize head tags (title/desc/canonical/og/hreflang) per language
// so non-JS crawlers get the correct /de//en canonical instead of the nl static one;
// (2) inject a simple server-rendered grid of available dogs + ItemList JSON-LD so
// the category page has real content + internal links for crawlers. The client JS
// wholesale-replaces #dogsGrid on hydrate (renderDogs), so this only aids crawlers
// and the first paint. Any hard error -> untouched template.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/honden.html';

// Per-language head strings (mirror H4D_PAGE_SEO['honden'] in components.js).
$TITLES = [
    'nl' => 'Adoptiehonden — Beschikbare Honden | Hope for Dogs',
    'de' => 'Adoptionshunde — Verfügbare Hunde | Hope for Dogs',
    'en' => 'Adoptable Dogs — Available Dogs | Hope for Dogs',
];
$DESCS = [
    'nl' => 'Bekijk alle beschikbare adoptiehonden van Hope for Dogs. Straathonden uit Bosnië en Servië, medisch behandeld en klaar voor een nieuw thuis.',
    'de' => 'Entdecke alle verfügbaren Adoptionshunde von Hope for Dogs. Streunerhunde aus Bosnien und Serbien, medizinisch behandelt und bereit für ein neues Zuhause.',
    'en' => 'Browse all adoptable dogs at Hope for Dogs. Stray dogs from Bosnia and Serbia, medically treated and ready for a new home.',
];

try {
    $lang = ssr_lang();
    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    $title = $TITLES[$lang] ?? $TITLES['nl'];
    $desc = $DESCS[$lang] ?? $DESCS['nl'];
    $canonical = ssr_url('honden.html', $lang);

    // --- HEAD (always; no fetch needed — pure per-language localization) ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Adoptiehonden — Beschikbare Honden | Hope for Dogs</title>', '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Bekijk alle beschikbare adoptiehonden van Hope for Dogs. Straathonden uit Bosnië en Servië, medisch behandeld en klaar voor een nieuw thuis.">',
        '<meta name="description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/honden.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Adoptiehonden — Beschikbare Honden | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Bekijk alle beschikbare adoptiehonden van Hope for Dogs. Straathonden uit Bosnië en Servië, medisch behandeld en klaar voor een nieuw thuis.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/honden.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);

    // hreflang mesh before </head>
    $headInsert = ssr_hreflang('honden.html');

    // --- Available dogs for the grid + ItemList (best-effort; skip on fetch failure) ---
    $dogs = ssr_get('/rest/v1/dogs?select=id,naam,slug&draft=eq.false&status=neq.geadopteerd&order=sort_order.asc.nullsfirst,created_at.desc&limit=200');
    if ($dogs !== null && count($dogs) > 0) {
        $primary = ssr_get('/rest/v1/dog_photos?select=dog_id,photo_url&is_primary=eq.true');
        $photoBy = [];
        if (is_array($primary)) {
            foreach ($primary as $p) {
                if (!empty($p['dog_id']) && !empty($p['photo_url']) && !isset($photoBy[$p['dog_id']])) {
                    $photoBy[$p['dog_id']] = $p['photo_url'];
                }
            }
        }
        $hondPath = ($lang === 'nl') ? '/hond.html' : '/' . $lang . '/hond.html';
        $altSuffix = ['nl' => 'adoptiehond uit Bosnië & Servië', 'de' => 'Adoptionshund aus Bosnien & Serbien', 'en' => 'adoptable dog from Bosnia & Serbia'][$lang] ?? 'adoptiehond uit Bosnië & Servië';
        $cards = '';
        $items = [];
        $pos = 0;
        foreach ($dogs as $dog) {
            $did = $dog['id'] ?? '';
            $naam = trim((string) ($dog['naam'] ?? ''));
            if ($did === '' || $naam === '') continue;
            $s = trim((string) ($dog['slug'] ?? ''));
            $href = ($s !== '')
                ? (($lang === 'nl' ? '/hond/' : '/' . $lang . '/hond/') . rawurlencode($s))
                : ($hondPath . '?id=' . rawurlencode($did));
            $pos++;
            $items[] = ['@type' => 'ListItem', 'position' => $pos,
                'url' => SSR_ORIGIN . $href, 'name' => $naam];
            // Prerender only the first screenful of cards; the client JS hydrates the full
            // list on load. Fewer prerendered cards => far smaller HTML (was ~160KB with the
            // whole kennel) => the page's scripts download and run sooner => cards become
            // tappable faster on mobile. Crawlers still get every dog via the ItemList schema
            // below + sitemap-dogs.xml, so nothing is lost for indexing.
            if ($pos > 24) continue;
            $img = $photoBy[$did] ?? '/images/placeholder-dog.svg';
            // Mirror the client card structure (.dog-card-inner > img + .dog-card-body)
            // so the prerendered/first-paint cards are fully styled — without the
            // wrappers the CSS has nothing to attach to and the card renders unframed
            // with the name in raw flow until the client JS hydrates (FOUC).
            $cards .= '<a class="dog-card" href="' . ssr_h($href) . '">'
                . '<div class="dog-card-inner">'
                . '<img class="dog-card-img" src="' . ssr_h($img) . '" alt="' . ssr_h($naam . ' — ' . $altSuffix) . '" loading="lazy" width="400" height="300">'
                . '<div class="dog-card-body"><div class="dog-card-name">' . ssr_h($naam) . '</div></div>'
                . '</div></a>';
        }
        if ($cards !== '') {
            // Inject server cards right after the grid's opening tag (before the
            // skeletons). JS replaces #dogsGrid wholesale on hydrate.
            $html = str_replace('<div class="dogs-grid" id="dogsGrid">',
                '<div class="dogs-grid" id="dogsGrid">' . $cards, $html);
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
