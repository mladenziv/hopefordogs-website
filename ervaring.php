<?php
// Server-side prerender wrapper for ervaring.html (individual adoption story).
// Same approach as post.php: inject per-story head tags + visible content +
// Article/BreadcrumbList JSON-LD into the crawlable HTML so non-JS crawlers and
// AI bots see the real story (not the empty shell). On ANY failure -> shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/ervaring.html';
$id = isset($_GET['id']) ? (string) $_GET['id'] : '';
$slug = isset($_GET['slug']) ? (string) $_GET['slug'] : '';

try {
    $lang = ssr_lang();

    // Resolve by slug (/ervaring/<slug>) or by legacy ?id= which 301s to the slug.
    if ($slug !== '' && preg_match('/^[A-Za-z0-9-]{1,120}$/', $slug)) {
        $rows = ssr_get('/rest/v1/stories?select=*&slug=eq.' . rawurlencode($slug));
    } elseif ($id !== '' && preg_match('/^[A-Za-z0-9_-]{8,64}$/', $id)) {
        $rows = ssr_get('/rest/v1/stories?select=*&id=eq.' . rawurlencode($id));
    } else {
        ssr_passthru($tpl);
    }
    if ($rows === null) ssr_passthru($tpl);        // API error -> 200 shell (client retries)
    if (count($rows) === 0) ssr_not_found($tpl);   // unknown story -> 404
    $story = $rows[0];

    $name = trim((string) ($story['dog_name'] ?? ''));
    if ($name === '') ssr_passthru($tpl);

    // Consolidate a legacy ?id= URL onto the clean slug.
    $storySlug = trim((string) ($story['slug'] ?? ''));
    if ($slug === '' && $storySlug !== '') {
        header('Location: ' . ssr_url_path('ervaring/' . rawurlencode($storySlug), $lang), true, 301);
        exit;
    }

    $description = (string) ssr_field($story, 'description', $lang);
    $fullStory  = (string) ssr_field($story, 'full_story', $lang);
    $adopter    = trim((string) ($story['adopter_name'] ?? ''));
    $storyText  = $fullStory !== '' ? $fullStory : $description;

    // Primary image: story.photo_url, else the primary story_photos row.
    $photo = !empty($story['photo_url']) ? $story['photo_url'] : null;
    if ($photo === null) {
        $ph = ssr_get('/rest/v1/story_photos?select=photo_url&story_id=eq.' . rawurlencode($id) . '&order=is_primary.desc&limit=1');
        if (is_array($ph) && count($ph) > 0 && !empty($ph[0]['photo_url'])) $photo = $ph[0]['photo_url'];
    }

    $fullTitle = $name . ' — Adoptieverhaal | Hope for Dogs';
    $descShort = $description !== '' ? mb_substr(trim($description), 0, 140) : ('Lees het adoptieverhaal van ' . $name . '.');
    if ($storySlug !== '') {
        $canonical = ssr_url_path('ervaring/' . $storySlug, $lang);
        $hreflangMesh = ssr_hreflang_path('ervaring/' . $storySlug);
    } else {
        $q = '?id=' . rawurlencode($id);
        $canonical = ssr_url('ervaring.html', $lang, $q);
        $hreflangMesh = ssr_hreflang('ervaring.html', $q);
    }

    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    // --- HEAD ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Adoptieverhaal | Hope for Dogs</title>', '<title>' . ssr_h($fullTitle) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Lees dit adoptieverhaal van Hope for Dogs. Ontdek hoe een straathond uit Bosnië of Servië een liefdevol thuis vond.">',
        '<meta name="description" content="' . ssr_h($descShort) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/ervaring.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Adoptieverhaal | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($fullTitle) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Lees dit adoptieverhaal van Hope for Dogs. Ontdek hoe een straathond een liefdevol thuis vond.">',
        '<meta property="og:description" content="' . ssr_h($descShort) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/ervaring.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);
    if ($photo) {
        $html = str_replace('<meta property="og:image" content="https://www.hopefordogseurope.com/images/hero-1.png">',
            '<meta property="og:image" content="' . ssr_h($photo) . '">', $html);
    }

    // --- hreflang + BreadcrumbList + Article JSON-LD before </head> ---
    $bcHome = ['nl' => 'Home', 'de' => 'Startseite', 'en' => 'Home'][$lang] ?? 'Home';
    $bcCat  = ['nl' => 'Ervaringen', 'de' => 'Erfahrungen', 'en' => 'Experiences'][$lang] ?? 'Ervaringen';
    $bc = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => $bcHome, 'item' => SSR_ORIGIN . ($lang === 'nl' ? '/' : '/' . $lang . '/')],
        ['@type' => 'ListItem', 'position' => 2, 'name' => $bcCat, 'item' => ssr_url('ervaringen.html', $lang)],
        ['@type' => 'ListItem', 'position' => 3, 'name' => $name],
    ]];
    $article = ['@context' => 'https://schema.org', '@type' => 'Article',
        'headline' => $name . ' — Adoptieverhaal',
        'datePublished' => $story['created_at'] ?? '', 'image' => $photo ?: '',
        'author' => ['@type' => 'Organization', 'name' => 'Hope for Dogs'],
        'publisher' => ['@type' => 'Organization', 'name' => 'Hope for Dogs',
            'logo' => ['@type' => 'ImageObject', 'url' => SSR_ORIGIN . '/logo.png']],
        'description' => $description];
    $headInsert = $hreflangMesh
        . '  <script type="application/ld+json" id="ssr-ld-breadcrumb">' . json_encode($bc, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n"
        . '  <script type="application/ld+json" id="ssr-ld-article">' . json_encode($article, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
    $html = str_replace('</head>', $headInsert . '</head>', $html);

    // --- Visible content ---
    $html = str_replace('<span class="breadcrumb-current" id="breadcrumbName"></span>',
        '<span class="breadcrumb-current" id="breadcrumbName">' . ssr_h($name) . '</span>', $html);
    $html = str_replace('<h1 class="story-name t-heading-lg" id="storyName"></h1>',
        '<h1 class="story-name t-heading-lg" id="storyName">' . ssr_h($name) . '</h1>', $html);
    if ($adopter !== '') {
        $adoptedBy = ['nl' => 'Geadopteerd door', 'de' => 'Adoptiert von', 'en' => 'Adopted by'][$lang] ?? 'Geadopteerd door';
        $html = str_replace('<div class="story-adopter" id="storyAdopter"></div>',
            '<div class="story-adopter" id="storyAdopter">' . ssr_h($adoptedBy . ' ' . $adopter) . '</div>', $html);
    }
    // Story text is plain text (the template renders it with white-space:pre-line).
    $html = str_replace('<div class="story-text" id="storyText"></div>',
        '<div class="story-text" id="storyText">' . ssr_h($storyText) . '</div>', $html);
    if ($photo) {
        $html = str_replace('<div class="carousel-track" id="storyCarouselTrack"></div>',
            '<div class="carousel-track" id="storyCarouselTrack"><div class="carousel-slide"><img src="' . ssr_h($photo) . '" alt="' . ssr_h('Foto van ' . $name) . '"></div></div>', $html);
    }

    // Paint server content immediately.
    $html = str_replace('<div class="loading-screen" id="loadingScreen">',
        '<div class="loading-screen" id="loadingScreen" style="display:none;">', $html);
    $html = str_replace('id="storySection" style="display:none;"', 'id="storySection" style="display:block;"', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
