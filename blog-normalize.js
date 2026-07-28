/* Shared blog-content normalizer.
 * Cleans the messy Notes/Word-pasted HTML stored in posts.content so the SITE
 * (post.html render) and the BEHEER editor (on load) show identical, clean
 * formatting. Text is preserved — only structure/styling is normalized.
 *
 *   window.h4dCleanBlog(rootEl)      -> cleans an element in place
 *   window.h4dCleanBlogHTML(htmlStr) -> returns cleaned HTML string
 */
(function () {
  function renameTags(root, from, to) {
    root.querySelectorAll(from).forEach(function (o) {
      var e = document.createElement(to);
      while (o.firstChild) e.appendChild(o.firstChild);
      o.parentNode.replaceChild(e, o);
    });
  }
  function unwrap(el) {
    var p = el.parentNode;
    if (!p) return;
    while (el.firstChild) p.insertBefore(el.firstChild, el);
    p.removeChild(el);
  }

  // Wrap consecutive bare inline/text nodes (direct children of root) into <p>.
  function wrapBareRuns(root) {
    var BLOCK = {P:1,DIV:1,H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,UL:1,OL:1,LI:1,BLOCKQUOTE:1,HR:1,TABLE:1,FIGURE:1,PRE:1,SECTION:1,ARTICLE:1};
    var run = [];
    function flush() {
      if (!run.length) return;
      var keep = run.some(function (n) {
        return (n.nodeType === 3 && n.textContent.trim()) ||
               (n.nodeType === 1 && (n.textContent.trim() || n.tagName === 'IMG' || (n.querySelector && n.querySelector('img'))));
      });
      if (keep) {
        var p = document.createElement('p');
        run[0].parentNode.insertBefore(p, run[0]);
        run.forEach(function (n) { p.appendChild(n); });
      } else {
        run.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      }
      run = [];
    }
    Array.prototype.slice.call(root.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && BLOCK[n.tagName]) flush();
      else run.push(n);
    });
    flush();
  }

  // Turn paragraphs whose lines start with a bullet char into real <ul><li>.
  function convertLiteralBullets(root) {
    var BULLET = /^[•▪◦‣·⁃]/;
    Array.prototype.slice.call(root.querySelectorAll('p')).forEach(function (p) {
      if (!/<br/i.test(p.innerHTML)) return;
      var parts = p.innerHTML.split(/<br\s*\/?>/i);
      var bulletCount = parts.filter(function (s) {
        return BULLET.test(s.replace(/<[^>]+>/g, '').replace(/ /g, ' ').trim());
      }).length;
      if (bulletCount < 2) return; // conservative: only real lists
      var frag = document.createDocumentFragment();
      var curUl = null, curP = [];
      function flushP() {
        if (!curP.length) return;
        var np = document.createElement('p');
        np.innerHTML = curP.join('<br>');
        if (np.textContent.trim()) frag.appendChild(np);
        curP = [];
      }
      parts.forEach(function (seg) {
        var plain = seg.replace(/<[^>]+>/g, '').replace(/ /g, ' ').trim();
        if (BULLET.test(plain)) {
          flushP();
          if (!curUl) { curUl = document.createElement('ul'); frag.appendChild(curUl); }
          var li = document.createElement('li');
          li.innerHTML = seg.replace(/^(?:[\s ]|&nbsp;)*[•▪◦‣·⁃][\s ]*/, '');
          curUl.appendChild(li);
        } else if (plain) {
          curUl = null;
          curP.push(seg);
        } // empty segment: keep the current list open
      });
      flushP();
      if (frag.childNodes.length) p.parentNode.replaceChild(frag, p);
    });
  }

  window.h4dCleanBlog = function (root) {
    if (!root) return;
    // 1) Strip polluting inline styles (denylist). Keep width/height only on <img>.
    var STRIP_RE = /(?:^|;)\s*(?:font[\w-]*|line-height|letter-spacing|white-space|color|background[\w-]*|-webkit-[\w-]*|-moz-[\w-]*|mso-[\w-]*|min-height|max-height|height|margin[\w-]*|padding[\w-]*|text-indent|list-style[\w-]*|vertical-align|text-transform|word-spacing|orphans|widows|text-decoration[\w-]*)\s*:[^;]*/gi;
    root.querySelectorAll('[style]').forEach(function (el) {
      var keepHW = el.tagName === 'IMG';
      var c = el.getAttribute('style').replace(STRIP_RE, '');
      if (!keepHW) c = c.replace(/(?:^|;)\s*(?:width|height)\s*:[^;]*/gi, '');
      c = c.replace(/^;+|;+$/g, '').replace(/;;+/g, ';').trim();
      if (c) el.setAttribute('style', c); else el.removeAttribute('style');
      el.removeAttribute('class');
    });

    // 2) Normalize tags.
    renameTags(root, 'b', 'strong');
    renameTags(root, 'i', 'em');
    root.querySelectorAll('font').forEach(unwrap);
    root.querySelectorAll('span').forEach(unwrap);

    // 3) Wrap bare text runs; then turn literal-bullet paragraphs into real lists.
    wrapBareRuns(root);
    convertLiteralBullets(root);

    // 4) Promote bold-only paragraphs to <h2>; drop the first (duplicates the page title).
    var firstDone = false, idx = 0;
    root.querySelectorAll('p').forEach(function (para) {
      var i = idx++;
      var txt = para.textContent.replace(/ /g, ' ').trim();
      if (!txt) return;
      var onlyBold = null, ok = true;
      para.childNodes.forEach(function (ch) {
        if (ch.nodeType === 3 && ch.textContent.trim() === '') return;
        if (ch.nodeType === 1 && ch.tagName === 'STRONG' && !onlyBold) { onlyBold = ch; return; }
        ok = false;
      });
      if (!ok || !onlyBold) return;
      if (txt.length > 100) return;
      if (/[.!?]\s*$/.test(txt) && txt.split(/\s+/).length > 8) return;
      if (!firstDone && i <= 1) { firstDone = true; para.parentNode.removeChild(para); return; }
      var h = document.createElement('h2');
      h.textContent = txt;
      para.parentNode.replaceChild(h, para);
    });

    // 5) Remove empty spacer <p>/<div> (no text, no media) — these are the "empty rows".
    root.querySelectorAll('p, div').forEach(function (b) {
      if (!b.textContent.replace(/ /g, '').trim() && !b.querySelector('img,iframe,video')) {
        b.parentNode.removeChild(b);
      }
    });

    // 6) Drop empty list items.
    root.querySelectorAll('li').forEach(function (li) {
      if (!li.textContent.trim() && !li.querySelector('img')) li.parentNode.removeChild(li);
    });

    // 7) Strip leading markdown heading markers ("* "/"** ").
    root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (h) {
      var t = h.textContent.replace(/^\s*\*+\s*/, '').trim();
      if (t !== h.textContent) h.textContent = t;
    });

    // 8) Convert the author's " -- " into an em dash (text-only; last).
    root.innerHTML = root.innerHTML.replace(/ +-- +/g, ' — ');
  };

  window.h4dCleanBlogHTML = function (html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    window.h4dCleanBlog(d);
    return d.innerHTML;
  };
})();
