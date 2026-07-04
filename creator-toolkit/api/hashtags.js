export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    console.log("API Key exists:", !!process.env.GROQ_API_KEY);

    const { topic, platform, hashtagCount } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: "You are a social media growth expert."
          },
          {
            role: "user",
            content: `Generate exactly ${hashtagCount} hashtags for ${topic} on ${platform}. Return only hashtags.`
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Groq Status:", response.status);
    console.log("Groq Response:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json({
      hashtags: data.choices[0].message.content
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}
