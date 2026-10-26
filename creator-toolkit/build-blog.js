// build-blog.js: blog posts ki static HTML pages + sitemap generate chestundi
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.creatortoolkits.in';
const POSTS_DIR = path.join(ROOT, 'blog', 'posts');

const posts = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, 'posts.json'), 'utf8'));
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
  });
}

function renderPage(post, bodyHtml) {
  const url = `${SITE}/blog/${post.slug}.html`;
  const pageTitle = `${post.title} — Creator Toolkit Blog`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url: url,
    keywords: post.tags.join(', '),
    image: `${SITE}/images/og-image.png`,
    author: { '@type': 'Person', name: 'Naveen Kodali', url: `${SITE}/about.html` },
    publisher: { '@type': 'Organization', name: 'Creator Toolkit', url: `${SITE}/` }
  };
  const ldJson = JSON.stringify(ld).replace(/</g, '\\u003c');
  const chips = post.tags.map(t => `<span class="tag-chip">${esc(t)}</span>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title id="page-title">${esc(pageTitle)}</title>
<meta id="page-desc" name="description" content="${esc(post.excerpt)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Creator Toolkit">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(post.excerpt)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/og-image.png">
<meta property="article:published_time" content="${post.date}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(post.excerpt)}">
<meta name="twitter:image" content="${SITE}/images/og-image.png">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog/blog.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.0/marked.min.js"></script>
<script src="/ct-nav.js" defer></script>
<script>(function(){try{document.documentElement.setAttribute('data-theme',localStorage.getItem('ct-theme')||'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
<script type="application/ld+json">${ldJson}</script>
</head>
<body>
<header class="site-bar">
  <a href="/" class="brand">Creator<span>Toolkit</span></a>
  <a href="/blog/" class="back-link">← All posts</a>
</header>
<main>
  <article id="post-root" class="post">
    <p class="eyebrow" id="post-tags">${chips}</p>
    <h1 id="post-title">${esc(post.title)}</h1>
    <p class="post-meta" id="post-meta">${fmtDate(post.date)} · ${esc(post.readTime)}</p>
    <div class="post-body" id="post-body">${bodyHtml}</div>
    <button id="like-btn" class="like-btn" aria-label="Like this post">
      <span class="like-icon">♡</span>
      <span id="like-count">0</span>
    </button>
  </article>
  <p id="not-found" class="empty-state" hidden>
    Couldn't find that post. <a href="/blog/">Back to all posts →</a>
  </p>
</main>
<footer class="site-footer ct-foot">
  <p>© 2026 Creator Toolkit</p>
  <p>
    <a href="/about.html">About</a> ·
    <a href="/blog/index.html">Blog</a> ·
    <a href="/videos/index.html">Videos</a> ·
    <a href="/contact.html">Contact</a> ·
    <a href="/privacy.html">Privacy Policy</a> ·
    <a href="/terms.html">Terms and Conditions</a>
  </p>
  <div class="ct-foot-social">
    <a href="https://www.youtube.com/@naveenkodali322" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z"/></svg>
    </a>
  </div>
</footer>
<style>
  body .site-footer.ct-foot{text-align:center;font-family:'Inter',sans-serif;font-size:14px;padding:28px 22px 40px}
  body .site-footer.ct-foot p{margin:6px 0}
  body .site-footer.ct-foot a{color:var(--mg-muted,#8B93A1)}
  body .site-footer.ct-foot a:hover{color:var(--mg-accent,#22d3ee)}
  body .site-footer.ct-foot .ct-foot-social{display:flex;justify-content:center;gap:16px;margin-top:14px}
</style>
<script src="/blog/blog.js" data-mode="post" data-slug="${esc(post.slug)}"></script>
</body>
</html>
`;
}

let built = 0;
const sitemapUrls = [{ loc: `${SITE}/blog/index.html`, lastmod: posts[0] ? posts[0].date : '' }];

for (const post of posts) {
  if (post.slug === 'index' || post.slug === 'post') {
    console.warn('Skipping reserved slug:', post.slug);
    continue;
  }
  const mdPath = path.join(POSTS_DIR, post.file);
  if (!fs.existsSync(mdPath)) {
    console.warn('Markdown file missing, skipped:', post.file);
    continue;
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const bodyHtml = marked.parse(md);
  fs.writeFileSync(path.join(ROOT, 'blog', `${post.slug}.html`), renderPage(post, bodyHtml));
  sitemapUrls.push({ loc: `${SITE}/blog/${post.slug}.html`, lastmod: post.date });
  built++;
}

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls.map(u =>
    `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`
  ).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap-blog.xml'), sitemap);

console.log(`Built ${built} blog pages + sitemap-blog.xml`);


// ---------- Blog index (blog/index.html): static cards + SEO tags ----------
{
  const indexPath = path.join(ROOT, 'blog', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const cards = posts
    .filter(p => p.slug !== 'index' && p.slug !== 'post' && fs.existsSync(path.join(POSTS_DIR, p.file)))
    .map(p => `    <a class="post-card" href="/blog/${esc(p.slug)}.html">
      <div class="tag-row">${p.tags.map(t => `<span class="tag-chip">${esc(t)}</span>`).join('')}</div>
      <h2>${esc(p.title)}</h2>
      <p>${esc(p.excerpt)}</p>
      <div class="card-meta">${fmtDate(p.date)}<span class="dot">·</span>${esc(p.readTime)}</div>
    </a>`)
    .join('\n');

  html = html.replace(
    /(<section id="feed"[^>]*>)[\s\S]*?(<\/section>)/,
    (m, open, close) => `${open}\n${cards}\n${close}`
  );

  if (!html.includes('rel="canonical"')) {
    const url = `${SITE}/blog/index.html`;
    const seo = `
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Creator Toolkit">
<meta property="og:title" content="Blog — Creator Toolkit">
<meta property="og:description" content="Tips on YouTube growth, Canva Creator Program earnings, and AI tools for content creators.">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/og-image.png">
<meta name="twitter:card" content="summary_large_image">`;
    html = html.replace(/(<meta name="description"[^>]*>)/, `$1${seo}`);
  }

  fs.writeFileSync(indexPath, html);
  console.log('Blog index refreshed with ' + posts.length + ' posts');
}
