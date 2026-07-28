/* Replace the beheer blog editor's bare contentEditable with Quill (a
 * well-supported open-source rich-text editor loaded from CDN). We can't touch
 * the compiled bundle's editor, so instead we mount Quill next to the existing
 * contentEditable, hide the original + its custom toolbar, and bridge Quill's
 * output back into the original element's `input` event — which is how the
 * bundle already syncs content into React state and saves it. If Quill fails
 * to load, nothing is hidden and the original editor keeps working.
 */
(function () {
  var TOOLBAR = [
    [{ header: [2, 3, false] }],
    ['bold', 'italic'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote'],
    ['link'],
    ['clean']
  ];

  // Quill's getSemanticHTML() emits proper <ul>/<ol> and semantic tags, but
  // escapes every space as &nbsp; (which would break normal wrapping). Undo that.
  function toHTML(quill) {
    var h = '';
    try { h = quill.getSemanticHTML(); } catch (_) { h = quill.root.innerHTML; }
    return h.replace(/&nbsp;/g, ' ');
  }

  function mount(el) {
    if (el.__quillDone) return;
    if (!window.Quill) return; // CDN not ready/failed -> leave original editor intact
    el.__quillDone = true;

    var oldToolbar = el.previousElementSibling; // the custom .border-b.bg-muted/30 buttons
    var host = document.createElement('div');
    host.className = 'h4d-quill';
    el.parentNode.insertBefore(host, el);
    var editorDiv = document.createElement('div');
    host.appendChild(editorDiv);

    var quill;
    try {
      quill = new Quill(editorDiv, {
        theme: 'snow',
        modules: { toolbar: TOOLBAR },
        placeholder: 'Schrijf hier het bericht…'
      });
      quill.clipboard.dangerouslyPasteHTML(el.innerHTML || '');
    } catch (e) {
      // roll back on failure
      el.__quillDone = false;
      if (host.parentNode) host.parentNode.removeChild(host);
      return;
    }

    // Hide the original contentEditable + its toolbar; Quill takes over.
    el.style.display = 'none';
    if (oldToolbar && oldToolbar !== host) oldToolbar.style.display = 'none';

    // Bridge: Quill change -> write into the original element and fire its
    // native `input` listener so the bundle updates React state (and saves).
    quill.on('text-change', function () {
      try {
        el.innerHTML = toHTML(quill);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (_) {}
    });
  }

  function scan() {
    var eds = document.querySelectorAll('[contenteditable="true"], [contenteditable=""]');
    for (var i = 0; i < eds.length; i++) {
      var e = eds[i];
      if (e.isContentEditable && e.className && e.className.indexOf('prose') !== -1) mount(e);
    }
  }

  if (window.MutationObserver) {
    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  }
  document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', scan);
  scan();
})();
