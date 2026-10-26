// Vercel serverless route: /api/thumbnail-refs?q=topic
// Needs env var YOUTUBE_API_KEY (YouTube Data API v3).
export default async function handler(req, res) {
  var q = String((req.query && req.query.q) || '').trim().slice(0, 150);
  if (!q) return res.status(400).json({ error: 'Topic is required' });
  var key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(500).json({ error: 'YOUTUBE_API_KEY is not set' });
  try {
    var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&regionCode=IN&relevanceLanguage=te&order=relevance&q=' +
      encodeURIComponent(q) + '&key=' + encodeURIComponent(key);
    var r = await fetch(url);
    var j = await r.json();
    if (!r.ok) return res.status(502).json({ error: (j.error && j.error.message) || 'YouTube API error' });
    var items = (j.items || []).filter(function (v) { return v.id && v.id.videoId; }).map(function (v) {
      return { id: v.id.videoId, title: v.snippet.title, thumb: 'https://i.ytimg.com/vi/' + v.id.videoId + '/mqdefault.jpg' };
    });
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ items: items });
  } catch (e) {
    return res.status(500).json({ error: 'Could not load references' });
  }
}
