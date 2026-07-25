(function () {
  const scriptTag = document.currentScript;
  const mode = scriptTag && scriptTag.dataset.mode === 'post' ? 'post' : 'feed';

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function timeAgo(iso) {
    const then = new Date(iso);
    const now = new Date();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay < 0) return formatDate(iso); // future-dated post, just show the date
    if (diffDay === 0) {
      if (diffHour < 1) return 'Posted just now';
      if (diffHour === 1) return 'Posted 1 hour ago';
      if (diffHour < 24) return `Posted ${diffHour} hours ago`;
    }
    if (diffDay === 1) return 'Posted 1 day ago';
    if (diffDay < 7) return `Posted ${diffDay} days ago`;

    const diffWeek = Math.floor(diffDay / 7);
    if (diffDay < 14) return 'Posted 1 week ago';
    if (diffDay < 30) return `Posted ${diffWeek} weeks ago`;

    const diffMonth = Math.floor(diffDay / 30);
    if (diffDay < 60) return 'Posted 1 month ago';
    if (diffDay < 365) return `Posted ${diffMonth} months ago`;

    // Older than a year — show the actual date instead of a big number
    return `Posted ${formatDate(iso)}`;
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
          <div class="card-meta">${timeAgo(featured.date)}<span class="dot">·</span>${featured.readTime}</div>
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
          <div class="card-meta">${timeAgo(p.date)}<span class="dot">·</span>${p.readTime}</div>
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
    document.getElementById('post-meta').textContent = `${timeAgo(post.date)} · ${post.readTime}`;

    fetch('/blog/posts/' + post.file)
      .then(res => res.text())
      .then(md => {
        document.getElementById('post-body').innerHTML = window.marked.parse(md);
      })
      .catch(err => {
        console.error('Could not load post body:', err);
        document.getElementById('post-body').textContent = 'Could not load this post right now.';
      });

    setupLikeButton(post.slug);
  }

  // ---------- Like button (no login — CounterAPI + localStorage flag) ----------
  function setupLikeButton(slug) {
    const btn = document.getElementById('like-btn');
    if (!btn || typeof Counter === 'undefined') return;

    const counter = new Counter({ workspace: 'creator-toolkit-blog' });
    const countEl = document.getElementById('like-count');
    const iconEl = btn.querySelector('.like-icon');
    const storageKey = 'liked-' + slug;

    function setLikedUI(isLiked) {
      btn.classList.toggle('liked', isLiked);
      iconEl.textContent = isLiked ? '♥' : '♡';
    }

    // Load current count without incrementing
    counter.get(slug)
      .then(res => { countEl.textContent = res.value || 0; })
      .catch(err => console.error('Like count load failed:', err));

    setLikedUI(localStorage.getItem(storageKey) === '1');

    btn.addEventListener('click', () => {
      const alreadyLiked = localStorage.getItem(storageKey) === '1';
      btn.disabled = true;

      const action = alreadyLiked ? counter.down(slug) : counter.up(slug);
      action
        .then(res => {
          countEl.textContent = res.value || 0;
          localStorage.setItem(storageKey, alreadyLiked ? '0' : '1');
          setLikedUI(!alreadyLiked);
        })
        .catch(err => console.error('Like action failed:', err))
        .finally(() => { btn.disabled = false; });
    });
  }
})();
