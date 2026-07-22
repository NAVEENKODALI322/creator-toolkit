(function () {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty-state');

  // If the grid or empty-state elements don't exist on this page, stop here safely
  if (!grid) return;

  function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M views';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K views';
    return n + ' views';
  }

  grid.innerHTML = '<p class="empty-state">Loading top videos…</p>';

  fetch('/api/videos')
    .then((res) => res.json())
    .then((data) => {
      if (!data.videos || !data.videos.length) {
        grid.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
      }

      if (empty) empty.hidden = true;
      grid.innerHTML = data.videos
        .map(
          (v, i) => `
        <a class="video-card" href="${v.url}" target="_blank" rel="noopener">
          <div class="thumb-wrap">
            <span class="rank">#${i + 1}</span>
            <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
          </div>
          <div class="video-info">
            <h2>${v.title}</h2>
            <div class="video-meta">
              <span class="views">${formatViews(v.views)}</span>
            </div>
          </div>
        </a>
      `
        )
        .join('');
    })
    .catch((err) => {
      console.error('Could not load videos:', err);
      grid.innerHTML = '';
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Couldn't load videos right now. Please try again later.";
      }
    });
})();
