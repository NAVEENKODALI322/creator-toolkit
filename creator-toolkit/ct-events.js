/* Creator Toolkit — usage events for Google Analytics 4 + "next tool" link.
   Events sent: generate_click, generate_success, copy_click, next_tool_click
   (mark them as Key events in GA4 > Admin > Events if you want them as conversions). */
(function () {
  'use strict';
  var TOOLS = {
    'title-generator': { name: 'Title Generator', next: ['tags-generator.html', 'Tags Generator', 'Next step: get tags for this video'] },
    'tags-generator': { name: 'Tags Generator', next: ['hashtag-generator.html', 'Hashtag Generator', 'Next step: add hashtags'] },
    'hashtag-generator': { name: 'Hashtag Generator', next: ['description-generator.html', 'Description Generator', 'Next step: write the description'] },
    'description-generator': { name: 'Description Generator', next: ['viral-hook-generator.html', 'Viral Hook Generator', 'Next step: write a stronger hook'] },
    'viral-hook-generator': { name: 'Viral Hook Generator', next: ['title-generator.html', 'Title Generator', 'Next step: pick the title'] },
    'thumbnail-downloader': { name: 'Thumbnail Downloader', next: null }
  };
  var key = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var tool = TOOLS[key];
  if (!tool) return;

  function send(name, extra) {
    try {
      if (typeof window.gtag === 'function') {
        var p = { tool_name: tool.name, page_path: location.pathname };
        for (var k in (extra || {})) p[k] = extra[k];
        window.gtag('event', name, p);
      }
    } catch (e) { /* analytics must never break the tool */ }
  }

  var awaiting = false;
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('.btn-primary-v2, .btn-secondary-v2, .ct-next-link') : null;
    if (!t) return;
    if (t.classList.contains('ct-next-link')) { send('next_tool_click', { destination: t.getAttribute('href') }); return; }
    if (t.classList.contains('btn-primary-v2')) { awaiting = true; send('generate_click'); return; }
    send('copy_click');
  }, true);

  function init() {
    var out = document.querySelector('.output-v2');
    if (!out) return;
    var copyBtn = document.querySelector('.btn-secondary-v2');
    var box = null;
    if (tool.next && copyBtn) {
      box = document.createElement('div');
      box.className = 'ct-next';
      box.style.cssText = 'display:none;margin-top:14px;padding:14px 16px;border-radius:14px;border:1px solid rgba(108,99,255,.35);background:rgba(108,99,255,.08);font-size:14px;line-height:1.5;';
      var a = document.createElement('a');
      a.className = 'ct-next-link';
      a.href = tool.next[0];
      a.textContent = tool.next[2] + ' → ' + tool.next[1];
      a.style.cssText = 'color:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;';
      box.appendChild(a);
      copyBtn.parentNode.insertBefore(box, copyBtn.nextSibling);
    }
    function check() {
      var txt = (out.textContent || '').trim();
      var ready = txt.length > 30 && !/generating|please wait|loading/i.test(txt.slice(0, 60));
      if (box) box.style.display = ready ? 'block' : 'none';
      if (ready && awaiting) { awaiting = false; send('generate_success', { output_length: txt.length }); }
    }
    new MutationObserver(check).observe(out, { childList: true, characterData: true, subtree: true });
    check();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
