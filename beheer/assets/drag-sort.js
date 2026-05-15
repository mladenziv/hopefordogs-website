// Drag-to-reorder for photo thumbnails and dog cards in beheer
// Uses pointer events for mouse + touch support
(function() {
  const SB = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';
  const hdrs = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

  async function patch(table, id, data) {
    const r = await fetch(SB + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'PATCH', headers: { ...hdrs, 'Prefer': 'return=minimal' }, body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('PATCH ' + r.status);
  }
  async function get(table, q) {
    const r = await fetch(SB + '/rest/v1/' + table + '?' + q, { headers: hdrs });
    return r.json();
  }

  function flash(el, ok) {
    el.style.outline = '2px solid ' + (ok ? '#22c55e' : '#ef4444');
    setTimeout(function() { el.style.outline = ''; }, 800);
  }

  // ── Styles ──
  var s = document.createElement('style');
  s.textContent =
    '.ds-handle{position:absolute;z-index:20;background:rgba(0,0,0,.55);color:#fff;' +
    'display:flex;align-items:center;justify-content:center;cursor:grab;' +
    'opacity:0;transition:opacity .15s;user-select:none;-webkit-user-select:none;border-radius:6px}' +
    '.ds-h-photo{top:2px;right:2px;width:20px;height:20px;font-size:10px}' +
    '.ds-h-dog{top:8px;left:8px;width:28px;height:28px;font-size:14px;backdrop-filter:blur(4px)}' +
    '*:hover>.ds-handle{opacity:1}' +
    '.ds-placeholder{border:2px dashed #ccc;border-radius:12px;box-sizing:border-box}' +
    '.ds-clone{position:fixed;z-index:9999;pointer-events:none;opacity:.85;box-shadow:0 8px 32px rgba(0,0,0,.18)}';
  document.head.appendChild(s);

  // ── Drag engine ──
  // Key principle: NEVER move the original element out of the DOM.
  // Instead, create a visual clone that follows the pointer.
  function enableDrag(container, sel, handleCls, onSave) {
    if (container._ds) return;
    container._ds = true;

    function getItems() {
      return Array.from(container.querySelectorAll(sel)).filter(function(e) {
        return !e.classList.contains('ds-placeholder');
      });
    }

    function setup(el) {
      if (el._dsOk || el.classList.contains('ds-placeholder')) return;
      el._dsOk = true;
      el.style.position = 'relative';

      var handle = document.createElement('div');
      handle.className = 'ds-handle ' + handleCls;
      handle.textContent = '\u2807'; // ⠇ vertical dots
      el.appendChild(handle);

      handle.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        beginDrag(el, e.clientX, e.clientY);
      });
    }

    var dragging = null, clone = null, placeholder = null, offX = 0, offY = 0;

    function beginDrag(el, cx, cy) {
      if (dragging) return;
      dragging = el;

      var rect = el.getBoundingClientRect();
      offX = cx - rect.left;
      offY = cy - rect.top;

      // Create visual clone (follows pointer)
      clone = el.cloneNode(true);
      clone.className += ' ds-clone';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      clone.style.left = rect.left + 'px';
      clone.style.top = rect.top + 'px';
      document.body.appendChild(clone);

      // Hide original in place (keep in DOM for React)
      el.style.opacity = '0.2';

      // Create placeholder
      placeholder = document.createElement('div');
      placeholder.className = 'ds-placeholder';
      placeholder.style.width = rect.width + 'px';
      placeholder.style.height = rect.height + 'px';

      // Listen on document for move/up (not on handle)
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    }

    function onMove(e) {
      if (!dragging || !clone) return;
      clone.style.left = (e.clientX - offX) + 'px';
      clone.style.top = (e.clientY - offY) + 'px';

      // Find which item we're over
      var all = getItems();
      var isHoriz = getComputedStyle(container).display === 'flex';

      for (var i = 0; i < all.length; i++) {
        var it = all[i];
        if (it === dragging) continue;
        var r = it.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          var mid = isHoriz ? (r.left + r.width / 2) : (r.top + r.height / 2);
          var before = isHoriz ? (e.clientX < mid) : (e.clientY < mid);

          // Remove placeholder from old position
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);

          if (before) {
            it.parentNode.insertBefore(placeholder, it);
          } else if (it.nextSibling) {
            it.parentNode.insertBefore(placeholder, it.nextSibling);
          } else {
            it.parentNode.appendChild(placeholder);
          }
          break;
        }
      }
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);

      if (!dragging) return;

      // Move original element to placeholder position
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(dragging, placeholder);
        placeholder.parentNode.removeChild(placeholder);
      }

      // Restore original
      dragging.style.opacity = '';

      // Remove clone
      if (clone && clone.parentNode) clone.parentNode.removeChild(clone);

      var saved = dragging;
      dragging = null;
      clone = null;
      placeholder = null;

      onSave(container);
    }

    getItems().forEach(setup);
    new MutationObserver(function() { getItems().forEach(setup); }).observe(container, { childList: true });
  }

  // ── Photo sorting ──
  function getDogId() {
    var m = location.pathname.match(/\/dog\/([^/]+)/);
    return m ? m[1] : null;
  }

  function photoKey(url) {
    var m = url.match(/\/dog-photos\/(.+?)(?:\?|$)/);
    return m ? m[1] : url.split('/').pop().split('?')[0];
  }

  var _pc = null, _pcDog = null;

  async function savePhotos(container) {
    var dogId = getDogId();
    if (!dogId) return;
    try {
      if (_pcDog !== dogId || !_pc) {
        var rows = await get('dog_photos', 'select=id,photo_url&dog_id=eq.' + dogId);
        _pc = {};
        rows.forEach(function(r) { _pc[photoKey(r.photo_url)] = r.id; });
        _pcDog = dogId;
      }
      var thumbs = Array.from(container.querySelectorAll('.shrink-0')).filter(function(e) {
        return !e.classList.contains('ds-placeholder');
      });
      var updates = [];
      for (var i = 0; i < thumbs.length; i++) {
        var img = thumbs[i].querySelector('img') || thumbs[i].querySelector('video');
        if (!img) continue;
        var id = _pc[photoKey(img.src)];
        if (id) updates.push({ id: id, sort_order: i });
      }
      if (!updates.length) { flash(container, false); return; }
      await Promise.all(updates.map(function(u) { return patch('dog_photos', u.id, { sort_order: u.sort_order }); }));
      _pc = null; _pcDog = null;
      flash(container, true);
    } catch (e) { console.error('Photo sort:', e); flash(container, false); }
  }

  // ── Dog sorting ──
  var _dogs = null;

  async function saveDogs(grid) {
    try {
      if (!_dogs) {
        var rows = await get('dogs', 'select=id,naam');
        _dogs = rows; // keep full array for duplicate name handling
      }
      var cards = Array.from(grid.querySelectorAll(':scope > div')).filter(function(e) {
        return !e.classList.contains('ds-placeholder');
      });
      // Build ordered list of names from DOM
      var updates = [];
      var usedIds = {};
      for (var i = 0; i < cards.length; i++) {
        var h3 = cards[i].querySelector('h3');
        if (!h3) continue;
        var span = h3.querySelector('span');
        var name = (span ? span.textContent : h3.textContent).trim();
        // Find matching dog (handle duplicates by skipping already-used IDs)
        var match = null;
        for (var j = 0; j < _dogs.length; j++) {
          if (_dogs[j].naam.trim() === name && !usedIds[_dogs[j].id]) {
            match = _dogs[j];
            break;
          }
        }
        if (match) {
          usedIds[match.id] = true;
          updates.push({ id: match.id, sort_order: i + 1 });
        }
      }
      if (!updates.length) { flash(grid, false); return; }
      await Promise.all(updates.map(function(u) { return patch('dogs', u.id, { sort_order: u.sort_order }); }));
      _dogs = null;
      flash(grid, true);
    } catch (e) { console.error('Dog sort:', e); flash(grid, false); }
  }

  // ── Scanner ──
  var lastPath = '';
  function scan() {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      _pc = null; _pcDog = null;
      // Clear init flags on all containers (page changed)
      document.querySelectorAll('[data-ds]').forEach(function(el) { el._ds = false; });
    }

    // Photo grids on dog edit page
    if (getDogId()) {
      document.querySelectorAll('.flex.gap-2.overflow-x-auto.pb-2').forEach(function(el) {
        if (el.querySelector('.shrink-0') && !el._ds) {
          enableDrag(el, '.shrink-0', 'ds-h-photo', savePhotos);
        }
      });
    }

    // Dog card grids on main page
    document.querySelectorAll('.grid.gap-4').forEach(function(el) {
      if (el._ds) return;
      var cls = el.className;
      if (!(cls.indexOf('grid-cols-3') >= 0 || cls.indexOf('grid-cols-4') >= 0)) return;
      if (el.children.length < 2) return;
      if (!el.children[0] || !el.children[0].querySelector('h3')) return;
      enableDrag(el, ':scope > div', 'ds-h-dog', saveDogs);
    });
  }

  new MutationObserver(function() { setTimeout(scan, 200); }).observe(document.body, { childList: true, subtree: true });
  setInterval(scan, 2000);
})();
