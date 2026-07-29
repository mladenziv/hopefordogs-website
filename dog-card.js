/**
 * Shared dog card component.
 * Usage:
 *   dogCardHTML(dog, { modal: true })                       → opens modal on click
 *   dogCardHTML(dog, { modal: true, index: 3 })             → with animation delay
 *   dogCardHTML(dog, { modal: true, gallery: true })        → hover arrows cycle the dog's photos
 *   dogCardHTML(dog, { overlay: true, featured: 'big'|'small', gallery: true })
 *                                                           → featured card: name/desc over the image
 *
 * `gallery` and `overlay`/`featured` are opt-in, so callers that don't pass them
 * (e.g. the homepage carousel) get exactly the original markup.
 */
function escapeHTML(str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

var DOG_NAV_SVG = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function dogCardHTML(dog, opts) {
  opts = opts || {};
  var img = dog.photo || (dog.photos && dog.photos.length > 0 ? dog.photos[0].photo_url : null) || 'images/placeholder-dog.svg';
  var breed = dog.ras || '';
  var sizeStr = dog.grootte === 'klein' ? 'Klein' : dog.grootte === 'middel' ? 'Middel' : dog.grootte === 'groot' ? 'Groot' : '';
  var desc = (dog.beschrijving && !dog.beschrijving.startsWith('http'))
    ? dog.beschrijving
    : [breed, dog.leeftijd, sizeStr].filter(Boolean).join(', ');

  // Badge ribbon
  var dogTags = dog.tags || [];
  var tagType = dogTags.includes('puppy') ? 'puppy' : dogTags.includes('senior') ? 'senior' : dogTags.includes('langzitter') ? 'langzitter' : '';
  var tagLabel = tagType === 'puppy' ? 'Puppy' : tagType === 'senior' ? 'Senior' : tagType === 'langzitter' ? 'Langzitter' : '';
  var badge = '';
  if (tagType) {
    badge = '<div class="dog-card-badge ' + tagType + '"><span class="dog-card-badge-label">' + tagLabel + '</span><span class="dog-card-badge-tail"></span></div>';
  }

  var safeName = escapeHTML(dog.naam);
  var safeDesc = escapeHTML(desc);
  var safeStatus = escapeHTML(dog.status);
  var safeImg = escapeHTML(img);
  var safeId = escapeHTML(dog.id);

  var imgTag = '<img src="' + safeImg + '" alt="' + safeName + '" class="dog-card-img" loading="lazy" decoding="async" draggable="false">';

  // On-card photo gallery (opt-in): wrap the image so hover arrows can cycle photos.
  // Without `gallery`, the markup is identical to the original (homepage unaffected).
  var media = imgTag;
  if (opts.gallery) {
    media =
      '<div class="dog-card-media" data-dog-id="' + safeId + '">' +
        imgTag +
        '<button type="button" class="dog-card-nav prev" aria-label="Vorige foto">' + DOG_NAV_SVG.prev + '</button>' +
        '<button type="button" class="dog-card-nav next" aria-label="Volgende foto">' + DOG_NAV_SVG.next + '</button>' +
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

  var animDelay = opts.index != null ? ' style="animation-delay: ' + (opts.index * 0.05) + 's;"' : '';
  return '<div class="' + cls + '" data-status="' + safeStatus + '" data-dog-id="' + safeId + '"' + animDelay + ' onclick="openDogModal(\'' + dog.id + '\')">' + inner + '</div>';
}

/* ---- On-card photo gallery behavior (delegated; only where `.dog-card-media` exists) ----
 * Lazy-loads a dog's photos on first hover (cached), reveals arrows if >1 photo, and cycles the
 * image on arrow click without opening the modal. Guarded so it's inert where supabaseGet is
 * absent (e.g. pages that render cards without `gallery`). */
(function () {
  if (window.__dogGalleryInit) return;
  window.__dogGalleryInit = true;
  window.__dogGallery = window.__dogGallery || {};

  function loadPhotos(id) {
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

  // Lazy-load on first hover; reveal arrows only when there's more than one photo.
  document.addEventListener('pointerover', function (e) {
    var media = e.target.closest && e.target.closest('.dog-card-media[data-dog-id]');
    if (!media || media.__galleryReady) return;
    media.__galleryReady = true;
    loadPhotos(media.getAttribute('data-dog-id')).then(function (urls) {
      if (urls && urls.length > 1) media.classList.add('has-gallery');
    });
  });

  function step(media, dir) {
    var urls = window.__dogGallery[media.getAttribute('data-dog-id')];
    if (!urls || urls.length < 2) return;
    var idx = (media.__idx || 0) + dir;
    if (idx < 0) idx = urls.length - 1;
    if (idx >= urls.length) idx = 0;
    media.__idx = idx;
    var img = media.querySelector('.dog-card-img');
    if (img) img.src = urls[idx];
    var pre = new Image(); pre.src = urls[(idx + 1) % urls.length]; // preload neighbour
  }

  // Capture phase: stop the click before it reaches the card's inline onclick (modal).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.dog-card-nav');
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();
    var media = btn.closest('.dog-card-media');
    if (media) step(media, btn.classList.contains('prev') ? -1 : 1);
  }, true);
})();
