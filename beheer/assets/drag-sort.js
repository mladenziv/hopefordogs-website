// Drag-to-reorder for photo thumbnails and dog cards in beheer
// Uses native HTML5 drag and drop + MutationObserver to hook into React-rendered DOM
(function() {
  const SUPABASE_URL = 'https://gdmntnrsgfntcgqmbmtj.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbW50bnJzZ2ZudGNncW1ibXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzU4NzgsImV4cCI6MjA4Njg1MTg3OH0.dy2JosgoqcI74tDzY3TvVt2lo2Jt3vdYBrLrcb8ACjg';

  async function supabaseUpdate(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  }

  async function supabaseGet(table, params) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  }

  function flash(el, color) {
    el.style.outline = `2px solid ${color}`;
    el.style.outlineOffset = '-2px';
    setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 800);
  }

  // === SHARED DRAG HELPERS ===
  function makeDraggable(container, itemSelector, onSave, handleClass) {
    let dragEl = null;

    function setup(item) {
      if (item._dragReady) return;
      item._dragReady = true;
      item.style.position = 'relative';

      const handle = document.createElement('div');
      handle.className = handleClass;
      handle.innerHTML = '⠿';
      handle.addEventListener('mousedown', () => { item.draggable = true; });
      item.appendChild(handle);

      item.addEventListener('dragstart', (e) => {
        dragEl = item;
        item.classList.add('drag-sorting-active');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        // Delay opacity so drag image isn't faded
        requestAnimationFrame(() => { item.style.opacity = '0.4'; });
      });

      item.addEventListener('dragend', () => {
        item.style.opacity = '';
        item.classList.remove('drag-sorting-active');
        container.querySelectorAll('.drag-sort-over').forEach(el => el.classList.remove('drag-sort-over'));
        if (dragEl) onSave(container);
        dragEl = null;
        item.draggable = false;
      });

      item.addEventListener('dragover', (e) => {
        if (!dragEl || dragEl === item) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        container.querySelectorAll('.drag-sort-over').forEach(el => el.classList.remove('drag-sort-over'));
        item.classList.add('drag-sort-over');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-sort-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-sort-over');
        if (!dragEl || dragEl === item) return;
        const items = [...container.querySelectorAll(itemSelector)];
        const fromIdx = items.indexOf(dragEl);
        const toIdx = items.indexOf(item);
        if (fromIdx < 0 || toIdx < 0) return;
        if (fromIdx < toIdx) {
          item.after(dragEl);
        } else {
          item.before(dragEl);
        }
      });
    }

    container.querySelectorAll(itemSelector).forEach(setup);
    const obs = new MutationObserver(() => {
      container.querySelectorAll(itemSelector).forEach(setup);
    });
    obs.observe(container, { childList: true });
  }

  // === STYLES ===
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .drag-sort-over { outline: 2px solid hsl(25, 95%, 53%) !important; outline-offset: -2px; }
    .drag-handle-photo {
      position: absolute; top: 2px; right: 2px; z-index: 20;
      width: 20px; height: 20px; border-radius: 4px;
      background: rgba(0,0,0,0.55); color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: grab; font-size: 10px; line-height: 1;
      opacity: 0; transition: opacity 0.15s; pointer-events: auto;
    }
    .shrink-0:hover .drag-handle-photo,
    .drag-sorting-active .drag-handle-photo { opacity: 1; }
    .drag-handle-dog {
      position: absolute; top: 8px; left: 8px; z-index: 20;
      width: 28px; height: 28px; border-radius: 8px;
      background: rgba(0,0,0,0.6); color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: grab; font-size: 14px; line-height: 1;
      opacity: 0; transition: opacity 0.15s;
      backdrop-filter: blur(4px); pointer-events: auto;
    }
    div:hover > .drag-handle-dog { opacity: 1; }
  `;
  document.head.appendChild(styleEl);

  // === PHOTO SORTING ===
  // Get dog_id from the current URL (/dog/:id/edit)
  function getDogIdFromUrl() {
    const m = location.pathname.match(/\/dog\/([^/]+)/);
    return m ? m[1] : null;
  }

  // Photo cache: filename -> photo record
  let photoCache = null;
  let photoCacheDogId = null;

  function extractPhotoPath(url) {
    // Extract the path after /dog-photos/ (works across different Supabase domains)
    const m = url.match(/\/dog-photos\/(.+?)(?:\?|$)/);
    return m ? m[1] : url.split('/').pop().split('?')[0];
  }

  async function loadPhotoCache(dogId) {
    if (photoCacheDogId === dogId && photoCache) return photoCache;
    const photos = await supabaseGet('dog_photos', `select=id,photo_url,sort_order&dog_id=eq.${dogId}`);
    photoCache = {};
    photos.forEach(p => {
      const key = extractPhotoPath(p.photo_url);
      photoCache[key] = p;
    });
    photoCacheDogId = dogId;
    return photoCache;
  }

  function getPhotoPathFromThumb(thumb) {
    const img = thumb.querySelector('img');
    if (img) return extractPhotoPath(img.src);
    const vid = thumb.querySelector('video');
    if (vid) return extractPhotoPath(vid.src);
    return null;
  }

  async function savePhotoOrder(container) {
    const dogId = getDogIdFromUrl();
    if (!dogId) return;

    try {
      const cache = await loadPhotoCache(dogId);
      const thumbs = [...container.querySelectorAll('.shrink-0')];
      const updates = [];

      for (let i = 0; i < thumbs.length; i++) {
        const path = getPhotoPathFromThumb(thumbs[i]);
        if (!path) continue;
        const photo = cache[path];
        if (photo) {
          updates.push({ id: photo.id, sort_order: i });
        }
      }

      if (updates.length === 0) {
        console.warn('drag-sort: no photo IDs matched');
        return;
      }

      await Promise.all(updates.map(u => supabaseUpdate('dog_photos', u.id, { sort_order: u.sort_order })));
      // Invalidate cache
      photoCache = null;
      flash(container, '#22c55e');
    } catch (err) {
      console.error('Failed to save photo order:', err);
      flash(container, '#ef4444');
    }
  }

  // === DOG CARD SORTING ===
  function getDogIdFromCard(card) {
    // Dog cards have a link or click handler to /dog/{id}/edit or /dog/{id}
    // Look for the dog name link, or extract from any anchor
    const link = card.querySelector('a[href*="/dog/"]');
    if (link) {
      const m = link.href.match(/\/dog\/([^/]+)/);
      if (m) return m[1];
    }
    // Try finding the ID from an onclick or data attribute
    // React cards often navigate on click - try finding h3 text and matching
    // Better: use React fiber to get the key
    const key = getReactKey(card);
    if (key) return key;
    return null;
  }

  function getReactKey(el) {
    const fiberKey = Object.keys(el).find(k =>
      k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );
    if (!fiberKey) return null;
    const fiber = el[fiberKey];
    // Walk up a few levels to find the key
    let node = fiber;
    for (let i = 0; i < 5; i++) {
      if (!node) break;
      if (node.key && node.key.length > 8) return node.key; // UUID-like keys
      node = node.return;
    }
    return null;
  }

  async function saveDogOrder(grid) {
    const cards = [...grid.querySelectorAll(':scope > div')];
    const updates = [];

    for (let i = 0; i < cards.length; i++) {
      const id = getDogIdFromCard(cards[i]);
      if (id) {
        updates.push({ id, sort_order: i + 1 });
      }
    }

    if (updates.length === 0) {
      console.warn('drag-sort: no dog IDs found');
      flash(grid, '#ef4444');
      return;
    }

    try {
      await Promise.all(updates.map(u => supabaseUpdate('dogs', u.id, { sort_order: u.sort_order })));
      flash(grid, '#22c55e');
    } catch (err) {
      console.error('Failed to save dog order:', err);
      flash(grid, '#ef4444');
    }
  }

  // === OBSERVER ===
  function scan() {
    // Photo thumbnail grids
    document.querySelectorAll('.flex.gap-2.overflow-x-auto.pb-2').forEach(el => {
      if (el._dragSortInit) return;
      if (el.querySelector('.shrink-0') && getDogIdFromUrl()) {
        el._dragSortInit = true;
        makeDraggable(el, '.shrink-0', savePhotoOrder, 'drag-handle-photo');
      }
    });

    // Dog card grids
    document.querySelectorAll('.grid.gap-4').forEach(el => {
      if (el._dragSortInit) return;
      const classes = el.className;
      if ((classes.includes('grid-cols-3') || classes.includes('grid-cols-4')) &&
          el.children.length > 1) {
        const firstChild = el.children[0];
        if (firstChild && firstChild.querySelector('h3')) {
          el._dragSortInit = true;
          makeDraggable(el, ':scope > div', saveDogOrder, 'drag-handle-dog');
        }
      }
    });
  }

  const bodyObs = new MutationObserver(() => { setTimeout(scan, 150); });
  bodyObs.observe(document.body, { childList: true, subtree: true });
  // Also scan on route changes (React Router)
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      // Reset init flags on route change
      document.querySelectorAll('[class*="_dragSortInit"]').forEach(el => { el._dragSortInit = false; });
      setTimeout(scan, 300);
    }
    scan();
  }, 1500);
})();
