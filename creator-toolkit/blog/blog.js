(function () {
  const scriptTag = document.currentScript;
  const mode = scriptTag && scriptTag.dataset.mode === 'post' ? 'post' : 'feed';

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function tagChips(tags) {
    return tags.map(t => `<span class="tag-chip">${t}</span>`).join('');
  }

  fetch('posts/posts.json')
    .then(res => res.json())
    .then(posts => {
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (mode === 'feed') {
        renderFeed(posts);
      } else {
        renderPost(posts);
      }
    })
    .catch(err => {
      console.error('Could not load posts:', err);
      const empty = document.getElementById('empty-state') || document.getElementById('not-found');
      if (empty) empty.hidden = false;
    });

  function renderFeed(posts) {
    const feed = document.getElementById('feed');
    const empty = document.getElementById('empty-state');
    if (!posts.length) {
      empty.hidden = false;
      return;
    }
    feed.innerHTML = posts.map(p => `
      <a class="post-card" href="post.html?slug=${encodeURIComponent(p.slug)}">
        <div class="tag-row">${tagChips(p.tags)}</div>
        <h2>${p.title}</h2>
        <p>${p.excerpt}</p>
        <div class="card-meta">${formatDate(p.date)}<span class="dot">·</span>${p.readTime}</div>
      </a>
    `).join('');
  }

  function renderPost(posts) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const post = posts.find(p => p.slug === slug);
    const root = document.getElementById('post-root');
    const notFound = document.getElementById('not-found');

    if (!post) {
      root.hidden = true;
      notFound.hidden = false;
      return;
    }

    document.getElementById('page-title').textContent = post.title + ' — Creator Toolkit Blog';
    document.getElementById('page-desc').setAttribute('content', post.excerpt);
    document.getElementById('post-tags').innerHTML = tagChips(post.tags);
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-meta').textContent = `${formatDate(post.date)} · ${post.readTime}`;

    fetch('posts/' + post.file)
      .then(res => res.text())
      .then(md => {
        document.getElementById('post-body').innerHTML = window.marked.parse(md);
      })
      .catch(err => {
        console.error('Could not load post body:', err);
        document.getElementById('post-body').textContent = 'Could not load this post right now.';
      });
  }
})();
