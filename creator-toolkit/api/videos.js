export default async function handler(req, res) {
  // Allow requests from the Android/iOS app and browser
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed. Use GET." });
  }

  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.error("YOUTUBE_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: API key not set." });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    const HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || "naveenkodali322";

    // Only videos whose title/description matches one of these count as "related"
    const KEYWORDS = [
      "canva",
      "freepik",
      "earn money",
      "earning",
      "income",
      "passive income",
      "money",
      "sampadana",
    ];

    // Cache at the edge for an hour — keeps YouTube API quota usage low
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

    // 1) Resolve the channel's uploads playlist ID from the handle
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(
        HANDLE
      )}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();
    if (!channelRes.ok || !channelData.items || !channelData.items.length) {
      console.error("Channel lookup failed:", channelData);
      return res.status(500).json({ error: "Could not resolve YouTube channel." });
    }
    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2) Walk the uploads playlist to collect video IDs (cap at 150 videos / 3 pages)
    let videoIds = [];
    let pageToken = "";
    for (let page = 0; page < 3; page++) {
      const playlistRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}${
          pageToken ? `&pageToken=${pageToken}` : ""
        }&key=${API_KEY}`
      );
      const playlistData = await playlistRes.json();
      if (!playlistRes.ok) {
        console.error("Playlist fetch failed:", playlistData);
        break;
      }
      videoIds.push(
        ...playlistData.items.map((item) => item.contentDetails.videoId)
      );
      if (!playlistData.nextPageToken) break;
      pageToken = playlistData.nextPageToken;
    }

    if (!videoIds.length) {
      return res.status(200).json({ videos: [] });
    }

    // 3) Fetch stats + snippet for every video, 50 IDs at a time
    let allVideos = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${chunk.join(
          ","
        )}&key=${API_KEY}`
      );
      const videosData = await videosRes.json();
      if (!videosRes.ok) {
        console.error("Videos fetch failed:", videosData);
        continue;
      }
      allVideos.push(...videosData.items);
    }

    // 4) Keep only videos whose title/description matches the topic keywords
    const filtered = allVideos.filter((v) => {
      const haystack = `${v.snippet.title} ${v.snippet.description}`.toLowerCase();
      return KEYWORDS.some((kw) => haystack.includes(kw));
    });

    // 5) Sort by view count, take the top 10
    const top10 = filtered
      .sort((a, b) => Number(b.statistics.viewCount) - Number(a.statistics.viewCount))
      .slice(0, 10)
      .map((v) => ({
        id: v.id,
        title: v.snippet.title,
        thumbnail:
          v.snippet.thumbnails.high?.url ||
          v.snippet.thumbnails.medium?.url ||
          v.snippet.thumbnails.default.url,
        views: Number(v.statistics.viewCount),
        publishedAt: v.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${v.id}`,
      }));

    return res.status(200).json({ videos: top10 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
