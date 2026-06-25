export default async function handler(req, res) {
  const { videoId } = req.query;
  
  if (!videoId) {
    return res.status(400).json({ error: "videoId required" });
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const response = await fetch(thumbnailUrl);
    
    if (!response.ok) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const buffer = await response.arrayBuffer();
    
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", `attachment; filename="thumbnail_${videoId}.jpg"`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    return res.send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
