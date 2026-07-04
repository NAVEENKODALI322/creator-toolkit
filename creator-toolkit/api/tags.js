
export default async function handler(req, res) {
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
              content: "You are a YouTube SEO expert who creates the best video tags."
            },
            {
              role: "user",
              content: `Generate 30 highly searched YouTube tags for the topic "${topic}".
Rules:
- Comma separated
- No numbering
- No explanations
- Mix broad and niche tags`
            }
          ],
          temperature: 0.8,
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
      tags: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
