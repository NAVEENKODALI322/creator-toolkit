export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed. Use POST."
    });
  }

  try {
    // Safe body parsing
    const { topic } = req.body || {};

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required."
      });
    }

    // Check API Key
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing.");
      return res.status(500).json({
        error: "Server misconfiguration: API key not found."
      });
    }

    // Call Groq API
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
                "You are an expert YouTube growth strategist who creates highly clickable viral hooks."
            },
            {
              role: "user",
              content: `
Generate 7 highly viral YouTube hooks about "${topic}".

Rules:
- Output only English.
- Create curiosity-driven hooks.
- Mix Question, Bold Claim, Story and Stat styles.
- One hook per line.
- No numbering.
- No bullet points.
- No headings.
- Maximum 15 words each.
- Output ONLY the hooks.
`
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
      hooks: data.choices[0].message.content
    });

  } catch (err) {
    console.error("Hooks API Error:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
