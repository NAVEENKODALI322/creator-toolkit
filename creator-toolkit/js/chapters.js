/* YouTube Chapters & Timestamps Formatter — runs fully in the browser, nothing is sent anywhere. */
(function () {
  'use strict';

  var TIME_RE = /(?:^|[\s\[(])((?:\d{1,2}:)?\d{1,2}:\d{2})(?=$|[\s\])\-–—:|.,])/;

  function toSeconds(t) {
    var p = t.split(':').map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  }

  function fmt(sec, useHours) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var ss = (s < 10 ? '0' : '') + s;
    if (useHours) return h + ':' + (m < 10 ? '0' : '') + m + ':' + ss;
    return m + ':' + ss;
  }

  function parseLength(v) {
    v = String(v || '').trim();
    if (!v) return null;
    if (/^\d+$/.test(v)) return Number(v) * 60; // plain minutes
    if (/^(?:\d{1,2}:)?\d{1,2}:\d{2}$/.test(v)) return toSeconds(v);
    return NaN;
  }

  function parse(text) {
    var rows = [], skipped = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var raw = line.trim();
      if (!raw) return;
      var m = raw.match(TIME_RE);
      if (!m) { skipped.push(raw); return; }
      var sec = toSeconds(m[1]);
      var title = (raw.slice(0, m.index) + ' ' + raw.slice(m.index + m[0].length))
        .replace(/^[\s\-–—:|.,\])]+|[\s\-–—:|.,\[(]+$/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      rows.push({ sec: sec, title: title, line: raw });
    });
    return { rows: rows, skipped: skipped };
  }

  function check(rows, lengthSec) {
    var issues = [], fixes = [];
    if (!rows.length) return { issues: ['No timestamps found. Write one chapter per line, like "0:00 Intro".'], fixes: fixes, rows: rows };

    var sorted = rows.slice().sort(function (a, b) { return a.sec - b.sec; });
    var outOfOrder = rows.some(function (r, i) { return r.sec !== sorted[i].sec; });
    if (outOfOrder) fixes.push('Timestamps were out of order, so they have been sorted.');
    rows = sorted;

    var seen = {}, deduped = [];
    rows.forEach(function (r) {
      if (seen[r.sec]) { fixes.push('Removed a duplicate timestamp at ' + fmt(r.sec, false) + '.'); return; }
      seen[r.sec] = 1; deduped.push(r);
    });
    rows = deduped;

    if (rows[0].sec !== 0) {
      rows.unshift({ sec: 0, title: 'Intro', added: true });
      fixes.push('YouTube needs the first chapter at 0:00, so an "Intro" chapter was added. Rename it if you like.');
    }

    rows.forEach(function (r, i) {
      if (!r.title) { r.title = 'Chapter ' + (i + 1); issues.push('The chapter at ' + fmt(r.sec, false) + ' has no name. Give it a short, clear title.'); }
      if (r.title.length > 60) issues.push('"' + r.title.slice(0, 40) + '…" is long. Short chapter names read better on the progress bar.');
    });

    if (rows.length < 3) issues.push('YouTube needs at least 3 chapters. You have ' + rows.length + '.');

    for (var i = 1; i < rows.length; i++) {
      var gap = rows[i].sec - rows[i - 1].sec;
      if (gap < 10) issues.push('"' + rows[i - 1].title + '" is only ' + gap + ' seconds long. Each chapter must be at least 10 seconds.');
    }

    if (lengthSec !== null && !isNaN(lengthSec)) {
      var last = rows[rows.length - 1];
      if (last.sec >= lengthSec) issues.push('The last timestamp (' + fmt(last.sec, false) + ') is at or after the end of the video.');
      else if (lengthSec - last.sec < 10) issues.push('The last chapter "' + last.title + '" is shorter than 10 seconds before the video ends.');
    }
    return { issues: issues, fixes: fixes, rows: rows };
  }

  function run() {
    var input = document.getElementById('chaptersInput');
    var lenEl = document.getElementById('videoLength');
    var out = document.getElementById('output');
    var report = document.getElementById('report');
    var lengthSec = parseLength(lenEl && lenEl.value);

    var parsed = parse(input.value);
    var res = check(parsed.rows, lengthSec);
    var useHours = res.rows.some(function (r) { return r.sec >= 3600; }) || (lengthSec && lengthSec >= 3600);
    out.textContent = res.rows.map(function (r) { return fmt(r.sec, useHours) + ' ' + r.title; }).join('\n');

    var html = '';
    if (lengthSec !== null && isNaN(lengthSec)) html += '<p class="ck-warn">⚠️ Video length should be like 12:30 or just minutes, like 12. It was ignored.</p>';
    if (!res.issues.length && res.rows.length) html += '<p class="ck-ok">✅ These chapters meet YouTube\'s rules. Paste them into your video description.</p>';
    res.issues.forEach(function (t) { html += '<p class="ck-warn">⚠️ ' + esc(t) + '</p>'; });
    res.fixes.forEach(function (t) { html += '<p class="ck-info">🔧 ' + esc(t) + '</p>'; });
    if (parsed.skipped.length) html += '<p class="ck-info">ℹ️ Skipped ' + parsed.skipped.length + ' line(s) with no timestamp.</p>';
    report.innerHTML = html;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function copy(btn) {
    var out = document.getElementById('output');
    if (!out.textContent.trim()) { run(); }
    if (!out.textContent.trim()) return;
    navigator.clipboard.writeText(out.textContent).then(function () {
      var o = btn.innerHTML; btn.innerHTML = '✅ Copied!'; setTimeout(function () { btn.innerHTML = o; }, 2000);
    }, function () { alert('Could not copy. Please select the text and copy it.'); });
  }

  function sample() {
    document.getElementById('chaptersInput').value =
      '0:00 Intro\n0:45 Canva account create cheyadam\n2:10 Template select cheyadam\n4:30 Text and photo add cheyadam\n7:05 Download and upload';
    document.getElementById('videoLength').value = '8:20';
    run();
  }

  window.ctChapters = { run: run, copy: copy, sample: sample, _parse: parse, _check: check };
})();
