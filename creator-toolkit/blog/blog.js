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
        <a class="featured-card" href="/blog/${encodeURIComponent(featured.slug)}.html">
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
           <a class="post-card" href="/blog/${encodeURIComponent(p.slug)}.html">
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
       const staticSlug = scriptTag && scriptTag.dataset.slug;
    const slug = staticSlug || params.get('slug');
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
    
    // ---------- Previous / Next post ----------
    (function () {
      const i = posts.findIndex(p => p.slug === post.slug);
      if (i === -1 || posts.length < 2) return;
      const next = posts[(i + 1) % posts.length];
      const prev = posts[(i - 1 + posts.length) % posts.length];

      const card = (p, label, cls) =>
        `<a class="pn-card ${cls}" href="/blog/post.html?slug=${encodeURIComponent(p.slug)}">` +
        `<span class="pn-label">${label}</span>` +
        `<span class="pn-title">${p.title}</span>` +
        `<span class="pn-meta">${p.readTime}</span></a>`;

      const st = document.createElement('style');
      st.textContent =
        '.post-nav{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:36px 0 10px}' +
        '.pn-card{display:flex;flex-direction:column;gap:6px;padding:18px 20px;border-radius:16px;' +
          'background:var(--mg-card,#161B22);border:1px solid var(--mg-line,rgba(255,255,255,.09));' +
          'text-decoration:none;transition:border-color .2s,transform .2s}' +
        '.pn-card:hover{border-color:var(--mg-accent,#22d3ee);transform:translateY(-2px)}' +
        '.pn-next{text-align:right}' +
        '.pn-label{font-family:var(--mg-mono,monospace);font-size:.72rem;letter-spacing:.08em;' +
          'text-transform:uppercase;color:var(--mg-accent,#22d3ee)}' +
        '.pn-title{font-family:var(--mg-head,sans-serif);font-weight:600;font-size:1rem;line-height:1.35;' +
          'color:var(--mg-ink,#f4f2ec)}' +
        '.pn-meta{font-size:.78rem;color:var(--mg-muted,#8B93A1)}' +
        '@media(max-width:640px){.post-nav{grid-template-columns:1fr}.pn-next{text-align:left}}';
      document.head.appendChild(st);

      const wrap = document.createElement('nav');
      wrap.className = 'post-nav';
      wrap.setAttribute('aria-label', 'More posts');
      wrap.innerHTML = card(prev, '← Previous post', 'pn-prev') + card(next, 'Next post →', 'pn-next');

      const anchor = document.getElementById('like-btn') || document.getElementById('post-body');
      anchor.insertAdjacentElement('afterend', wrap);
    })();
  }

  // ---------- Like button (no login — CountAPI + localStorage flag) ----------
  const LIKE_API = 'https://countapi.mileshilliard.com/api/v1';

  function setupLikeButton(slug) {
    const btn = document.getElementById('like-btn');
    if (!btn) return;

    const countEl = document.getElementById('like-count');
    const iconEl = btn.querySelector('.like-icon');
    const storageKey = 'liked-' + slug;
    const counterKey = 'creatortoolkit-blog-' + slug + '-likes';

    function setLikedUI(isLiked) {
      btn.classList.toggle('liked', isLiked);
      iconEl.textContent = isLiked ? '♥' : '♡';
    }

    // Load current count without incrementing (404 just means nobody has liked it yet)
    fetch(`${LIKE_API}/get/${counterKey}`)
      .then(res => res.ok ? res.json() : { value: 0 })
      .then(data => { countEl.textContent = data.value || 0; })
      .catch(err => console.error('Like count load failed:', err));

    setLikedUI(localStorage.getItem(storageKey) === '1');

    btn.addEventListener('click', () => {
      const alreadyLiked = localStorage.getItem(storageKey) === '1';
      btn.disabled = true;

      if (!alreadyLiked) {
        // Like: increment by 1
        fetch(`${LIKE_API}/hit/${counterKey}`)
          .then(res => res.json())
          .then(data => {
            countEl.textContent = data.value;
            localStorage.setItem(storageKey, '1');
            setLikedUI(true);
          })
          .catch(err => console.error('Like action failed:', err))
          .finally(() => { btn.disabled = false; });
      } else {
        // Unlike: read current value, then set it one lower
        fetch(`${LIKE_API}/get/${counterKey}`)
          .then(res => res.json())
          .then(data => {
            const newValue = Math.max(0, (parseInt(data.value, 10) || 0) - 1);
            return fetch(`${LIKE_API}/set/${counterKey}?value=${newValue}`);
          })
          .then(res => res.json())
          .then(data => {
            countEl.textContent = data.value;
            localStorage.setItem(storageKey, '0');
            setLikedUI(false);
          })
          .catch(err => console.error('Unlike action failed:', err))
          .finally(() => { btn.disabled = false; });
      }
    });
  }
})();
