/* YouTube Title & Description Checker — runs fully in the browser, nothing is sent anywhere. */
(function () {
  'use strict';

  var TITLE_LIMIT = 100;      // YouTube's hard limit for titles
  var TITLE_VISIBLE = 60;     // roughly what stays visible in search and suggested on phones
  var DESC_LIMIT = 5000;      // YouTube's hard limit for descriptions
  var DESC_PREVIEW = 120;     // roughly what shows before "...more"
  var HASHTAG_LIMIT = 15;     // above this YouTube ignores all hashtags on the video

  function chars(s) { return Array.from(s || '').length; }
  function graphemes(s) {
    try { return Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(s || '')).length; }
    catch (e) { return chars(s); }
  }
  function cutVisible(s, n) {
    try {
      var g = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(s), function (x) { return x.segment; });
      return g.length > n ? g.slice(0, n).join('').trimEnd() + '…' : s;
    } catch (e) { var a = Array.from(s); return a.length > n ? a.slice(0, n).join('') + '…' : s; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // True when every word of the keyword appears in the text (any order), e.g. "canva thumbnail" in "Canva లో Thumbnail".
  function hasAll(text, keyword) {
    var t = text.toLowerCase();
    return keyword.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return t.indexOf(w) !== -1; });
  }
  function line(cls, icon, text) { return '<p class="' + cls + '">' + icon + ' ' + text + '</p>'; }

  function checkTitle(title, keyword) {
    var out = [];
    var t = title.trim();
    if (!t) return out;
    var c = chars(t), g = graphemes(t);
    var hasTelugu = /[ఀ-౿]/.test(t);

    if (c > TITLE_LIMIT) out.push(line('ck-warn', '⛔', 'Too long: ' + c + ' characters. YouTube allows ' + TITLE_LIMIT + '.'));
    else if (g > TITLE_VISIBLE) out.push(line('ck-warn', '⚠️', 'About ' + g + ' letters. On phones only the first ~' + TITLE_VISIBLE + ' usually show, so put the main idea first.'));
    else out.push(line('ck-ok', '✅', 'Length is good: about ' + g + ' letters, so the full title should show on phones.'));

    if (hasTelugu && c !== g) out.push(line('ck-info', 'ℹ️', 'Telugu vowel signs are separate characters in Unicode, so the 100-character limit can fill faster than it looks: ' + g + ' letters you see = ' + c + ' characters.'));

    var caps = (t.match(/\b[A-Z]{4,}\b/g) || []).filter(function (w) { return !/^(HTML|HDMI|USB|ASMR|UPSC|TSPSC|APPSC)$/.test(w); });
    if (caps.length >= 3) out.push(line('ck-warn', '⚠️', 'Many words in ALL CAPS (' + esc(caps.slice(0, 3).join(', ')) + '). It can look like shouting. Keep caps for one key word.'));

    if (/[!?]{2,}/.test(t)) out.push(line('ck-warn', '⚠️', 'Repeated "!!" or "??" looks spammy. One mark is enough.'));

    var emoji = (t.match(/\p{Extended_Pictographic}/gu) || []).length;
    if (emoji > 2) out.push(line('ck-warn', '⚠️', emoji + ' emojis. One or two at most keeps the title readable.'));

    if ((t.match(/#\w+/g) || []).length) out.push(line('ck-info', 'ℹ️', 'Hashtags in the title push words out of view. Hashtags usually work better in the description.'));

    if (/\b(guaranteed?|100% working|you won'?t believe|shocking)\b/i.test(t)) out.push(line('ck-warn', '⚠️', 'Words like "guaranteed" or "shocking" overpromise. If the video does not deliver, viewers leave early and that hurts reach.'));

    var k = (keyword || '').trim().toLowerCase();
    if (k) {
      var words = t.toLowerCase().split(/\s+/);
      if (!hasAll(t, k)) out.push(line('ck-warn', '⚠️', 'Your keyword "' + esc(keyword.trim()) + '" is not in the title. Add it so search can match the video.'));
      else if (words.slice(0, 5).join(' ').indexOf(k.split(/\s+/)[0]) === -1) out.push(line('ck-info', 'ℹ️', 'Keyword found, but not in the first few words. Moving it earlier helps on small screens.'));
      else out.push(line('ck-ok', '✅', 'Keyword appears early in the title.'));
    }
    return out;
  }

  function checkDesc(desc, keyword) {
    var out = [];
    var d = desc.trim();
    if (!d) return out;
    var c = chars(d);
    if (c > DESC_LIMIT) out.push(line('ck-warn', '⛔', 'Too long: ' + c + ' characters. YouTube allows ' + DESC_LIMIT + '.'));
    else out.push(line('ck-ok', '✅', c + ' of ' + DESC_LIMIT + ' characters used.'));

    var words = d.split(/\s+/).filter(Boolean).length;
    if (words < 40) out.push(line('ck-info', 'ℹ️', 'Only ' + words + ' words. 2–3 short paragraphs about what the video covers help search understand it.'));

    var tags = d.match(/(^|\s)#[\p{L}\p{N}_]+/gu) || [];
    if (tags.length > HASHTAG_LIMIT) out.push(line('ck-warn', '⛔', tags.length + ' hashtags. With more than ' + HASHTAG_LIMIT + ', YouTube ignores all of them on this video. Keep 3–5.'));
    else if (tags.length > 5) out.push(line('ck-info', 'ℹ️', tags.length + ' hashtags. The first 3 can show above the title, so put the best ones first.'));
    else if (tags.length) out.push(line('ck-ok', '✅', tags.length + ' hashtag(s), a sensible number.'));

    var links = (d.match(/https?:\/\/\S+/g) || []).length;
    if (links > 8) out.push(line('ck-info', 'ℹ️', links + ' links. Lots of links can look like spam. Keep the ones viewers need.'));

    if (/(^|\n)\s*(0:00|00:00)\b/.test(d)) out.push(line('ck-ok', '✅', 'Chapters found (a 0:00 timestamp). Check them with the Chapters tool.'));

    var firstPart = cutVisible(d.replace(/\s+/g, ' '), DESC_PREVIEW);
    var k = (keyword || '').trim().toLowerCase();
    if (k) {
      if (hasAll(firstPart, k)) out.push(line('ck-ok', '✅', 'Keyword is in the opening lines that show before "...more".'));
      else if (hasAll(d, k)) out.push(line('ck-info', 'ℹ️', 'Keyword is in the description, but not in the first lines. Move it into the first sentence.'));
      else out.push(line('ck-warn', '⚠️', 'Keyword "' + esc(keyword.trim()) + '" does not appear in the description.'));
    }
    return out;
  }

  function run() {
    var title = document.getElementById('titleInput').value;
    var desc = document.getElementById('descInput').value;
    var keyword = document.getElementById('keywordInput').value;
    var tChars = document.getElementById('titleCount');
    var dChars = document.getElementById('descCount');
    tChars.textContent = chars(title.trim()) + ' / ' + TITLE_LIMIT;
    dChars.textContent = chars(desc.trim()) + ' / ' + DESC_LIMIT;
    tChars.classList.toggle('over', chars(title.trim()) > TITLE_LIMIT);
    dChars.classList.toggle('over', chars(desc.trim()) > DESC_LIMIT);

    var prevTitle = document.getElementById('prevTitle');
    var prevDesc = document.getElementById('prevDesc');
    prevTitle.textContent = title.trim() ? cutVisible(title.trim(), TITLE_VISIBLE) : 'Your title will appear here';
    prevDesc.textContent = desc.trim() ? cutVisible(desc.trim().replace(/\s+/g, ' '), DESC_PREVIEW) : 'The first line of your description will appear here';

    var report = checkTitle(title, keyword).concat(checkDesc(desc, keyword));
    document.getElementById('report').innerHTML = report.length ? report.join('') : '<p class="ck-info">ℹ️ Type or paste a title and description to see the checks.</p>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['titleInput', 'descInput', 'keywordInput'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', run);
    });
    if (document.getElementById('titleInput')) run();
  });

  window.ctChecker = { run: run, _checkTitle: checkTitle, _checkDesc: checkDesc };
})();
