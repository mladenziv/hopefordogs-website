/**
 * Shared dog card component.
 * Usage:
 *   dogCardHTML(dog, { modal: true })            → opens modal on click
 *   dogCardHTML(dog, { modal: true, index: 3 })  → with animation delay
 */
function escapeHTML(str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function dogCardHTML(dog, opts) {
  opts = opts || {};
  var img = dog.photo || (dog.photos && dog.photos.length > 0 ? dog.photos[0].photo_url : null) || 'images/placeholder-dog.png';
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

  // Gender + age meta row
  var genderLabel = dog.geslacht === 'reu' ? 'Reu' : dog.geslacht === 'teef' ? 'Teef' : '';
  var ageLabel = dog.leeftijd || '';
  var metaParts = [genderLabel, ageLabel].filter(Boolean);
  var metaRow = metaParts.length > 0
    ? '<div class="dog-card-meta">' + metaParts.map(function(p) { return '<span>' + escapeHTML(p) + '</span>'; }).join('') + '</div>'
    : '';

  var inner =
    '<div class="dog-card-inner">' +
      '<img src="' + safeImg + '" alt="' + safeName + '" class="dog-card-img" loading="lazy" draggable="false">' +
      '<div class="dog-card-body">' +
        '<div class="dog-card-name">' + safeName + '</div>' +
        '<div class="dog-card-desc">' + safeDesc + '</div>' +
        metaRow +
      '</div>' +
    '</div>' +
    badge;

  var animDelay = opts.index != null ? ' style="animation-delay: ' + (opts.index * 0.05) + 's;"' : '';
  return '<div class="dog-card" data-status="' + safeStatus + '" data-dog-id="' + escapeHTML(dog.id) + '"' + animDelay + ' onclick="openDogModal(\'' + dog.id + '\')">' + inner + '</div>';
}
