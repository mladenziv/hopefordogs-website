/* Progressive enhancement for the beheer blog-post editor (a plain
 * contentEditable + execCommand toolbar in the compiled bundle). All additive —
 * we attach listeners, never replace React's handlers. Guarded so any error
 * can never break the editor.
 *
 * Adds: Enter after a heading starts a normal paragraph (no stray divider),
 * clicking the active H2/H3 toggles back to paragraph, P also clears inline
 * bold/italic, and the toolbar highlights the current block/format.
 */
(function () {
  var BLOCK = { 'H2': 'h2', 'H3': 'h3', 'P': 'p' };

  function currentBlock(editor) {
    try {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return null;
      var n = sel.getRangeAt(0).startContainer;
      if (n.nodeType === 3) n = n.parentNode;
      while (n && n !== editor && !/^(P|H1|H2|H3|H4|H5|H6|LI|BLOCKQUOTE)$/.test(n.tagName || '')) n = n.parentNode;
      return (n && n !== editor) ? n : null;
    } catch (_) { return null; }
  }

  function formatButtons(toolbar) {
    var out = {};
    if (!toolbar) return out;
    Array.prototype.slice.call(toolbar.querySelectorAll('button')).forEach(function (b) {
      var t = (b.textContent || '').trim();
      if (t === 'H2' || t === 'H3' || t === 'P' || t === 'B' || t === 'I') out[t] = b;
    });
    return out;
  }

  function updateActive(editor) {
    try {
      var toolbar = editor.previousElementSibling;
      var btns = formatButtons(toolbar);
      var cb = currentBlock(editor);
      var tag = cb ? cb.tagName : '';
      ['H2', 'H3', 'P'].forEach(function (k) {
        if (btns[k]) btns[k].classList.toggle('h4d-active', tag === k);
      });
      if (btns.B) btns.B.classList.toggle('h4d-active', document.queryCommandState('bold'));
      if (btns.I) btns.I.classList.toggle('h4d-active', document.queryCommandState('italic'));
    } catch (_) {}
  }

  function enhance(editor) {
    if (editor.__h4dEnh) return;
    editor.__h4dEnh = true;
    var toolbar = editor.previousElementSibling;
    if (!toolbar) return;
    var allBtns = Array.prototype.slice.call(toolbar.querySelectorAll('button'));
    var preTag = '';

    allBtns.forEach(function (b) {
      // Keep the editor's selection when a toolbar button is pressed.
      b.addEventListener('mousedown', function (e) {
        e.preventDefault();
        var cb = currentBlock(editor);
        preTag = cb ? cb.tagName : '';
      });
      var label = (b.textContent || '').trim();
      // Run AFTER React's execCommand (setTimeout 0), additive.
      b.addEventListener('click', function () {
        setTimeout(function () {
          try {
            if ((label === 'H2' || label === 'H3') && preTag === label) {
              document.execCommand('formatBlock', false, 'p'); // toggle heading off
            } else if (label === 'P') {
              document.execCommand('removeFormat'); // P => plain paragraph, drop bold/italic
            }
          } catch (_) {}
          updateActive(editor);
        }, 0);
      });
    });

    // Enter after a heading should continue as a normal paragraph.
    editor.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.shiftKey) return;
      var cb = currentBlock(editor);
      if (cb && /^H[1-6]$/.test(cb.tagName)) {
        setTimeout(function () {
          var nb = currentBlock(editor);
          if (nb && /^H[1-6]$/.test(nb.tagName) && !nb.textContent.trim()) {
            try { document.execCommand('formatBlock', false, 'p'); } catch (_) {}
            updateActive(editor);
          }
        }, 0);
      }
    });

    editor.addEventListener('keyup', function () { updateActive(editor); });
    editor.addEventListener('mouseup', function () { updateActive(editor); });
    updateActive(editor);
  }

  // Keep the active-state in sync as the caret moves.
  document.addEventListener('selectionchange', function () {
    var a = document.activeElement;
    if (a && a.isContentEditable) updateActive(a);
  });

  function scan() {
    var eds = document.querySelectorAll('[contenteditable="true"], [contenteditable=""]');
    for (var i = 0; i < eds.length; i++) {
      if (eds[i].isContentEditable && eds[i].className && eds[i].className.indexOf('prose') !== -1) enhance(eds[i]);
    }
  }

  if (window.MutationObserver) {
    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  }
  document.addEventListener('DOMContentLoaded', scan);
  scan();
})();
