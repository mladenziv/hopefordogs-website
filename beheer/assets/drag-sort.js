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

  // === PHOTO THUMBNAIL DRAG SORTING ===
  let photoDragState = null;

  function initPhotoSorting(container) {
    if (container._dragSortInit) return;
    container._dragSortInit = true;

    const style = document.createElement('style');
    style.textContent = `
      .photo-drag-over { outline: 2px solid hsl(25, 95%, 53%) !important; outline-offset: -2px; }
      .photo-dragging { opacity: 0.4 !important; }
      .drag-handle-photo {
        position: absolute; top: 2px; right: 2px; z-index: 20;
        width: 20px; height: 20px; border-radius: 4px;
        background: rgba(0,0,0,0.5); color: white;
        display: flex; align-items: center; justify-content: center;
        cursor: grab; font-size: 10px; line-height: 1;
        opacity: 0; transition: opacity 0.15s;
      }
      .shrink-0:hover .drag-handle-photo { opacity: 1; }
    `;
    if (!document.querySelector('#photo-drag-style')) {
      style.id = 'photo-drag-style';
      document.head.appendChild(style);
    }

    function setupThumbnail(thumb) {
      if (thumb._dragReady) return;
      thumb._dragReady = true;
      thumb.draggable = true;

      // Add drag handle icon
      const handle = document.createElement('div');
      handle.className = 'drag-handle-photo';
      handle.innerHTML = '⠿';
      handle.draggable = false;
      thumb.style.position = 'relative';
      thumb.appendChild(handle);

      thumb.addEventListener('dragstart', (e) => {
        photoDragState = thumb;
        thumb.classList.add('photo-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      });

      thumb.addEventListener('dragend', () => {
        thumb.classList.remove('photo-dragging');
        container.querySelectorAll('.photo-drag-over').forEach(el => el.classList.remove('photo-drag-over'));
        if (photoDragState) savePhotoOrder(container);
        photoDragState = null;
      });

      thumb.addEventListener('dragover', (e) => {
        if (!photoDragState || photoDragState === thumb) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        container.querySelectorAll('.photo-drag-over').forEach(el => el.classList.remove('photo-drag-over'));
        thumb.classList.add('photo-drag-over');
      });

      thumb.addEventListener('dragleave', () => {
        thumb.classList.remove('photo-drag-over');
      });

      thumb.addEventListener('drop', (e) => {
        e.preventDefault();
        thumb.classList.remove('photo-drag-over');
        if (!photoDragState || photoDragState === thumb) return;

        // Reorder in DOM
        const items = [...container.children].filter(c => c.classList.contains('shrink-0'));
        const fromIdx = items.indexOf(photoDragState);
        const toIdx = items.indexOf(thumb);
        if (fromIdx < 0 || toIdx < 0) return;

        if (fromIdx < toIdx) {
          thumb.after(photoDragState);
        } else {
          thumb.before(photoDragState);
        }
      });
    }

    // Setup existing thumbs
    container.querySelectorAll('.shrink-0').forEach(setupThumbnail);

    // Watch for new thumbs
    const obs = new MutationObserver(() => {
      container.querySelectorAll('.shrink-0').forEach(setupThumbnail);
    });
    obs.observe(container, { childList: true });
  }

  async function savePhotoOrder(container) {
    const thumbs = [...container.children].filter(c => c.classList.contains('shrink-0'));
    // Extract photo IDs from React fiber
    const updates = [];
    for (let i = 0; i < thumbs.length; i++) {
      const thumb = thumbs[i];
      // Get the React key which is the photo ID
      const key = getReactKey(thumb);
      if (key) {
        updates.push({ id: key, sort_order: i });
      }
    }
    if (updates.length === 0) return;

    try {
      await Promise.all(updates.map(u => supabaseUpdate('dog_photos', u.id, { sort_order: u.sort_order })));
      // Brief visual feedback
      container.style.outline = '2px solid #22c55e';
      setTimeout(() => { container.style.outline = ''; }, 600);
    } catch (err) {
      console.error('Failed to save photo order:', err);
      container.style.outline = '2px solid #ef4444';
      setTimeout(() => { container.style.outline = ''; }, 1000);
    }
  }

  // Extract React key from DOM element via fiber internals
  function getReactKey(el) {
    const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
    if (!fiberKey) return null;
    const fiber = el[fiberKey];
    return fiber?.key || fiber?.return?.key || null;
  }

  // === DOG CARD DRAG SORTING ===
  let dogDragState = null;
  let dogDragContainer = null;

  function initDogSorting(grid) {
    if (grid._dogDragInit) return;
    grid._dogDragInit = true;

    const style = document.createElement('style');
    style.textContent = `
      .dog-drag-over { box-shadow: 0 0 0 3px hsl(25, 95%, 53%) !important; border-radius: 12px; }
      .dog-dragging { opacity: 0.3 !important; }
      .drag-handle-dog {
        position: absolute; top: 8px; left: 8px; z-index: 20;
        width: 28px; height: 28px; border-radius: 8px;
        background: rgba(0,0,0,0.6); color: white;
        display: flex; align-items: center; justify-content: center;
        cursor: grab; font-size: 14px; line-height: 1;
        opacity: 0; transition: opacity 0.15s;
        backdrop-filter: blur(4px);
      }
      .dog-card-wrapper { position: relative; }
      .dog-card-wrapper:hover .drag-handle-dog { opacity: 1; }
    `;
    if (!document.querySelector('#dog-drag-style')) {
      style.id = 'dog-drag-style';
      document.head.appendChild(style);
    }

    function setupCard(card) {
      if (card._dogDragReady) return;
      card._dogDragReady = true;
      card.classList.add('dog-card-wrapper');
      card.draggable = true;

      const handle = document.createElement('div');
      handle.className = 'drag-handle-dog';
      handle.innerHTML = '⠿';
      handle.draggable = false;
      card.appendChild(handle);

      card.addEventListener('dragstart', (e) => {
        dogDragState = card;
        dogDragContainer = grid;
        card.classList.add('dog-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dog-dragging');
        grid.querySelectorAll('.dog-drag-over').forEach(el => el.classList.remove('dog-drag-over'));
        if (dogDragState) saveDogOrder(grid);
        dogDragState = null;
        dogDragContainer = null;
      });

      card.addEventListener('dragover', (e) => {
        if (!dogDragState || dogDragState === card) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        grid.querySelectorAll('.dog-drag-over').forEach(el => el.classList.remove('dog-drag-over'));
        card.classList.add('dog-drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('dog-drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('dog-drag-over');
        if (!dogDragState || dogDragState === card) return;

        const items = [...grid.children];
        const fromIdx = items.indexOf(dogDragState);
        const toIdx = items.indexOf(card);
        if (fromIdx < 0 || toIdx < 0) return;

        if (fromIdx < toIdx) {
          card.after(dogDragState);
        } else {
          card.before(dogDragState);
        }
      });
    }

    grid.querySelectorAll(':scope > div').forEach(setupCard);

    const obs = new MutationObserver(() => {
      grid.querySelectorAll(':scope > div').forEach(setupCard);
    });
    obs.observe(grid, { childList: true });
  }

  async function saveDogOrder(grid) {
    const cards = [...grid.children];
    const updates = [];
    for (let i = 0; i < cards.length; i++) {
      const key = getReactKey(cards[i]);
      if (key) {
        updates.push({ id: key, sort_order: i + 1 });
      }
    }
    if (updates.length === 0) return;

    try {
      await Promise.all(updates.map(u => supabaseUpdate('dogs', u.id, { sort_order: u.sort_order })));
      grid.style.outline = '2px solid #22c55e';
      grid.style.outlineOffset = '-2px';
      grid.style.borderRadius = '12px';
      setTimeout(() => { grid.style.outline = ''; grid.style.outlineOffset = ''; }, 600);
    } catch (err) {
      console.error('Failed to save dog order:', err);
      grid.style.outline = '2px solid #ef4444';
      setTimeout(() => { grid.style.outline = ''; }, 1000);
    }
  }

  // === OBSERVER: detect photo grids and dog card grids ===
  function scan() {
    // Photo thumbnail grids: flex containers with .shrink-0 children (80x80 thumbs)
    document.querySelectorAll('.flex.gap-2.overflow-x-auto.pb-2').forEach(el => {
      if (el.querySelector('.shrink-0')) {
        initPhotoSorting(el);
      }
    });

    // Dog card grids: grid-cols-3 or grid-cols-4 with dog cards
    document.querySelectorAll('.grid.gap-4').forEach(el => {
      const classes = el.className;
      if ((classes.includes('grid-cols-3') || classes.includes('grid-cols-4')) &&
          el.children.length > 1 &&
          el.closest('[class*="container"]')) {
        // Check it has dog card content (not other grids)
        const firstChild = el.children[0];
        if (firstChild && firstChild.querySelector('h3')) {
          initDogSorting(el);
        }
      }
    });
  }

  // Run scan periodically and on DOM changes
  const bodyObs = new MutationObserver(() => { setTimeout(scan, 100); });
  bodyObs.observe(document.body, { childList: true, subtree: true });
  setInterval(scan, 2000);
})();
