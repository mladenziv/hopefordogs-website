/* Replace the beheer blog editor's bare contentEditable with Quill (loaded from
 * CDN). We can't touch the compiled bundle's editor, so we mount Quill next to
 * the existing contentEditable, hide the original + its custom toolbar, and
 * bridge Quill's output back into the original element's `input` event — which
 * is how the bundle syncs content into React state and saves it.
 *
 * Also adds a Rich <-> Markdown toggle. The Markdown<->HTML conversion is
 * SELF-CONTAINED (no CDN) so it can never silently fail: paste Markdown from
 * e.g. ChatGPT, switch to Rich, and it renders + saves as clean HTML.
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

  // ---- Markdown -> HTML (covers the blog's subset) --------------------------
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function inlineMd(s) {
    s = esc(s);
    // links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (_, t, u) {
      return '<a href="' + u + '">' + t + '</a>';
    });
    // bold **x** / __x__  (before italic)
    s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
    // italic *x* / _x_
    s = s.replace(/(^|[^*])\*(?!\s)([^*]+?)\*/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^_\w])_(?!\s)([^_]+?)_/g, '$1<em>$2</em>');
    // inline code `x`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }
  function mdToHTML(md) {
    var lines = (md || '').replace(/\r\n?/g, '\n').split('\n');
    var out = [], i = 0, n = lines.length;
    var isBlank = function (l) { return /^\s*$/.test(l); };
    var isHead = function (l) { return /^#{1,6}\s+/.test(l); };
    var isQuote = function (l) { return /^\s*>\s?/.test(l); };
    var isUl = function (l) { return /^\s*[-*+]\s+/.test(l); };
    var isOl = function (l) { return /^\s*\d+\.\s+/.test(l); };
    var isHr = function (l) { return /^\s*([-*_])(\s*\1){2,}\s*$/.test(l); };
    while (i < n) {
      var line = lines[i];
      if (isBlank(line)) { i++; continue; }
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { var lv = h[1].length; out.push('<h' + lv + '>' + inlineMd(h[2].trim()) + '</h' + lv + '>'); i++; continue; }
      if (isHr(line)) { out.push('<hr>'); i++; continue; }
      if (isQuote(line)) {
        var q = [];
        while (i < n && isQuote(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + inlineMd(q.join(' ')) + '</blockquote>');
        continue;
      }
      if (isUl(line)) {
        var ul = [];
        while (i < n && isUl(lines[i])) { ul.push('<li>' + inlineMd(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>'); i++; }
        out.push('<ul>' + ul.join('') + '</ul>');
        continue;
      }
      if (isOl(line)) {
        var ol = [];
        while (i < n && isOl(lines[i])) { ol.push('<li>' + inlineMd(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>'); i++; }
        out.push('<ol>' + ol.join('') + '</ol>');
        continue;
      }
      // paragraph: gather consecutive non-block lines
      var buf = [];
      while (i < n && !isBlank(lines[i]) && !isHead(lines[i]) && !isQuote(lines[i]) &&
             !isUl(lines[i]) && !isOl(lines[i]) && !isHr(lines[i])) {
        buf.push(lines[i]); i++;
      }
      if (buf.length) out.push('<p>' + inlineMd(buf.join(' ')) + '</p>');
    }
    return out.join('');
  }

  // ---- HTML -> Markdown -----------------------------------------------------
  function inlineToMd(node) {
    var s = '';
    Array.prototype.forEach.call(node.childNodes, function (c) {
      if (c.nodeType === 3) { s += c.textContent; return; }
      if (c.nodeType !== 1) return;
      var tag = c.tagName.toLowerCase(), inner = inlineToMd(c);
      if (tag === 'strong' || tag === 'b') s += '**' + inner + '**';
      else if (tag === 'em' || tag === 'i') s += '*' + inner + '*';
      else if (tag === 'a') s += '[' + inner + '](' + (c.getAttribute('href') || '') + ')';
      else if (tag === 'code') s += '`' + inner + '`';
      else if (tag === 'br') s += '\n';
      else s += inner;
    });
    return s.replace(/\s+/g, ' ').trim();
  }
  function htmlToMd(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    var out = [];
    Array.prototype.forEach.call(d.childNodes, function (node) {
      if (node.nodeType === 3) { var t = node.textContent.trim(); if (t) out.push(t); return; }
      if (node.nodeType !== 1) return;
      var tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) out.push(new Array(+tag[1] + 1).join('#') + ' ' + inlineToMd(node));
      else if (tag === 'blockquote') out.push('> ' + inlineToMd(node));
      else if (tag === 'ul') out.push(Array.prototype.map.call(node.children, function (li) { return '- ' + inlineToMd(li); }).join('\n'));
      else if (tag === 'ol') { var k = 0; out.push(Array.prototype.map.call(node.children, function (li) { k++; return k + '. ' + inlineToMd(li); }).join('\n')); }
      else if (tag === 'hr') out.push('---');
      else { var m = inlineToMd(node); if (m) out.push(m); }
    });
    return out.join('\n\n');
  }

  // Quill's getSemanticHTML() emits semantic tags but escapes spaces as &nbsp;.
  function toHTML(quill) {
    var h = '';
    try { h = quill.getSemanticHTML(); } catch (_) { h = quill.root.innerHTML; }
    return h.replace(/&nbsp;/g, ' ');
  }

  function mount(el) {
    if (el.__quillDone) return;
    if (!window.Quill) return; // CDN not ready/failed -> leave original editor intact
    el.__quillDone = true;

    var oldToolbar = el.previousElementSibling;
    var host = document.createElement('div');
    host.className = 'h4d-quill';
    el.parentNode.insertBefore(host, el);

    var mode = 'rich';

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
      el.__quillDone = false;
      if (host.parentNode) host.parentNode.removeChild(host);
      return;
    }

    el.style.display = 'none';
    if (oldToolbar && oldToolbar !== host) oldToolbar.style.display = 'none';

    function syncState(html) {
      try {
        el.innerHTML = html;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (_) {}
    }

    quill.on('text-change', function () {
      if (mode !== 'rich') return;
      syncState(toHTML(quill));
    });

    function qlToolbar() { return host.querySelector('.ql-toolbar'); }

    function toMarkdown() {
      ta.value = htmlToMd(toHTML(quill));
      editorDiv.style.display = 'none';
      var tb = qlToolbar(); if (tb) tb.style.display = 'none';
      ta.style.display = 'block';
      toggle.textContent = 'Rich tekst';
      toggle.classList.add('h4d-active');
      mode = 'md';
      ta.focus();
    }

    function toRich() {
      var html = mdToHTML(ta.value);
      mode = 'rich';
      try {
        quill.setContents([]);
        quill.clipboard.dangerouslyPasteHTML(html);
      } catch (_) {}
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

    // Keep state synced while editing Markdown too, so Save works in either mode.
    ta.addEventListener('input', function () {
      if (mode !== 'md') return;
      syncState(mdToHTML(ta.value));
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
