// api/hooks.js లోపల ఉండాల్సిన కరెక్ట్ కోడ్ సెటప్

export default async function handler(req, res) {
  // CORS Headers (మీ ఆండ్రాయిడ్ యాప్ మరియు వెబ్‌సైట్ రెండు రన్ అవ్వడానికి)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: { message: "Topic is required" } });
  }

  // మీ Groq API Key ఇక్కడే సురక్షితంగా ఉంటుంది
  const apiKey = "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";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
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
            content: `
Generate 7 highly viral YouTube hooks about "${topic}".

STRICT Rules:
- Output MUST be in clear, high-quality professional English.
- Do NOT mix broken languages, hybrid slang, or mixed fonts.
- Do NOT use generic text like "trust me" or "this video will change your life".
- Make hooks highly curiosity-driven, capturing attention in the first 3 seconds.
- Provide a mix of styles (e.g., Question hooks, Stat-based hooks, Bold claims).
- One hook per line.
- Do not number them and do not use bullet points.
- Keep each hook under 15 words.
- Output ONLY the hooks. No introduction, no conversational text.
`
          }
        ],
        temperature: 0.7, // రిజల్ట్స్ క్వాలిటీ పెంచడానికి తగ్గించాం
        max_tokens: 500
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}
