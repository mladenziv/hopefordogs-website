// Drag-to-reorder for photo thumbnails and dog cards in beheer
// Uses pointer events for mouse + touch support
(function() {
  var SB = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

  function getAuthToken() {
    try {
      var raw = localStorage.getItem('sb-gdmntnrsgfntcgqmbmtj-auth-token');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.access_token) return parsed.access_token;
      }
    } catch(e) {}
    return ANON;
  }

  function makeHeaders(write) {
    var token = getAuthToken();
    var h = { 'apikey': ANON, 'Authorization': 'Bearer ' + token };
    if (write) { h['Content-Type'] = 'application/json'; h['Prefer'] = 'return=minimal'; }
    return h;
  }

  async function patch(table, id, data) {
    const r = await fetch(SB + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'PATCH', headers: makeHeaders(true), body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('PATCH ' + table + ' ' + r.status + ' ' + (await r.text()));
  }
  async function get(table, q) {
    const r = await fetch(SB + '/rest/v1/' + table + '?' + q, { headers: makeHeaders(false) });
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
    var lastX = 0, lastY = 0, scrollRAF = null, scrollVel = 0;

    // Reposition the placeholder based on the item currently under (x,y).
    function positionPlaceholder(x, y) {
      if (!dragging || !placeholder) return;
      var all = getItems();
      var isHoriz = getComputedStyle(container).display === 'flex';
      for (var i = 0; i < all.length; i++) {
        var it = all[i];
        if (it === dragging) continue;
        var r = it.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          var mid = isHoriz ? (r.left + r.width / 2) : (r.top + r.height / 2);
          var before = isHoriz ? (x < mid) : (y < mid);
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
          if (before) it.parentNode.insertBefore(placeholder, it);
          else if (it.nextSibling) it.parentNode.insertBefore(placeholder, it.nextSibling);
          else it.parentNode.appendChild(placeholder);
          break;
        }
      }
    }

    // While dragging near the top/bottom edge of the viewport, scroll the page.
    function autoScrollTick() {
      if (!dragging) { scrollRAF = null; return; }
      if (scrollVel !== 0) {
        window.scrollBy(0, scrollVel);
        positionPlaceholder(lastX, lastY);
      }
      scrollRAF = requestAnimationFrame(autoScrollTick);
    }

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
      lastX = e.clientX; lastY = e.clientY;
      clone.style.left = (e.clientX - offX) + 'px';
      clone.style.top = (e.clientY - offY) + 'px';

      positionPlaceholder(e.clientX, e.clientY);

      // Auto-scroll the page when the pointer nears the top/bottom edge.
      var vh = window.innerHeight, edge = 90, maxV = 22;
      if (e.clientY < edge) scrollVel = -Math.ceil(maxV * (edge - e.clientY) / edge);
      else if (e.clientY > vh - edge) scrollVel = Math.ceil(maxV * (e.clientY - (vh - edge)) / edge);
      else scrollVel = 0;
      if (scrollVel !== 0 && !scrollRAF) scrollRAF = requestAnimationFrame(autoScrollTick);
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);

      scrollVel = 0;
      if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = null; }

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
    // Hash routing: beheer uses /#/dog/:id/edit
    var path = location.hash.replace('#', '') || location.pathname;
    var m = path.match(/\/dog\/([a-f0-9-]{36})/);
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
  async function saveDogs(grid) {
    try {
      var cards = Array.from(grid.querySelectorAll(':scope > div')).filter(function(e) {
        return !e.classList.contains('ds-placeholder');
      });
      var updates = [];
      for (var i = 0; i < cards.length; i++) {
        // Use data-dog-id attribute (added to D0 component)
        var card = cards[i];
        var id = card.getAttribute('data-dog-id') || card.querySelector('[data-dog-id]')?.getAttribute('data-dog-id');
        if (id) {
          updates.push({ id: id, sort_order: i + 1 });
        }
      }
      if (!updates.length) { console.warn('[drag-sort] No data-dog-id found on cards'); flash(grid, false); return; }
      await Promise.all(updates.map(function(u) { return patch('dogs', u.id, { sort_order: u.sort_order }); }));
      flash(grid, true);
    } catch (e) { console.error('Dog sort:', e); flash(grid, false); }
  }

  // ── Scanner ──
  var lastPath = '';
  function scan() {
    var curPath = location.hash || location.pathname;
    if (curPath !== lastPath) {
      lastPath = curPath;
      _pc = null; _pcDog = null; _dogs = null;
    }

    // Photo grids on dog edit page
    var dogId = getDogId();
    if (dogId) {
      var photoContainers = document.querySelectorAll('.flex.gap-2');
      photoContainers.forEach(function(el) {
        if (el.querySelector('.shrink-0') && !el._ds) {
          console.log('[drag-sort] Found photo grid, items:', el.querySelectorAll('.shrink-0').length);
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
