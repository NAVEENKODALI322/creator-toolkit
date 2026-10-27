(function () {
  if (document.getElementById('ctNav')) return;

  var path = location.pathname.replace(/\/$/, '') || '/index.html';
  if (path === '') path = '/index.html';

  var tools = [
    ['🔥', 'Viral Hook Generator', '/viral-hook-generator.html'],
    ['🎬', 'Title Generator', '/title-generator.html'],
    ['📝', 'Description Generator', '/description-generator.html'],
    ['🏷️', 'Tags Generator', '/tags-generator.html'],
    ['#️⃣', 'Hashtag Generator', '/hashtag-generator.html'],
    ['🖼️', 'Thumbnail Downloader', '/thumbnail-downloader.html']
  ];

  var isToolPage = tools.some(function (t) { return path === t[2]; });
  function cls(on) { return on ? ' class="active"' : ''; }

  var toolLinks = tools.map(function (t) {
    return '<a href="' + t[2] + '"' + cls(path === t[2]) + '><span>' + t[0] + '</span>' + t[1] + '</a>';
  }).join('');

  var html =
    '<header class="ct-nav" id="ctNav"><div class="ct-nav-inner">' +
      '<a href="/index.html" class="ct-logo" aria-label="Creator Toolkit home">' +
        '<span class="ct-logo-mark">🚀</span>' +
        '<span class="ct-logo-text">Creator<span>Toolkit</span></span></a>' +
      '<nav class="ct-menu" id="ctMenu" aria-label="Main navigation">' +
        '<div class="ct-dd" id="ctDd">' +
          '<button type="button" class="ct-dd-btn' + (isToolPage ? ' active' : '') + '" id="ctDdBtn" aria-expanded="false">Tools <i>▾</i></button>' +
          '<div class="ct-dd-menu">' + toolLinks + '<a href="/index.html#toolsGrid" class="ct-all">View all tools →</a></div>' +
        '</div>' +
        '<a href="/blog/index.html"' + cls(path.indexOf('/blog') === 0) + '>Blog</a>' +
        /* Videos temporarily hidden for AdSense approval */
        '<a href="/about.html"' + cls(path === '/about.html') + '>About</a>' +
        '<a href="/contact.html"' + cls(path === '/contact.html') + '>Contact</a>' +
        '<a href="/index.html#toolsGrid" class="ct-cta">Try Free Tools →</a>' +
      '</nav>' +
      '<button class="ct-burger" id="ctBurger" aria-label="Open menu" aria-expanded="false" aria-controls="ctMenu"><span></span><span></span><span></span></button>' +
    '</div></header>';

  var css =
    '.ct-nav{position:sticky;top:0;z-index:1000;background:rgba(10,12,26,.78);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.08);font-family:inherit}' +
    '.ct-nav-inner{max-width:1270px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}' +
    '.ct-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:1.1rem}' +
    '.ct-logo-mark{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;font-size:1rem;background:linear-gradient(135deg,#3b82f6,#8b5cf6);box-shadow:0 4px 14px rgba(99,102,241,.45)}' +
    '.ct-logo-text span{margin-left:4px;background:linear-gradient(90deg,#22d3ee,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.ct-menu{display:flex;align-items:center;gap:4px}' +
    '.ct-menu a,.ct-dd-btn{color:rgba(255,255,255,.78);text-decoration:none;font:inherit;font-weight:500;font-size:.95rem;padding:8px 14px;border-radius:999px;border:0;background:none;cursor:pointer;transition:background .2s,color .2s,transform .2s}' +
    '.ct-menu a:hover,.ct-dd-btn:hover{background:rgba(255,255,255,.08);color:#fff}' +
    '.ct-menu a.active,.ct-dd-btn.active{color:#fff;background:rgba(255,255,255,.12)}' +
    '.ct-menu a.ct-cta{margin-left:10px;color:#fff;font-weight:600;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 6px 18px rgba(99,102,241,.4)}' +
    '.ct-menu a.ct-cta:hover{filter:brightness(1.12);transform:translateY(-1px)}' +
    '.ct-dd{position:relative}' +
    '.ct-dd-btn i{font-style:normal;font-size:.75rem;margin-left:2px}' +
    '.ct-dd-menu{display:none;position:absolute;top:calc(100% + 8px);left:0;min-width:270px;padding:8px;border-radius:16px;background:rgba(14,17,36,.98);border:1px solid rgba(255,255,255,.1);box-shadow:0 18px 40px rgba(0,0,0,.5)}' +
    '.ct-dd.open .ct-dd-menu{display:block}' +
    '.ct-dd-menu a{display:flex;align-items:center;gap:10px;border-radius:10px;padding:10px 12px;width:100%;box-sizing:border-box}' +
    '.ct-dd-menu a span{width:26px;text-align:center}' +
    '.ct-dd-menu a.ct-all{margin-top:6px;border-top:1px solid rgba(255,255,255,.08);border-radius:0 0 10px 10px;color:#a78bfa;font-weight:600}' +
    '.ct-burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:42px;height:42px;padding:0 10px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);cursor:pointer}' +
    '.ct-burger span{display:block;height:2px;border-radius:2px;background:#fff}' +
    '@media (max-width:860px){' +
      '.ct-burger{display:flex}' +
      '.ct-menu{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;gap:2px;padding:12px 16px 16px;background:rgba(10,12,26,.98);border-bottom:1px solid rgba(255,255,255,.08);max-height:80vh;overflow-y:auto}' +
      '.ct-menu.open{display:flex}' +
      '.ct-menu a,.ct-dd-btn{padding:12px 14px;font-size:1rem;text-align:left;width:100%;box-sizing:border-box}' +
      '.ct-dd-menu{position:static;min-width:0;box-shadow:none;border:0;background:rgba(255,255,255,.04);margin:4px 0 6px}' +
      '.ct-menu a.ct-cta{margin:8px 0 0;text-align:center}' +
    '}' +
     '.topbar{display:none !important}' +
   '.back-btn{display:none !important}';

  function mount() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    document.body.insertAdjacentHTML('afterbegin', html);
    document.querySelectorAll('header, nav, .topbar').forEach(function (el) {
      if (el.closest('#ctNav')) return;
      var t = (el.textContent || '').trim();
      if (t.length < 120 && t.indexOf('Creator Toolkit') !== -1) {
        el.style.display = 'none';
      }
    });

    var burger = document.getElementById('ctBurger');
    var menu = document.getElementById('ctMenu');
    var dd = document.getElementById('ctDd');
    var ddBtn = document.getElementById('ctDdBtn');

    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    ddBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
        ddBtn.setAttribute('aria-expanded', 'false');
      }
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();

/* Theme toggle for inner pages */
(function () {
  var root = document.documentElement;
  try { root.setAttribute('data-theme', localStorage.getItem('ct-theme') || 'dark'); }
  catch (e) { root.setAttribute('data-theme', 'dark'); }

  if (!document.querySelector('link[href*="light-theme.css"]')) {
    var lk = document.createElement('link');
    lk.rel = 'stylesheet';
    lk.href = '/light-theme.css';
    document.head.appendChild(lk);
  }
  if (!document.querySelector('script[src*="theme.js"]')) {
    var ts = document.createElement('script');
    ts.src = '/theme.js';
    document.head.appendChild(ts);
  }

  function addButton() {
    var inner = document.querySelector('#ctNav .ct-nav-inner');
    if (!inner || inner.querySelector('.theme-toggle')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-toggle';
    b.setAttribute('aria-label', 'Switch theme');
    b.textContent = root.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
    inner.insertBefore(b, document.getElementById('ctBurger'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
  else addButton();
})();
