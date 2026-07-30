// Adds a "Loterijen" link to the beheer top nav, pointing at the standalone
// lottery admin (loterijen.html). Done as a DOM injector (not a bundle edit)
// because the lottery admin is a separate page, not an in-app React route.
// A MutationObserver re-adds the link if React re-renders the nav.
(function () {
  // Same classes the inactive nav buttons use (from the compiled bundle), so it
  // matches the other items visually.
  var CLS = 'px-3 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap text-foreground/70 hover:text-foreground hover:bg-black/5';

  function inject() {
    var nav = document.querySelector('header nav');
    if (!nav) return;
    if (!nav.querySelector('#lottery-nav-link')) {
      var a = document.createElement('a');
      a.id = 'lottery-nav-link';
      a.href = 'loterijen.html';
      a.className = CLS;
      a.textContent = 'Acties';
      nav.appendChild(a);
    }
    if (!nav.querySelector('#translate-nav-link')) {
      var t = document.createElement('a');
      t.id = 'translate-nav-link';
      t.href = 'vertalen.html';
      t.className = CLS;
      t.textContent = 'Vertalen';
      nav.appendChild(t);
    }
  }

  function start() {
    inject();
    new MutationObserver(function () { inject(); }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
