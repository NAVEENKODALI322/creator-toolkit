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
              content: "You are an expert YouTube growth strategist who creates highly clickable viral hooks."
            },
            {
              role: "user",
              content: `Generate 10 highly viral YouTube hooks about "${topic}".

Rules:
- Each hook MUST be a natural Telugu-English code-mix sentence (Tenglish) — like how young Telugu YouTubers actually talk, mixing English words into Telugu sentences.
- Do NOT write pure/formal Telugu only.
- Do NOT write pure English only.
- Make hooks curiosity-driven and punchy
- Make hooks suitable for YouTube videos
- One hook per line
- Do not number them
- Do not use bullet points
- Do not add quotation marks around hooks
- Keep each hook under 15 words

Example style: "Ee video chూస్తే mీ life మారిపోతుంది, trust me"`
            }
          ],
          temperature: 0.9,
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

    return res.status(200).json({
      hooks: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
