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
              content: "You are a YouTube SEO expert who creates highly clickable titles in both English and Tenglish (Telugu-English mix)."
            },
            {
              role: "user",
              content: `
Generate 20 highly clickable YouTube titles about "${topic}".

Split exactly like this:
- First 10 titles: PURE ENGLISH only (no Telugu words at all)
- Next 10 titles: TENGLISH — Telugu-English mix written ENTIRELY IN ROMAN/LATIN LETTERS (the way Telugu YouTubers type in real captions/comments). NEVER use Telugu script (no Unicode Telugu characters like తెలుగు at all).

Correct Tenglish examples (Roman script only, no Telugu unicode anywhere):
- "Ee Trick Tho YouTube Views Penchukondi 2x Fast"
- "Nenu Ee Mistake Valla 50 Vela Kolpoya - Meeru Cheyaku"
- "Idi Chusthe Miku Shock Avuthundi - Real Story"

Rules:
- Tenglish titles must use ONLY English alphabet letters (A-Z), spelling Telugu words phonetically in Roman script — like informal Telugu texting/WhatsApp style
- Do NOT output any Telugu script characters (no తెలుగు unicode) anywhere in the Tenglish titles
- Keep Telugu words simple, common, and correctly spelled phonetically — do not invent or garble words
- Create curiosity, use power words, optimize for clicks
- One title per line
- Do not number the lines
- Do not use bullet points
- Do not add any heading like "English Titles" or "Tenglish Titles" - just the 20 lines, English ones first, then Tenglish ones
`
            }
          ],
          temperature: 0.9,
          max_tokens: 800
        })
      }
    );
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Groq Response:", data);
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json({
      titles: data.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
