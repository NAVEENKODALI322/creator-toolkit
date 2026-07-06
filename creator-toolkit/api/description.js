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
    const { topic, channel, keywords, language } = req.body || {};

    if (!topic || !language) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: API key not set." });
    }

    const langInstruction = {
      telugu: "Write ONLY in Telugu language (Telugu script). No English at all.",
      english: "Write ONLY in English language. No Telugu at all.",
      mix: `Write in natural Telugu-English mix (Tenglish style), the way Telugu YouTubers actually talk.
Example of GOOD mix style: "Ee video lo మీకు cricket world cup గురించి full analysis చూపిస్తాను. India team performance ఈసారి నిజంగా shocking గా undi."
Do NOT repeat the same sentence pattern (like "X ki chala Y ga") again and again - vary sentence structure naturally like real conversation.`
    };

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
            { role: "system", content: "You are a YouTube SEO expert and a native Telugu speaker who writes natural, engaging video descriptions. You never repeat the same grammar pattern back to back." },
            {
              role: "user",
              content: `Write a YouTube description for: "${topic}"
Channel: ${channel || ""}
Keywords: ${keywords || ""}
Language: ${langInstruction[language] || langInstruction.english}
STRICT RULES:
- If the topic has any spelling mistakes, silently correct them in your output (e.g. write "Cricket" correctly even if input has a typo)
- NO markdown like ** or ##
- NO labels like "Description:" or "Note:"
- NO numbered lists
- Start directly with content
- 150-200 words
- Natural conversational tone, vary sentence structure - do not reuse the same phrase pattern repeatedly
- End with like, share, subscribe line
- 10 hashtags at the end, space separated, spelled correctly`
            }
          ],
          temperature: 0.8,
          max_tokens: 1500,
          frequency_penalty: 0.6
        })
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Finish reason:", data.choices?.[0]?.finish_reason);
    console.log("Groq Response:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      description: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
