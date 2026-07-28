/* Replace the beheer blog editor's bare contentEditable with Quill (a
 * well-supported open-source rich-text editor loaded from CDN). We can't touch
 * the compiled bundle's editor, so instead we mount Quill next to the existing
 * contentEditable, hide the original + its custom toolbar, and bridge Quill's
 * output back into the original element's `input` event — which is how the
 * bundle already syncs content into React state and saves it. If Quill fails
 * to load, nothing is hidden and the original editor keeps working.
 *
 * Also adds a Rich <-> Markdown toggle: switch to a plain Markdown box (via
 * turndown/marked from CDN), paste Markdown from e.g. ChatGPT, switch back and
 * it renders into Quill and saves as clean HTML.
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

  function htmlToMarkdown(html) {
    try {
      if (window.TurndownService) {
        var td = new window.TurndownService({
          headingStyle: 'atx',
          hr: '---',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced',
          emDelimiter: '*'
        });
        return td.turndown(html || '');
      }
    } catch (_) {}
    return html || '';
  }

  function markdownToHTML(md) {
    try {
      if (window.marked) {
        var fn = window.marked.parse || window.marked;
        return fn(md || '', { breaks: false, mangle: false, headerIds: false });
      }
    } catch (_) {}
    return md || '';
  }

  function mount(el) {
    if (el.__quillDone) return;
    if (!window.Quill) return; // CDN not ready/failed -> leave original editor intact
    el.__quillDone = true;

    var oldToolbar = el.previousElementSibling; // the custom .border-b.bg-muted/30 buttons
    var host = document.createElement('div');
    host.className = 'h4d-quill';
    el.parentNode.insertBefore(host, el);

    var mode = 'rich';

    // Mode bar with the Rich <-> Markdown toggle.
    var bar = document.createElement('div');
    bar.className = 'h4d-modebar';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'h4d-mdtoggle';
    toggle.textContent = 'Markdown';
    toggle.title = 'Wissel naar Markdown (bijv. om tekst van ChatGPT te plakken)';
    bar.appendChild(toggle);
    host.appendChild(bar);

    var editorDiv = document.createElement('div');
    host.appendChild(editorDiv);

    // Markdown source box (hidden until toggled on).
    var ta = document.createElement('textarea');
    ta.className = 'h4d-md';
    ta.style.display = 'none';
    ta.setAttribute('spellcheck', 'false');
    ta.placeholder = 'Plak hier Markdown… (bijv. van ChatGPT). Klik daarna op “Rich tekst”.';
    host.appendChild(ta);

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

    // Bridge: write into the original element and fire its native `input`
    // listener so the bundle updates React state (and saves).
    function syncState(html) {
      try {
        el.innerHTML = html;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (_) {}
    }

    // Quill edits -> state (only while in rich mode).
    quill.on('text-change', function () {
      if (mode !== 'rich') return;
      syncState(toHTML(quill));
    });

    function qlToolbar() { return host.querySelector('.ql-toolbar'); }

    function toMarkdown() {
      ta.value = htmlToMarkdown(toHTML(quill));
      editorDiv.style.display = 'none';
      var tb = qlToolbar(); if (tb) tb.style.display = 'none';
      ta.style.display = 'block';
      toggle.textContent = 'Rich tekst';
      toggle.classList.add('h4d-active');
      mode = 'md';
      ta.focus();
    }

    function toRich() {
      var html = markdownToHTML(ta.value);
      mode = 'rich';
      try { quill.clipboard.dangerouslyPasteHTML(html); } catch (_) {}
      syncState(toHTML(quill));
      ta.style.display = 'none';
      editorDiv.style.display = '';
      var tb = qlToolbar(); if (tb) tb.style.display = '';
      toggle.textContent = 'Markdown';
      toggle.classList.remove('h4d-active');
    }

    toggle.addEventListener('click', function () {
      if (mode === 'rich') toMarkdown(); else toRich();
    });

    // Keep state in sync while editing in Markdown mode too, so Save works
    // regardless of which mode is active.
    ta.addEventListener('input', function () {
      if (mode !== 'md') return;
      syncState(markdownToHTML(ta.value));
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
