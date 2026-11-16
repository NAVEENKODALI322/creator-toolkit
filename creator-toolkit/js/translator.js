/* Title & Description Translator — sends one request, shows one card per language with copy buttons. */
(function () {
  'use strict';

  var MAX = 6;
  var LANGS = [
    ['english', 'English', 'English'], ['hindi', 'हिन्दी', 'Hindi'], ['bengali', 'বাংলা', 'Bengali'],
    ['marathi', 'मराठी', 'Marathi'], ['telugu', 'తెలుగు', 'Telugu'], ['tamil', 'தமிழ்', 'Tamil'],
    ['gujarati', 'ગુજરાતી', 'Gujarati'], ['urdu', 'اردو', 'Urdu'], ['kannada', 'ಕನ್ನಡ', 'Kannada'],
    ['odia', 'ଓଡ଼ିଆ', 'Odia'], ['malayalam', 'മലയാളം', 'Malayalam'], ['punjabi', 'ਪੰਜਾਬੀ', 'Punjabi'],
    ['assamese', 'অসমীয়া', 'Assamese'], ['bhojpuri', 'भोजपुरी', 'Bhojpuri']
  ];
  var DEFAULTS = ['english', 'hindi', 'telugu', 'tamil', 'bengali', 'marathi'];
  var KEY = 'ct-translate-langs';
  var busy = false;
  function t(k, d) { return (window.CT_I18N || {})[k] || d; }

  function saved() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return Array.isArray(v) && v.length ? v : null; } catch (e) { return null; }
  }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function picked() {
    return Array.prototype.map.call(document.querySelectorAll('#langPick input:checked'), function (i) { return i.value; });
  }

  function renderPicker() {
    var box = document.getElementById('langPick');
    var start = saved() || DEFAULTS;
    box.innerHTML = LANGS.map(function (l) {
      return '<label class="tr-chip"><input type="checkbox" value="' + l[0] + '"' + (start.indexOf(l[0]) !== -1 ? ' checked' : '') + '>' +
        '<span>' + l[1] + '</span>' + (l[1] !== l[2] ? '<small>' + l[2] + '</small>' : '') + '</label>';
    }).join('');
    box.addEventListener('change', function (e) {
      var list = picked();
      if (list.length > MAX) { e.target.checked = false; list = picked(); hint(t('max', 'You can pick up to 6 languages at a time.')); }
      else hint('');
      save(list);
      count();
    });
    count();
  }
  function count() { var c = document.getElementById('langCount'); if (c) c.textContent = picked().length + ' / ' + MAX; }
  function hint(msg) { var h = document.getElementById('langHint'); if (h) h.textContent = msg; }

  function nameOf(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === code) return LANGS[i]; return [code, code, code]; }

  async function run() {
    if (busy) return;
    var title = document.getElementById('titleInput').value.trim();
    var description = document.getElementById('descInput').value.trim();
    var out = document.getElementById('results');
    var btn = document.querySelector('.btn-primary-v2');
    var label = btn.getAttribute('data-label') || btn.innerText;
    var targets = picked();
    if (!title) { out.innerHTML = '<p class="ck-warn">' + esc(t('needTitle', 'Type or paste your video title first.')) + '</p>'; return; }
    if (!targets.length) { out.innerHTML = '<p class="ck-warn">' + esc(t('needLang', 'Pick at least one language.')) + '</p>'; return; }

    busy = true; btn.disabled = true; btn.innerText = t('working', '⏳ Translating... (10–20 sec)');
    out.innerHTML = '<p class="ck-info">' + esc(t('wait', 'Translating into ' + targets.length + ' languages, please wait...')) + '</p>';
    try {
      var res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'translate', title: title, description: description, targets: targets })
      });
      var data = {}; try { data = await res.json(); } catch (e) {}
      if (!res.ok || !data.translations) { out.innerHTML = '<p class="ck-warn">' + esc(data.error || t('fail', 'Something went wrong. Please try again.')) + '</p>'; return; }
      out.innerHTML = data.translations.map(function (r, i) {
        var n = nameOf(r.language);
        var dir = r.language === 'urdu' ? ' dir="rtl"' : '';
        if (r.error) return '<div class="tr-card"><h3>' + esc(n[1]) + ' <small>' + esc(n[2]) + '</small></h3><p class="ck-warn">' + esc(r.error) + '</p></div>';
        return '<div class="tr-card"><h3>' + esc(n[1]) + ' <small>' + esc(n[2]) + '</small></h3>' +
          '<p class="tr-label">' + esc(t('title', 'Title')) + ' <span>' + Array.from(r.title).length + ' / 100</span></p>' +
          '<div class="tr-text" id="tt' + i + '"' + dir + '>' + esc(r.title) + '</div>' +
          '<button type="button" class="tr-copy" data-target="tt' + i + '">' + esc(t('copyTitle', 'Copy title')) + '</button>' +
          (r.description ? '<p class="tr-label">' + esc(t('desc', 'Description')) + '</p><div class="tr-text tr-desc" id="td' + i + '"' + dir + '>' + esc(r.description) + '</div>' +
            '<button type="button" class="tr-copy" data-target="td' + i + '">' + esc(t('copyDesc', 'Copy description')) + '</button>' : '') +
          '</div>';
      }).join('');
    } catch (err) {
      out.innerHTML = '<p class="ck-warn">' + esc(t('offline', 'Could not reach the server. Check your internet connection and try again.')) + '</p>';
    } finally {
      busy = false; btn.disabled = false; btn.innerText = label;
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tr-copy');
    if (!b) return;
    var el = document.getElementById(b.getAttribute('data-target'));
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(function () {
      var o = b.textContent; b.textContent = '✅ ' + t('copied', 'Copied'); setTimeout(function () { b.textContent = o; }, 1800);
    });
  });

  document.addEventListener('DOMContentLoaded', renderPicker);
  window.ctTranslate = { run: run };
})();
