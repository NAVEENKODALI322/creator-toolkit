(function () {
  if (document.getElementById('ctNav')) return;

  var path = location.pathname.replace(/\/$/, '') || '/index.html';
  if (path === '') path = '/index.html';

  var ICONS = {"title-translator": "<span class=\"ct-icon\" style=\"--i1:#0891b2;--i2:#6366f1\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 5h8M8 3v2M10 5c0 4-3 7-6 8\"/><path d=\"M6 9c1 2 3 3.5 5 4\"/><path d=\"m13 21 4-10 4 10\"/><path d=\"M14.5 18h5\"/></svg></span>", "title-generator": "<span class=\"ct-icon\" style=\"--i1:#6366f1;--i2:#8b5cf6\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 7V5h16v2\"/><path d=\"M12 5v14\"/><path d=\"M9 19h6\"/></svg></span>", "description-generator": "<span class=\"ct-icon\" style=\"--i1:#0ea5e9;--i2:#6366f1\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3v5h5\"/><path d=\"M9 13h6M9 17h4\"/></svg></span>", "tags-generator": "<span class=\"ct-icon\" style=\"--i1:#f59e0b;--i2:#ef4444\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/></svg></span>", "hashtag-generator": "<span class=\"ct-icon\" style=\"--i1:#ec4899;--i2:#8b5cf6\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 9h14M4 15h14M10 3 8 21M16 3l-2 18\"/></svg></span>", "viral-hook-generator": "<span class=\"ct-icon\" style=\"--i1:#f97316;--i2:#ef4444\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M13 2 4 14h7l-1 8 9-12h-7z\"/></svg></span>", "shorts-script-generator": "<span class=\"ct-icon\" style=\"--i1:#ef4444;--i2:#ec4899\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"/><path d=\"M11 18h2\"/><path d=\"M10 7h4M10 10h4M10 13h2\"/></svg></span>", "video-ideas-generator": "<span class=\"ct-icon\" style=\"--i1:#eab308;--i2:#f97316\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 18h6M10 21h4\"/><path d=\"M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z\"/></svg></span>", "thumbnail-text-generator": "<span class=\"ct-icon\" style=\"--i1:#a855f7;--i2:#ec4899\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20h16\"/><path d=\"m6 16 6-12 6 12\"/><path d=\"M8.5 11h7\"/></svg></span>", "comment-reply-generator": "<span class=\"ct-icon\" style=\"--i1:#3b82f6;--i2:#06b6d4\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/><path d=\"M8 9h8M8 13h5\"/></svg></span>", "youtube-chapters-generator": "<span class=\"ct-icon\" style=\"--i1:#22c55e;--i2:#14b8a6\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg></span>", "title-description-checker": "<span class=\"ct-icon\" style=\"--i1:#10b981;--i2:#22c55e\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 11l3 3 8-8\"/><path d=\"M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"/></svg></span>", "thumbnail-downloader": "<span class=\"ct-icon\" style=\"--i1:#14b8a6;--i2:#0ea5e9\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 15 5-5 4 4 3-3 6 6\"/><path d=\"M12 21v-3\"/></svg></span>"};
  var tools = [
    ['title-generator', 'Title Generator', '/title-generator.html'],
    ['description-generator', 'Description Generator', '/description-generator.html'],
    ['tags-generator', 'Tags Generator', '/tags-generator.html'],
    ['hashtag-generator', 'Hashtag Generator', '/hashtag-generator.html'],
    ['viral-hook-generator', 'Viral Hook Generator', '/viral-hook-generator.html'],
    ['shorts-script-generator', 'Shorts Script Generator', '/shorts-script-generator.html'],
    ['video-ideas-generator', 'Video Ideas Generator', '/video-ideas-generator.html'],
    ['thumbnail-text-generator', 'Thumbnail Text Ideas', '/thumbnail-text-generator.html'],
    ['title-translator', 'Title & Description Translator', '/title-translator.html'],
    ['comment-reply-generator', 'Comment Reply Generator', '/comment-reply-generator.html'],
    ['youtube-chapters-generator', 'Chapters Formatter', '/youtube-chapters-generator.html'],
    ['title-description-checker', 'Title & Description Checker', '/title-description-checker.html'],
    ['thumbnail-downloader', 'Thumbnail Downloader', '/thumbnail-downloader.html']
  ];

  var langPrefix = (/^\/(te|hi)\//.exec(location.pathname) || [])[0] || '/';
  var basePath = path.replace(/^\/(te|hi)\//, '/');
  var isToolPage = tools.some(function (t) { return basePath === t[2]; });
  function cls(on) { return on ? ' class="active"' : ''; }

  var toolLinks = tools.map(function (t) {
    return '<a href="' + langPrefix + t[2].slice(1) + '"' + cls(basePath === t[2]) + '>' + ICONS[t[0]] + t[1] + '</a>';
  }).join('');

  var html =
    '<header class="ct-nav" id="ctNav"><div class="ct-nav-inner">' +
      '<a href="' + langPrefix + '" class="ct-logo" aria-label="Creator Toolkit home">' +
        '<span class="ct-logo-mark"><svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><defs><linearGradient id="ctg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="34" height="34" rx="10" fill="url(#ctg)"/><path d="M13 10.5v13l11-6.5z" fill="#fff"/></svg></span>' +
        '<span class="ct-logo-text">Creator<span>Toolkit</span></span></a>' +
      '<nav class="ct-menu" id="ctMenu" aria-label="Main navigation">' +
        '<div class="ct-dd" id="ctDd">' +
          '<button type="button" class="ct-dd-btn' + (isToolPage ? ' active' : '') + '" id="ctDdBtn" aria-expanded="false">Tools <i>▾</i></button>' +
          '<div class="ct-dd-menu">' + toolLinks + '<a href="' + langPrefix + '#toolsGrid" class="ct-all">View all tools →</a></div>' +
        '</div>' +
        '<a href="/blog/"' + cls(path.indexOf('/blog') === 0) + '>Blog</a>' +
        /* Videos temporarily hidden for AdSense approval */
        '<a href="/about.html"' + cls(path === '/about.html') + '>About</a>' +
        '<a href="/contact.html"' + cls(path === '/contact.html') + '>Contact</a>' +
        '<a href="' + langPrefix + '#toolsGrid" class="ct-cta">Try Free Tools →</a>' +
      '</nav>' +
      '<button class="ct-burger" id="ctBurger" aria-label="Open menu" aria-expanded="false" aria-controls="ctMenu"><span></span><span></span><span></span></button>' +
    '</div></header>';

  var css =
    'a[href*="videos"], a[href*="/videos"] { display: none !important; }' +
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
    '' +
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

  var LANG_LABEL = { en: ['EN', 'English'], te: ['తె', 'తెలుగు'], hi: ['हि', 'हिन्दी'] };
  function langSwitch() {
    var alts = document.querySelectorAll('link[rel="alternate"][hreflang]');
    var items = [];
    alts.forEach(function (l) {
      var code = l.getAttribute('hreflang');
      if (!LANG_LABEL[code]) return;
      var u = l.getAttribute('href').replace(/^https?:\/\/[^/]+/, '');
      items.push([code, u]);
    });
    if (items.length < 2) return '';
    var cur = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
    if (!LANG_LABEL[cur]) cur = 'en';
    var links = items.map(function (it) {
      return '<a href="' + it[1] + '" hreflang="' + it[0] + '" lang="' + it[0] + '"' + (it[0] === cur ? ' aria-current="true"' : '') + '>' + LANG_LABEL[it[0]][1] + '<small>' + it[0].toUpperCase() + '</small></a>';
    }).join('');
    return '<div class="ct-lang" id="ctLang"><button type="button" class="ct-lang-btn" id="ctLangBtn" aria-expanded="false" aria-label="Change page language">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>' +
      LANG_LABEL[cur][0] + '</button><div class="ct-lang-menu">' + links + '</div></div>';
  }

  function mount() {
    if (!document.querySelector('link[href="/css/site.css"]')) {
      var sl = document.createElement('link'); sl.rel = 'stylesheet'; sl.href = '/css/site.css'; document.head.appendChild(sl);
    }
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    document.body.insertAdjacentHTML('afterbegin', html.replace('<button class="ct-burger"', langSwitch() + '<button class="ct-burger"'));
    var lg = document.getElementById('ctLang');
    if (lg) {
      document.getElementById('ctLangBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        var open = lg.classList.toggle('open');
        this.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) { if (!lg.contains(e.target)) lg.classList.remove('open'); });
    }

    document.querySelectorAll('a[href*="videos"], a[href*="/videos"]').forEach(function(el) {
      el.style.display = 'none';
      if (el.nextSibling && el.nextSibling.nodeType === 3) {
        el.nextSibling.textContent = el.nextSibling.textContent.replace(/·|\s/g, '');
      }
    });

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
  try { root.setAttribute('data-theme', localStorage.getItem('ct-theme')||'light'); }
  catch (e) { root.setAttribute('data-theme','light'); }

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
    var lg = document.getElementById('ctLang');
    inner.insertBefore(b, lg ? lg.nextSibling : document.getElementById('ctBurger'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
  else addButton();
})();
