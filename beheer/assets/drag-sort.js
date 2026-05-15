// Drag-to-reorder for photo thumbnails and dog cards in beheer
(function() {
  const SUPABASE_URL = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

  async function sbPatch(table, id, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(`PATCH ${table} ${id}: ${r.status}`);
  }

  async function sbGet(table, params) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    return r.json();
  }

  function flash(el, ok) {
    el.style.outline = `2px solid ${ok ? '#22c55e' : '#ef4444'}`;
    el.style.outlineOffset = '-2px';
    setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 800);
  }

  // ── Styles ──
  const css = document.createElement('style');
  css.textContent = `
    .ds-over { outline: 2px solid hsl(25,95%,53%) !important; outline-offset: -2px; }
    .ds-handle {
      position: absolute; z-index: 20;
      background: rgba(0,0,0,0.55); color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: grab; opacity: 0; transition: opacity .15s;
      user-select: none; -webkit-user-select: none;
    }
    .ds-handle-photo { top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 4px; font-size: 10px; }
    .ds-handle-dog { top: 8px; left: 8px; width: 28px; height: 28px; border-radius: 8px; font-size: 14px; backdrop-filter: blur(4px); }
    *:hover > .ds-handle { opacity: 1; }
  `;
  document.head.appendChild(css);

  // ── Generic drag engine (mouse + touch) ──
  function enableDrag(container, sel, handleCls, onDone) {
    if (container._ds) return;
    container._ds = true;
    let dragged = null, placeholder = null, startY = 0, startX = 0;

    function items() { return [...container.querySelectorAll(sel)].filter(e => !e._dsPlaceholder); }

    function setup(el) {
      if (el._dsReady) return;
      el._dsReady = true;
      el.style.position = 'relative';
      const h = document.createElement('div');
      h.className = `ds-handle ${handleCls}`;
      h.textContent = '⠿';
      el.appendChild(h);

      h.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        startDrag(el, e.clientX, e.clientY, e.pointerId, h);
      });
    }

    function startDrag(el, cx, cy, pid, handle) {
      dragged = el;
      startX = cx; startY = cy;
      handle.setPointerCapture(pid);

      const rect = el.getBoundingClientRect();
      // Create placeholder
      placeholder = document.createElement('div');
      placeholder._dsPlaceholder = true;
      placeholder.style.cssText = `width:${rect.width}px;height:${rect.height}px;border:2px dashed #ccc;border-radius:12px;box-sizing:border-box;`;
      el.parentNode.insertBefore(placeholder, el);

      // Float the dragged element
      el.style.position = 'fixed';
      el.style.zIndex = '9999';
      el.style.width = rect.width + 'px';
      el.style.left = rect.left + 'px';
      el.style.top = rect.top + 'px';
      el.style.opacity = '0.85';
      el.style.pointerEvents = 'none';
      el.style.transition = 'none';
      el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
      document.body.appendChild(el);

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);

      function onMove(ev) {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        el.style.left = (rect.left + dx) + 'px';
        el.style.top = (rect.top + dy) + 'px';

        // Find drop target
        const all = items();
        for (const it of all) {
          if (it === placeholder) continue;
          const r2 = it.getBoundingClientRect();
          const midX = r2.left + r2.width / 2, midY = r2.top + r2.height / 2;
          // Check if pointer is inside this item
          if (ev.clientX >= r2.left && ev.clientX <= r2.right && ev.clientY >= r2.top && ev.clientY <= r2.bottom) {
            // Determine before or after based on direction
            const isHorizontal = container.style.display === 'flex' || getComputedStyle(container).display === 'flex';
            const before = isHorizontal ? ev.clientX < midX : ev.clientY < midY;
            if (before) {
              it.parentNode.insertBefore(placeholder, it);
            } else {
              it.parentNode.insertBefore(placeholder, it.nextSibling);
            }
            break;
          }
        }
      }

      function onUp() {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);

        // Put element back in place
        el.style.position = ''; el.style.zIndex = ''; el.style.width = '';
        el.style.left = ''; el.style.top = ''; el.style.opacity = '';
        el.style.pointerEvents = ''; el.style.transition = ''; el.style.boxShadow = '';
        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.insertBefore(el, placeholder);
          placeholder.remove();
        }
        placeholder = null;
        dragged = null;
        onDone(container);
      }
    }

    items().forEach(setup);
    new MutationObserver(() => items().forEach(setup)).observe(container, { childList: true });
  }

  // ── Photo sorting ──
  function getDogIdFromUrl() {
    const m = location.pathname.match(/\/dog\/([^/]+)/);
    return m ? m[1] : null;
  }

  function photoPath(url) {
    const m = url.match(/\/dog-photos\/(.+?)(?:\?|$)/);
    return m ? m[1] : url.split('/').pop().split('?')[0];
  }

  let _photoCache = null, _photoCacheDog = null;

  async function savePhotoOrder(container) {
    const dogId = getDogIdFromUrl();
    if (!dogId) return;
    try {
      // Load photo records
      if (_photoCacheDog !== dogId) {
        const rows = await sbGet('dog_photos', `select=id,photo_url&dog_id=eq.${dogId}`);
        _photoCache = {};
        rows.forEach(r => { _photoCache[photoPath(r.photo_url)] = r.id; });
        _photoCacheDog = dogId;
      }

      const thumbs = [...container.querySelectorAll('.shrink-0')].filter(e => !e._dsPlaceholder);
      let updates = [];
      for (let i = 0; i < thumbs.length; i++) {
        const img = thumbs[i].querySelector('img') || thumbs[i].querySelector('video');
        if (!img) continue;
        const path = photoPath(img.src);
        const id = _photoCache[path];
        if (id) updates.push({ id, sort_order: i });
      }
      if (!updates.length) { flash(container, false); return; }
      await Promise.all(updates.map(u => sbPatch('dog_photos', u.id, { sort_order: u.sort_order })));
      _photoCache = null; _photoCacheDog = null; // invalidate
      flash(container, true);
    } catch (e) { console.error('Photo sort save failed:', e); flash(container, false); }
  }

  // ── Dog card sorting ──
  // Load all dogs once, match by name from h3
  let _dogsByName = null;

  async function loadDogMap() {
    if (_dogsByName) return _dogsByName;
    const dogs = await sbGet('dogs', 'select=id,naam');
    _dogsByName = {};
    dogs.forEach(d => { _dogsByName[d.naam.trim()] = d.id; });
    return _dogsByName;
  }

  function getDogNameFromCard(card) {
    const h3 = card.querySelector('h3');
    if (!h3) return null;
    // h3 may contain badges etc, get the first text span
    const span = h3.querySelector('span');
    return span ? span.textContent.trim() : h3.textContent.trim();
  }

  async function saveDogOrder(grid) {
    try {
      const map = await loadDogMap();
      const cards = [...grid.querySelectorAll(':scope > div')].filter(e => !e._dsPlaceholder);
      let updates = [];
      for (let i = 0; i < cards.length; i++) {
        const name = getDogNameFromCard(cards[i]);
        if (!name) continue;
        const id = map[name];
        if (id) updates.push({ id, sort_order: i + 1 });
      }
      if (!updates.length) { console.warn('No dog IDs matched'); flash(grid, false); return; }
      await Promise.all(updates.map(u => sbPatch('dogs', u.id, { sort_order: u.sort_order })));
      _dogsByName = null; // invalidate
      flash(grid, true);
    } catch (e) { console.error('Dog sort save failed:', e); flash(grid, false); }
  }

  // ── Observer: find grids and init drag ──
  let lastPath = '';

  function scan() {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      _photoCache = null; _photoCacheDog = null;
    }

    // Photo grids (on dog edit page)
    if (getDogIdFromUrl()) {
      document.querySelectorAll('.flex.gap-2.overflow-x-auto.pb-2').forEach(el => {
        if (el.querySelector('.shrink-0') && !el._ds) {
          enableDrag(el, '.shrink-0', 'ds-handle-photo', savePhotoOrder);
        }
      });
    }

    // Dog card grids
    document.querySelectorAll('.grid.gap-4').forEach(el => {
      if (el._ds) return;
      const cls = el.className;
      if (!(cls.includes('grid-cols-3') || cls.includes('grid-cols-4'))) return;
      if (el.children.length < 2) return;
      const first = el.children[0];
      if (!first || !first.querySelector('h3')) return;
      enableDrag(el, ':scope > div', 'ds-handle-dog', saveDogOrder);
    });
  }

  new MutationObserver(() => setTimeout(scan, 200)).observe(document.body, { childList: true, subtree: true });
  setInterval(scan, 2000);
})();
