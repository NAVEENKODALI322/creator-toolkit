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
      telugu: `Write ONLY in Telugu language (Telugu script). No English at all.
Use simple, everyday Telugu that a normal YouTube viewer speaks and understands.
Do NOT invent new words or reinterpret the topic — describe exactly what the topic says, in clear, grammatically correct Telugu.`,
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
            {
              role: "system",
              content: "You are a professional YouTube SEO copywriter and a native Telugu speaker who writes clear, coherent, and grammatically correct video descriptions. Every sentence must logically connect to the one before it. You never invent facts or reinterpret the topic — you describe exactly what is given, in natural flowing language. You never repeat the same sentence pattern back to back."
            },
            {
              role: "user",
              content: `Write a YouTube video description based on this exact topic (do not change its meaning): "${topic}"
Channel name: ${channel || "the channel"}
Keywords to naturally include: ${keywords || "none"}
Language: ${langInstruction[language] || langInstruction.english}

STRUCTURE (follow this order):
1. One-line hook that clearly states what the video is about (based on the exact topic given)
2. 2-3 sentences expanding on what the viewer will see/learn/enjoy in the video, in logical order
3. One short, natural call-to-action line (vary the phrasing each time — do not always say "like, share, subscribe" in that exact order; be creative but simple)
4. Exactly 5 relevant hashtags, space separated, no repeats, spelled correctly

STRICT RULES:
- If the topic has an obvious spelling mistake in a common word, correct only that word — do NOT change or reinterpret the overall meaning or subject of the topic
- Stay strictly on the subject given. Do not introduce unrelated ideas or objects
- NO markdown like ** or ##
- NO labels like "Description:" or "Note:"
- NO numbered lists in the output
- Start directly with content
- 120-180 words total (excluding hashtags)
- Every sentence must make logical sense on its own and connect to the surrounding sentences
- Exactly 5 hashtags at the end, not more`
            }
          ],
          temperature: 0.6,
          max_tokens: 1200,
          frequency_penalty: 0.5
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
