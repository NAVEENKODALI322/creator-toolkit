(function () {
  var KEY = 'ct-theme', root = document.documentElement;

  function current() { return root.getAttribute('data-theme') || 'dark'; }

  function apply(t) {
    root.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.textContent = t === 'dark' ? '☀️' : '🌙';
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.theme-toggle');
    if (!b) return;
    var t = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, t); } catch (_) {}
    apply(t);
  });

  document.addEventListener('DOMContentLoaded', function () { apply(current()); });
})();
