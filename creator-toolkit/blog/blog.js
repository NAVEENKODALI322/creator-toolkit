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

  fetch('/blog/posts/posts.json')
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
    const featuredSlot = document.getElementById('featured-slot');
    const topicsBar = document.getElementById('topics');
    const empty = document.getElementById('empty-state');

    if (!posts.length) {
      empty.hidden = false;
      return;
    }

    const [featured, ...rest] = posts;

    // Featured post
    if (featuredSlot) {
      featuredSlot.innerHTML = `
        <a class="featured-card" href="/blog/post.html?slug=${encodeURIComponent(featured.slug)}">
          <p class="featured-label">Latest</p>
          <h2>${featured.title}</h2>
          <p>${featured.excerpt}</p>
          <div class="tag-row">${tagChips(featured.tags)}</div>
          <div class="card-meta">${formatDate(featured.date)}<span class="dot">·</span>${featured.readTime}</div>
        </a>
      `;
    }

    // Topic pills — computed from every post's tags
    const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));
    if (topicsBar) {
      topicsBar.innerHTML = [
        `<button class="topic-pill active" data-topic="all">All topics</button>`,
        ...allTags.map(t => `<button class="topic-pill" data-topic="${t}">${t}</button>`)
      ].join('');

      topicsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.topic-pill');
        if (!btn) return;
        topicsBar.querySelectorAll('.topic-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.topic);
      });
    }

    function renderGrid(list) {
      if (!list.length) {
        feed.innerHTML = '';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      feed.innerHTML = list.map(p => `
        <a class="post-card" href="/blog/post.html?slug=${encodeURIComponent(p.slug)}">
          <div class="tag-row">${tagChips(p.tags)}</div>
          <h2>${p.title}</h2>
          <p>${p.excerpt}</p>
          <div class="card-meta">${formatDate(p.date)}<span class="dot">·</span>${p.readTime}</div>
        </a>
      `).join('');
    }

    function applyFilter(topic) {
      if (topic === 'all') {
        featuredSlot.hidden = false;
        renderGrid(rest);
        return;
      }
      const matchesFeatured = featured.tags.includes(topic);
      featuredSlot.hidden = !matchesFeatured;
      renderGrid(posts.filter(p => p !== featured && p.tags.includes(topic)));
    }

    renderGrid(rest);
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

    fetch('/blog/posts/' + post.file)
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
