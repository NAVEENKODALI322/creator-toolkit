/* Creator Toolkit — shared output-language picker.
   Fills every <select id="language" data-ct-lang> with the Indian languages the AI tools support,
   picks a sensible default the first time (saved choice → page language → browser language → English),
   and remembers the visitor's choice for every tool. */
(function () {
  'use strict';

  var KEY = 'ct-lang';
  var LANGS = [
    ['hindi', 'हिन्दी', 'Hindi', 'Hinglish (Hindi + English)'],
    ['telugu', 'తెలుగు', 'Telugu', 'Telugu + English'],
    ['tamil', 'தமிழ்', 'Tamil', 'Tanglish (Tamil + English)'],
    ['kannada', 'ಕನ್ನಡ', 'Kannada', 'Kannada + English'],
    ['malayalam', 'മലയാളം', 'Malayalam', 'Manglish (Malayalam + English)'],
    ['marathi', 'मराठी', 'Marathi', 'Marathi + English'],
    ['bengali', 'বাংলা', 'Bengali', 'Bengali + English'],
    ['gujarati', 'ગુજરાતી', 'Gujarati', 'Gujarati + English']
  ];
  var BROWSER = { hi: 'hindi', te: 'telugu', ta: 'tamil', kn: 'kannada', ml: 'malayalam', mr: 'marathi', bn: 'bengali', gu: 'gujarati' };

  function valid(v) {
    if (v === 'english') return true;
    var m = /^([a-z]+)(-mix)?$/.exec(v || '');
    return !!(m && LANGS.some(function (l) { return l[0] === m[1]; }));
  }

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function pageDefault() {
    var lang = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
    return BROWSER[lang] ? BROWSER[lang] + '-mix' : null;
  }

  function browserDefault() {
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i] || '').slice(0, 2).toLowerCase();
      if (BROWSER[code]) return BROWSER[code] + '-mix';
    }
    return null;
  }

  function choose(select) {
    var legacy = { mix: 'telugu-mix' };
    var stored = read();
    if (valid(stored)) return stored;
    var fromHtml = select.getAttribute('data-default');
    if (fromHtml) return legacy[fromHtml] || fromHtml;
    return pageDefault() || browserDefault() || 'english';
  }

  function fill(select) {
    var html = '<option value="english">English</option>';
    LANGS.forEach(function (l) {
      html += '<optgroup label="' + l[2] + ' · ' + l[1] + '">' +
        '<option value="' + l[0] + '-mix">' + l[3] + '</option>' +
        '<option value="' + l[0] + '">' + l[1] + ' (' + l[2] + ')</option>' +
        '</optgroup>';
    });
    select.innerHTML = html;
    var v = choose(select);
    select.value = valid(v) ? v : 'english';
    if (!select.value) select.value = 'english';
    select.addEventListener('change', function () { save(select.value); });
  }

  function init() {
    var selects = document.querySelectorAll('select[data-ct-lang]');
    for (var i = 0; i < selects.length; i++) fill(selects[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.ctLang = { list: LANGS, get: function () { return read(); } };
})();
