/* Shared front-end for the AI tools that use /api/generate (Shorts Script, Video Ideas).
   The page sets data-tool on <section class="tool-card-form"> and a button label in data-label. */
(function () {
  'use strict';

  var busy = false;

  async function generate() {
    if (busy) return;
    var form = document.querySelector('.tool-card-form');
    var tool = form.getAttribute('data-tool');
    var topicEl = document.getElementById('topic');
    var langEl = document.getElementById('language');
    var secEl = document.getElementById('seconds');
    var out = document.getElementById('output');
    var btn = document.querySelector('.btn-primary-v2');
    var label = btn.getAttribute('data-label') || btn.innerText;

    var topic = (topicEl.value || '').trim();
    if (!topic) {
      out.textContent = topicEl.tagName === 'TEXTAREA' ? 'Please paste the comment first.' : 'Please type your video topic first.';
      topicEl.focus();
      return;
    }

    busy = true;
    btn.disabled = true;
    btn.innerText = '⏳ Writing... (5–15 sec)';
    out.style.whiteSpace = 'pre-wrap';
    out.textContent = 'Writing, please wait...';

    try {
      var res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool,
          topic: topic,
          language: langEl ? langEl.value : 'mix',
          seconds: secEl ? Number(secEl.value) : undefined,
          context: document.getElementById('context') ? document.getElementById('context').value : undefined,
          tone: document.getElementById('tone') ? document.getElementById('tone').value : undefined
        })
      });
      var data = {};
      try { data = await res.json(); } catch (e) {}
      if (res.ok && data.text) {
        out.textContent = data.text;
      } else {
        out.textContent = (data && data.error) ? data.error : 'Something went wrong. Please try again.';
      }
    } catch (err) {
      out.textContent = 'Could not reach the server. Check your internet connection and try again.';
    } finally {
      busy = false;
      btn.disabled = false;
      btn.innerText = label;
    }
  }

  async function copy() {
    var out = document.getElementById('output');
    var btn = document.querySelector('.btn-secondary-v2');
    var text = (out.textContent || '').trim();
    if (!text || /^(Writing|Please (type|paste))/.test(text)) { out.textContent = 'Nothing to copy yet. Generate first.'; return; }
    try {
      await navigator.clipboard.writeText(text);
      var o = btn.innerHTML; btn.innerHTML = '✅ Copied!'; setTimeout(function () { btn.innerHTML = o; }, 2000);
    } catch (e) { alert('Could not copy. Please select the text and copy it.'); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var t = document.getElementById('topic');
    if (t && t.tagName === 'INPUT') t.addEventListener('keydown', function (e) { if (e.key === 'Enter') generate(); });
  });

  window.ctAI = { generate: generate, copy: copy };
})();
