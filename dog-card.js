/**
 * Shared dog card component.
 * Usage:
 *   dogCardHTML(dog, { modal: true })                       → opens modal on click
 *   dogCardHTML(dog, { modal: true, index: 3 })             → with animation delay
 *   dogCardHTML(dog, { modal: true, gallery: true })        → hover arrows cycle the dog's media
 *   dogCardHTML(dog, { overlay: true, featured: 'big'|'small', gallery: true })
 *                                                           → featured card: name/desc over the image
 *
 * `gallery` and `overlay`/`featured` are opt-in, so callers that don't pass them
 * (e.g. the homepage carousel) get the original markup for image media.
 * Media that is a video (.mp4/.webm/.mov) renders as an inline muted <video>;
 * gallery cards add play/pause + mute controls positioned clear of the arrows.
 */
function escapeHTML(str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function isDogVideo(url) {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url || '');
}

var DOG_NAV_SVG = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
var DOG_VID_SVG = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor"/></svg>',
  muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M15 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

// One media element (image or first-frame video) for a URL.
function dogMediaEl(url, name) {
  if (isDogVideo(url)) {
    return '<video class="dog-card-img dog-card-video" src="' + escapeHTML(url) + '#t=0.1" muted playsinline preload="metadata"></video>';
  }
  var altSuffix = (typeof h4dT === 'function') ? h4dT('dogcard.alt') : 'adoptiehond uit Bosnië & Servië';
  return '<img src="' + escapeHTML(url) + '" alt="' + escapeHTML(name) + ' — ' + escapeHTML(altSuffix) + '" class="dog-card-img" width="400" height="300" loading="lazy" decoding="async" draggable="false">';
}

function dogCardHTML(dog, opts) {
  opts = opts || {};
  // Language-aware helpers (components.js loads first; guard just in case).
  var T = (typeof h4dT === 'function') ? h4dT : function (k) { return k; };
  var F = (typeof h4dField === 'function') ? h4dField : function (r, f) { return r[f]; };
  var img = dog.photo || (dog.photos && dog.photos.length > 0 ? dog.photos[0].photo_url : null) || 'images/placeholder-dog.svg';
  var breed = F(dog, 'ras') || '';
  var leeftijd = F(dog, 'leeftijd') || '';
  var sizeStr = dog.grootte === 'klein' ? T('dogcard.size.klein') : dog.grootte === 'middel' ? T('dogcard.size.middel') : dog.grootte === 'groot' ? T('dogcard.size.groot') : '';
  var beschr = F(dog, 'beschrijving');
  var desc = (beschr && !beschr.startsWith('http'))
    ? beschr
    : [breed, leeftijd, sizeStr].filter(Boolean).join(', ');

  // Badge ribbon
  var dogTags = dog.tags || [];
  var tagType = dogTags.includes('puppy') ? 'puppy' : dogTags.includes('senior') ? 'senior' : dogTags.includes('langzitter') ? 'langzitter' : '';
  var tagLabel = tagType === 'puppy' ? T('dogcard.tag.puppy') : tagType === 'senior' ? T('dogcard.tag.senior') : tagType === 'langzitter' ? T('dogcard.tag.langzitter') : '';
  // A reserved dog (beheer "Gereserveerd" = status 'in_gesprek') gets a reserved ribbon,
  // which takes precedence over the age/size tag.
  var isReserved = dog.status === 'in_gesprek' || dog.status === 'gereserveerd';
  var badgeType = isReserved ? 'gereserveerd' : tagType;
  var badgeLabel = isReserved ? T('dogcard.tag.gereserveerd') : tagLabel;
  var badge = '';
  if (badgeType) {
    badge = '<div class="dog-card-badge ' + badgeType + '"><span class="dog-card-badge-label">' + badgeLabel + '</span><span class="dog-card-badge-tail"></span></div>';
  }

  var safeName = escapeHTML(dog.naam);
  var safeDesc = escapeHTML(desc);
  var safeStatus = escapeHTML(dog.status);
  var safeId = escapeHTML(dog.id);
  var mediaEl = dogMediaEl(img, dog.naam);

  // On-card gallery (opt-in): wrap media so hover arrows can cycle photos/videos.
  // Without `gallery` the markup is the bare media element (homepage unaffected).
  var media = mediaEl;
  if (opts.gallery) {
    media =
      '<div class="dog-card-media' + (isDogVideo(img) ? ' is-video' : '') + '" data-dog-id="' + safeId + '">' +
        mediaEl +
        // These live INSIDE the card's <a>. They MUST NOT be <button> (or any interactive
        // element): a <button> nested in an <a> is invalid HTML, and Safari mishandles it —
        // the whole card highlights on tap but refuses to navigate. <span> is valid inside
        // <a>; the capture-phase click handler below still drives them by class name.
        '<span role="button" class="dog-card-nav prev" aria-label="' + escapeHTML(T('dogcard.aria.prev')) + '">' + DOG_NAV_SVG.prev + '</span>' +
        '<span role="button" class="dog-card-nav next" aria-label="' + escapeHTML(T('dogcard.aria.next')) + '">' + DOG_NAV_SVG.next + '</span>' +
        '<span role="button" class="dog-card-vplay" aria-label="' + escapeHTML(T('dogcard.aria.playpause')) + '">' + DOG_VID_SVG.play + '</span>' +
        '<span role="button" class="dog-card-vmute" aria-label="' + escapeHTML(T('dogcard.aria.mute')) + '">' + DOG_VID_SVG.muted + '</span>' +
      '</div>';
  }

  var inner;
  if (opts.overlay) {
    inner =
      '<div class="dog-card-inner">' +
        media +
        '<div class="dotd-overlay">' +
          '<div class="dog-card-name">' + safeName + '</div>' +
          '<div class="dog-card-desc">' + safeDesc + '</div>' +
        '</div>' +
      '</div>' +
      badge;
  } else {
    inner =
      '<div class="dog-card-inner">' +
        media +
        '<div class="dog-card-body">' +
          '<div class="dog-card-name">' + safeName + '</div>' +
          '<div class="dog-card-desc">' + safeDesc + '</div>' +
        '</div>' +
      '</div>' +
      badge;
  }

  var cls = 'dog-card';
  if (opts.overlay) cls += ' dotd-card';
  if (opts.featured === 'big') cls += ' big';
  else if (opts.featured === 'small') cls += ' small';

  // Plain link to the dog's full page — no modal/sheet, so a tap always works on mobile
  // (it navigates like any other link, with no dependence on JS having loaded yet). The
  // full page shows the same content the quick-view used to (and more).
  var cardStyle = 'display:block;text-decoration:none;color:inherit;' + (opts.index != null ? 'animation-delay:' + (opts.index * 0.05) + 's;' : '');
  var cardHref = (typeof h4dDetailUrl === 'function') ? h4dDetailUrl('hond', 'hond.html', dog) : ('hond.html?id=' + dog.id);
  return '<a href="' + cardHref + '" class="' + cls + '" data-status="' + safeStatus + '" data-dog-id="' + safeId + '" style="' + cardStyle + '">' + inner + '</a>';
}

/* ---- On-card gallery + inline video behavior (delegated; acts only on `.dog-card-media`) ----
 * Lazy-loads a dog's media on first hover (cached), reveals arrows if >1 item, cycles the media on
 * arrow click, and gives videos play/pause + mute controls — all without opening the modal. Guarded
 * so it's inert where supabaseGet is absent. */
(function () {
  if (window.__dogGalleryInit) return;
  window.__dogGalleryInit = true;
  window.__dogGallery = window.__dogGallery || {};

  function loadMedia(id) {
    if (window.__dogGallery[id]) return Promise.resolve(window.__dogGallery[id]);
    if (typeof window.supabaseGet !== 'function') return Promise.resolve(null);
    return window.supabaseGet(
      'dog_photos',
      'select=photo_url&dog_id=eq.' + id + '&order=sort_order.asc.nullslast,is_primary.desc,created_at.asc'
    ).then(function (rows) {
      var urls = (rows || []).map(function (r) { return r.photo_url; }).filter(Boolean);
      window.__dogGallery[id] = urls;
      return urls;
    }).catch(function () { return null; });
  }

  document.addEventListener('pointerover', function (e) {
    var media = e.target.closest && e.target.closest('.dog-card-media[data-dog-id]');
    if (!media || media.__galleryReady) return;
    media.__galleryReady = true;
    loadMedia(media.getAttribute('data-dog-id')).then(function (urls) {
      if (urls && urls.length > 1) media.classList.add('has-gallery');
    });
  });

  function setVplay(media, playing) {
    var b = media.querySelector('.dog-card-vplay');
    if (b) b.innerHTML = playing ? DOG_VID_SVG.pause : DOG_VID_SVG.play;
    media.classList.toggle('is-playing', !!playing);
  }
  function setVmute(media, muted) {
    var b = media.querySelector('.dog-card-vmute');
    if (b) b.innerHTML = muted ? DOG_VID_SVG.muted : DOG_VID_SVG.sound;
  }

  // Swap the current media element to `url` (image or video), keeping a definite size.
  function setMedia(media, url, name) {
    var old = media.querySelector('.dog-card-img');
    var el;
    if (isDogVideo(url)) {
      el = document.createElement('video');
      el.className = 'dog-card-img dog-card-video';
      el.src = url + '#t=0.1';
      el.muted = true; el.playsInline = true; el.preload = 'metadata';
      media.classList.add('is-video');
      setVplay(media, false);
      setVmute(media, true);
    } else {
      el = document.createElement('img');
      el.className = 'dog-card-img';
      el.src = url; el.loading = 'lazy'; el.decoding = 'async'; el.draggable = false;
      el.alt = name || '';
      media.classList.remove('is-video', 'is-playing');
    }
    if (old) old.replaceWith(el); else media.insertBefore(el, media.firstChild);
  }

  function step(media, dir) {
    var urls = window.__dogGallery[media.getAttribute('data-dog-id')];
    if (!urls || urls.length < 2) return;
    var idx = (media.__idx || 0) + dir;
    if (idx < 0) idx = urls.length - 1;
    if (idx >= urls.length) idx = 0;
    media.__idx = idx;
    setMedia(media, urls[idx]);
    var nx = urls[(idx + 1) % urls.length];
    if (!isDogVideo(nx)) { var pre = new Image(); pre.src = nx; } // preload next image
  }

  // Capture phase: intercept control clicks before the card's inline onclick (modal).
  document.addEventListener('click', function (e) {
    var t = e.target;
    var nav = t.closest && t.closest('.dog-card-nav');
    if (nav) {
      e.stopPropagation(); e.preventDefault();
      var m = nav.closest('.dog-card-media');
      if (m) step(m, nav.classList.contains('prev') ? -1 : 1);
      return;
    }
    var play = t.closest && t.closest('.dog-card-vplay');
    if (play) {
      e.stopPropagation(); e.preventDefault();
      var mp = play.closest('.dog-card-media');
      var v = mp && mp.querySelector('video.dog-card-img');
      if (v) {
        if (v.paused) { v.play().catch(function () {}); setVplay(mp, true); }
        else { v.pause(); setVplay(mp, false); }
      }
      return;
    }
    var mute = t.closest && t.closest('.dog-card-vmute');
    if (mute) {
      e.stopPropagation(); e.preventDefault();
      var mm = mute.closest('.dog-card-media');
      var vm = mm && mm.querySelector('video.dog-card-img');
      if (vm) { vm.muted = !vm.muted; setVmute(mm, vm.muted); }
      return;
    }
  }, true);
})();

/* ---- iOS tap-to-navigate rescue (delegated; survives grid re-renders) ----
 * On iOS, a dog card can sit inside an overflow/scroll container that captures touch events
 * for scroll detection and SUPPRESSES the link's synthetic click — you see touchstart +
 * touchend fire but no click, so the <a> never navigates (the card just highlights). This is
 * the same iOS quirk already worked around for the nav bar in components.js. Fix: on a short,
 * stationary tap anywhere on a card, navigate to its href ourselves. A real drag/scroll
 * (moved > 12px) or a long press is ignored, and taps on the gallery controls are left alone. */
(function () {
  if (window.__dogTapNavInit) return;
  window.__dogTapNavInit = true;
  var sx = 0, sy = 0, st = 0, card = null;
  document.addEventListener('touchstart', function (e) {
    card = null;
    var t0 = e.target;
    if (!t0 || !t0.closest) return;
    if (t0.closest('.dog-card-nav, .dog-card-vplay, .dog-card-vmute')) return; // gallery controls
    var c = t0.closest('a.dog-card[href]');
    if (!c) return;
    card = c;
    var t = e.touches[0];
    sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!card) return;
    var c = card; card = null;
    var t = e.changedTouches[0];
    if (!t) return;
    if (Date.now() - st < 500 && Math.abs(t.clientX - sx) < 12 && Math.abs(t.clientY - sy) < 12) {
      e.preventDefault();
      window.location.href = c.getAttribute('href');
    }
  }, { passive: false });
})();
