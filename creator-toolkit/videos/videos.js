(function () {
  let allVideos = [];
  let activeChannel = 'all';

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function thumbUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  function channelLabel(channel) {
    return channel === 'kodali-type' ? 'Kodali Type' : 'Sheela Smart Vantalu';
  }

  function render() {
    const grid = document.getElementById('grid');
    const empty = document.getElementById('empty-state');
    const list = activeChannel === 'all'
      ? allVideos
      : allVideos.filter(v => v.channel === activeChannel);

    if (!list.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    grid.innerHTML = list.map(v => `
      <a class="video-card" href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" rel="noopener">
        <div class="thumb-wrap">
          <img src="${thumbUrl(v.videoId)}" alt="${v.title}" loading="lazy">
          <div class="play-badge">
            <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="video-info">
          <span class="channel-tag">--${v.channel}</span>
          <h3>${v.title}</h3>
          <div class="video-date">${formatDate(v.date)}</div>
        </div>
      </a>
    `).join('');
  }

  document.getElementById('filter-row').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    activeChannel = btn.dataset.channel;
    render();
  });

  fetch('videos.json')
    .then(res => res.json())
    .then(data => {
      allVideos = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      render();
    })
    .catch(err => {
      console.error('Could not load videos:', err);
      document.getElementById('empty-state').hidden = false;
    });
})();
