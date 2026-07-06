export default async function handler(req, res) {
  // Allow requests from the Android/iOS app and browser
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }
  try {
    const { topic } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: API key not set." });
    }
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a YouTube SEO expert who creates high-value, non-repetitive video tags that match real search queries."
            },
            {
              role: "user",
              content: `Generate 18 highly searched YouTube tags for the topic "${topic}".

STRICT RULES:
- Do NOT build tags by combining the same base phrase with different languages (e.g. "in Hindi", "in Telugu", "in Tamil") — pick at most ONE language variant only if clearly relevant.
- Do NOT build tags by combining the same base phrase with different festivals/occasions (e.g. "for Diwali", "for Holi", "for Navratri") — pick at most ONE if relevant, otherwise skip.
- Do NOT repeat the same root phrase with minor word swaps (e.g. "X recipe with milk powder", "X recipe with paneer", "X recipe with curd" all together counts as repetition — pick at most ONE such variant).
- Every tag must represent a genuinely different search angle, not a template filled with a different word.
- Mix short broad tags (2-3 words) with long-tail specific tags (4-6 words).
- Base tags on what people actually type into YouTube search, not keyword permutations.
- Comma separated, no numbering, no explanations, no quotes around tags.`
            }
          ],
          temperature: 0.6,
          max_tokens: 500
        })
      }
    );
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Groq Response:", data);
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const rawTags = data.choices[0].message.content || "";

    // --- Safety net: dedup + strip near-duplicate root phrases even if the model slips ---
    const tagList = rawTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const seenRoots = new Set();
    const finalTags = [];

    for (const tag of tagList) {
      // Normalize: lowercase, strip common variant words to detect near-duplicates
      const root = tag
        .toLowerCase()
        .replace(/\b(in|for|with|without)\b.*$/i, "") // cut off after connector words
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

      if (!root) continue;
      if (seenRoots.has(root)) continue; // skip near-duplicate root

      seenRoots.add(root);
      finalTags.push(tag);
    }

    // Enforce YouTube's ~500 character total tag limit
    let charCount = 0;
    const trimmedTags = [];
    for (const tag of finalTags) {
      charCount += tag.length + 2; // +2 for ", "
      if (charCount > 480) break;
      trimmedTags.push(tag);
    }

    return res.status(200).json({
      tags: trimmedTags.join(", ")
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
