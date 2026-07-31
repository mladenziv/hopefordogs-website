<?php
// Server-side prerender wrapper for post.html (blog post). Same approach as
// hond.php. Adds a publish-date gate: draft/scheduled posts are NEVER prerendered
// for crawlers (they fall through to the shell; the client still honours ?preview
// for a logged-in admin). On any failure -> untouched template shell.

require __DIR__ . '/render.php';

$tpl = __DIR__ . '/post.html';
$id = isset($_GET['id']) ? (string) $_GET['id'] : '';

if ($id === '' || !preg_match('/^[A-Za-z0-9_-]{8,64}$/', $id)) ssr_passthru($tpl);

// Dutch date format, matching the template's client-side formatDate().
function ssr_post_date($s) {
    if (!$s) return '';
    $ts = strtotime($s);
    if ($ts === false) return '';
    $months = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
    return (int) gmdate('j', $ts) . ' ' . $months[(int) gmdate('n', $ts) - 1] . ' ' . gmdate('Y', $ts);
}

try {
    $lang = ssr_lang();

    $posts = ssr_get('/rest/v1/posts?select=*&id=eq.' . rawurlencode($id));
    if ($posts === null || count($posts) === 0) ssr_passthru($tpl);
    $post = $posts[0];

    // Publish gate (mirror the client): live = published_at set AND <= now.
    // Drafts/scheduled are never prerendered for crawlers.
    $pub = $post['published_at'] ?? null;
    $isLive = $pub && strtotime($pub) !== false && strtotime($pub) <= time();
    if (!$isLive) ssr_passthru($tpl);

    $title = trim((string) ssr_field($post, 'title', $lang));
    if ($title === '') ssr_passthru($tpl);
    $excerpt = (string) ssr_field($post, 'excerpt', $lang);
    $content = (string) ssr_field($post, 'content', $lang);
    $photo = !empty($post['photo_url']) ? $post['photo_url'] : null;

    $base = $excerpt !== '' ? $excerpt : $content;
    $descShort = $base !== '' ? mb_substr(trim(strip_tags($base)), 0, 140) : 'Lees het laatste nieuws van Hope for Dogs.';

    $query = '?id=' . rawurlencode($id);
    $fullTitle = $title . ' — Nieuws | Hope for Dogs';
    $canonical = ssr_url('post.html', $lang, $query);
    $dateStr = ssr_post_date($pub ?: ($post['created_at'] ?? null));

    $html = file_get_contents($tpl);
    if ($html === false) ssr_passthru($tpl);

    // --- HEAD ---
    if ($lang !== 'nl') $html = str_replace('<html lang="nl">', '<html lang="' . $lang . '">', $html);
    $html = str_replace('<title>Nieuws | Hope for Dogs</title>', '<title>' . ssr_h($fullTitle) . '</title>', $html);
    $html = str_replace(
        '<meta name="description" content="Lees dit nieuwsbericht van Hope for Dogs over onze reddingsacties en het leven in het asiel.">',
        '<meta name="description" content="' . ssr_h($descShort) . '">', $html);
    $html = str_replace('<link rel="canonical" href="https://www.hopefordogseurope.com/post.html">',
        '<link rel="canonical" href="' . ssr_h($canonical) . '">', $html);
    $html = str_replace('<meta property="og:title" content="Nieuws | Hope for Dogs">',
        '<meta property="og:title" content="' . ssr_h($fullTitle) . '">', $html);
    $html = str_replace(
        '<meta property="og:description" content="Lees dit nieuwsbericht van Hope for Dogs over onze reddingsacties en het leven in het asiel.">',
        '<meta property="og:description" content="' . ssr_h($descShort) . '">', $html);
    $html = str_replace('<meta property="og:url" content="https://www.hopefordogseurope.com/post.html">',
        '<meta property="og:url" content="' . ssr_h($canonical) . '">', $html);
    if ($photo) {
        $html = str_replace('<meta property="og:image" content="https://www.hopefordogseurope.com/images/hero-1.png">',
            '<meta property="og:image" content="' . ssr_h($photo) . '">', $html);
    }

    // --- hreflang + BreadcrumbList + Article JSON-LD before </head> ---
    $bcHome = ['nl' => 'Home', 'de' => 'Startseite', 'en' => 'Home'][$lang] ?? 'Home';
    $bcCat = ['nl' => 'Nieuws', 'de' => 'Neuigkeiten', 'en' => 'News'][$lang] ?? 'Nieuws';
    $bc = ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => $bcHome, 'item' => SSR_ORIGIN . ($lang === 'nl' ? '/' : '/' . $lang . '/')],
        ['@type' => 'ListItem', 'position' => 2, 'name' => $bcCat, 'item' => ssr_url('nieuws.html', $lang)],
        ['@type' => 'ListItem', 'position' => 3, 'name' => $title],
    ]];
    $article = ['@context' => 'https://schema.org', '@type' => 'BlogPosting', 'headline' => $title,
        'datePublished' => $pub ?: ($post['created_at'] ?? ''), 'image' => $photo ?: '',
        'author' => ['@type' => 'Organization', 'name' => 'Hope for Dogs'],
        'publisher' => ['@type' => 'Organization', 'name' => 'Hope for Dogs',
            'logo' => ['@type' => 'ImageObject', 'url' => SSR_ORIGIN . '/logo.png']],
        'description' => $excerpt !== '' ? $excerpt : mb_substr(trim(strip_tags($content)), 0, 160)];
    $headInsert = ssr_hreflang('post.html', $query)
        . '  <script type="application/ld+json" id="ssr-ld-breadcrumb">' . json_encode($bc, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n"
        . '  <script type="application/ld+json" id="ssr-ld-article">' . json_encode($article, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
    $html = str_replace('</head>', $headInsert . '</head>', $html);

    // --- Visible content block ---
    $html = str_replace('<span class="breadcrumb-current" id="breadcrumbName"></span>',
        '<span class="breadcrumb-current" id="breadcrumbName">' . ssr_h($title) . '</span>', $html);
    $html = str_replace('<div class="post-date" id="postDate"></div>',
        '<div class="post-date" id="postDate">' . ssr_h($dateStr) . '</div>', $html);
    $html = str_replace('<h1 class="post-title t-heading-lg" id="postTitle"></h1>',
        '<h1 class="post-title t-heading-lg" id="postTitle">' . ssr_h($title) . '</h1>', $html);
    if ($photo) {
        $html = str_replace('<img class="post-hero-img" id="postImg" src="" alt="" style="display:none;">',
            '<img class="post-hero-img" id="postImg" src="' . ssr_h($photo) . '" alt="' . ssr_h($title) . '" style="display:block;">', $html);
    }
    // Content is admin-authored (posts table is auth/RLS write-protected) — same trust
    // boundary the client uses (innerHTML = content). Inject HTML raw, else escaped text.
    $isHtml = (bool) preg_match('/<[a-z][\s\S]*>/i', $content !== '' ? $content : $excerpt);
    $blockInner = $isHtml ? ($content !== '' ? $content : $excerpt) : ssr_h($content !== '' ? $content : $excerpt);
    $html = str_replace('<div class="post-content" id="postContent"></div>',
        '<div class="post-content" id="postContent">' . $blockInner . '</div>', $html);

    // Paint server content immediately.
    $html = str_replace('<div class="loading-screen" id="loadingScreen">',
        '<div class="loading-screen" id="loadingScreen" style="display:none;">', $html);
    $html = str_replace('id="postSection" style="display:none;"', 'id="postSection" style="display:block;"', $html);

    echo $html;
    exit;
} catch (\Throwable $e) {
    ssr_passthru($tpl);
}
