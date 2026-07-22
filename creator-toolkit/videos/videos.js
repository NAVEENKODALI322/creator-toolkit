(function () {
  const grid = document.getElementById('video-grid');
  const loading = document.getElementById('loading-state');
  const empty = document.getElementById('empty-state');
  const error = document.getElementById('error-state');

  if (!grid) return;

  function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M views';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K views';
    return n + ' views';
  }

  if (loading) loading.hidden = false;

  fetch('/api/videos')
    .then((res) => res.json())
    .then((data) => {
      if (loading) loading.hidden = true;

      if (!data.videos || !data.videos.length) {
        if (empty) empty.hidden = false;
        return;
      }

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
      if (loading) loading.hidden = true;
      if (error) error.hidden = false;
    });
})();
