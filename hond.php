<?php
// Server-side prerender wrapper for hond.html (individual dog page). Injects the
// real dog's title/meta/canonical/og + a visible content block + BreadcrumbList
// into the template so crawlers, AI, and social-share bots see real content and
// the correct per-dog share image. The existing client JS then hydrates the rest
// (full carousel, contact form). On ANY failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/hond.html';
$slug = isset($_GET['slug']) ? (string) $_GET['slug'] : '';
$id = isset($_GET['id']) ? (string) $_GET['id'] : '';

try {
    $lang = ssr_lang();

    // Resolve by slug (/hond/<slug>), or by legacy ?id= which 301s to the slug.
    if ($slug !== '' && preg_match('/^[A-Za-z0-9-]{1,80}$/', $slug)) {
        $dogs = ssr_get('/rest/v1/dogs?select=*&slug=eq.' . rawurlencode($slug) . '&draft=eq.false');
        if ($dogs === null || count($dogs) === 0) ssr_passthru($tpl); // unknown/draft -> shell
    } elseif ($id !== '' && preg_match('/^[A-Za-z0-9_-]{8,64}$/', $id)) {
        $dogs = ssr_get('/rest/v1/dogs?select=*&id=eq.' . rawurlencode($id) . '&draft=eq.false');
        if ($dogs === null || count($dogs) === 0) ssr_passthru($tpl);
        $s = trim((string) ($dogs[0]['slug'] ?? ''));
        if ($s !== '') { // consolidate legacy id URL onto the slug
            header('Location: ' . ssr_url_path('hond/' . rawurlencode($s), $lang), true, 301);
            exit;
        }
    } else {
        ssr_passthru($tpl); // no/invalid slug and id -> shell
    }
    $dog = $dogs[0];

    $naam = trim((string) ($dog['naam'] ?? ''));
    if ($naam === '') ssr_passthru($tpl); // nothing meaningful to render
    $dogId = (string) ($dog['id'] ?? '');
    $dogSlug = trim((string) ($dog['slug'] ?? ''));

    // Adopted dogs stay live (their URLs are shared) but are noindex,follow so the
    // 334-and-growing "found a home" pages don't bloat the index (LISTING-ARCHITECTURE).
    $adopted = ((string) ($dog['status'] ?? '')) === 'geadopteerd';

    $beschrijving = (string) ssr_field($dog, 'beschrijving', $lang);
    $DESC_FALLBACK = ['nl' => 'Gered van de straat en klaar voor een nieuw thuis.', 'de' => 'Von der Straße gerettet und bereit für ein neues Zuhause.', 'en' => 'Rescued from the streets and ready for a new home.'];
    $descShort = $beschrijving !== ''
        ? mb_substr($beschrijving, 0, 120)
        : ($DESC_FALLBACK[$lang] ?? $DESC_FALLBACK['nl']);

    // Primary photo — same ordering the client uses for the carousel.
    $photos = ssr_get('/rest/v1/dog_photos?select=photo_url&dog_id=eq.' . rawurlencode($dogId)
        . '&order=sort_order.asc.nullslast,is_primary.desc,created_at.asc');
    $img = ($photos && count($photos) && !empty($photos[0]['photo_url'])) ? $photos[0]['photo_url'] : null;

    // Language-aware title/description (previously hardcoded Dutch, which leaked onto /de/ and /en/).
    $TITLE_SUFFIX = ['nl' => 'Adoptiehond | Hope for Dogs', 'de' => 'Adoptionshund | Hope for Dogs', 'en' => 'Adoptable Dog | Hope for Dogs'];
    $DESC_PREFIX  = ['nl' => 'Maak kennis met ', 'de' => 'Das ist ', 'en' => 'Meet '];
    $title = $naam . ' — ' . ($TITLE_SUFFIX[$lang] ?? $TITLE_SUFFIX['nl']);
    $desc = ($DESC_PREFIX[$lang] ?? $DESC_PREFIX['nl']) . $naam . '. ' . $descShort;
    // Slug URL when the row has a slug; otherwise the legacy ?id= form.
    if ($dogSlug !== '') {
        $canonical = ssr_url_path('hond/' . $dogSlug, $lang);
        $hreflangMesh = ssr_hreflang_path('hond/' . $dogSlug);
    } else {
        $q = '?id=' . rawurlencode($dogId);
        $canonical = ssr_url('hond.html', $lang, $q);
        $hreflangMesh = ssr_hreflang('hond.html', $q);
    }

    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    // --- HEAD replacements (targeted; a no-match is degrade-safe: JS still fixes it) ---
    if ($lang !== 'nl') {
        $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    }
    $html = str_replace('<title>Hond | Hope for Dogs</title>', '<title>' . ssr_h($title) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Leer meer over deze adoptiehond van Hope for Dogs. Gered van de straat in Bosnië of Servië, medisch behandeld en klaar voor een thuis.">',
        '<meta name="description" content="' . ssr_h($desc) . '">',
        $html
    );
    $html = str_replace(
        '<link rel="canonical" href="https://www.hopefordogseurope.com/hond.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">',
        $html
    );
    $html = str_replace(
        '<meta property="og:title" content="Adoptiehond | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($title) . '">',
        $html
    );
    $html = str_replace(
        '<meta property="og:description" content="Leer meer over deze adoptiehond van Hope for Dogs. Gered van de straat, medisch behandeld en klaar voor een thuis.">',
        '<meta property="og:description" content="' . ssr_h($desc) . '">',
        $html
    );
    $html = str_replace(
        '<meta property="og:url" content="https://www.hopefordogseurope.com/hond.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">',
        $html
    );
    if ($img) {
        $html = str_replace(
            '<meta property="og:image" content="https://www.hopefordogseurope.com/images/hero-1.png">',
            '<meta property="og:image" content="' . ssr_h($img) . '">',
            $html
        );
    }

    // --- hreflang mesh + BreadcrumbList JSON-LD before </head> ---
    $bcHome = ['nl' => 'Home', 'de' => 'Startseite', 'en' => 'Home'][$lang] ?? 'Home';
    $bcCat = ['nl' => 'Honden', 'de' => 'Hunde', 'en' => 'Dogs'][$lang] ?? 'Honden';
    $ld = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            ['@type' => 'ListItem', 'position' => 1, 'name' => $bcHome, 'item' => SSR_ORIGIN . ($lang === 'nl' ? '/' : '/' . $lang . '/')],
            ['@type' => 'ListItem', 'position' => 2, 'name' => $bcCat, 'item' => ssr_url('honden.html', $lang)],
            ['@type' => 'ListItem', 'position' => 3, 'name' => $naam],
        ],
    ];
    $headInsert = ($adopted ? '  <meta name="robots" content="noindex,follow">' . "\n" : '')
        . $hreflangMesh
        . '  <script type="application/ld+json" id="ssr-ld-breadcrumb">'
        . json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        . '</script>' . "\n";
    $html = str_replace('</head>', $headInsert . '</head>', $html);

    // --- Visible content block (fills empty nodes; JS re-fills identically on hydrate) ---
    $html = str_replace(
        '<span class="breadcrumb-current" id="breadcrumbName"></span>',
        '<span class="breadcrumb-current" id="breadcrumbName">' . ssr_h($naam) . '</span>',
        $html
    );
    $html = str_replace(
        '<h1 class="dog-name t-heading-lg" id="dogName"></h1>',
        '<h1 class="dog-name t-heading-lg" id="dogName">' . ssr_h($naam) . '</h1>',
        $html
    );
    $html = str_replace(
        '<p class="dog-description" id="dogDescription"></p>',
        '<p class="dog-description" id="dogDescription">' . nl2br(ssr_h($beschrijving)) . '</p>',
        $html
    );
    if ($img) {
        $slide = '<div class="carousel-slide"><img src="' . ssr_h($img) . '" alt="Foto van ' . ssr_h($naam) . '" width="800" height="600"></div>';
        $html = str_replace(
            '<div class="carousel-track" id="carouselTrack"></div>',
            '<div class="carousel-track" id="carouselTrack">' . $slide . '</div>',
            $html
        );
    }

    // Paint server content immediately (JS later sets the same display values).
    $html = str_replace(
        '<div class="loading-screen" id="loadingScreen">',
        '<div class="loading-screen" id="loadingScreen" style="display:none;">',
        $html
    );
    $html = str_replace(
        'id="detailSection" style="display:none;"',
        'id="detailSection" style="display:block;"',
        $html
    );

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl); // backstop: any unexpected error -> today's behaviour
}
