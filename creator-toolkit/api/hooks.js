export default async function handler(req, res) {
  // CORS Headers
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
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    // 🔥 ఇక్కడే మ్యాజిక్ చేస్తున్నాం:
    // ఫ్రంటెండ్‌లో ఏ ఫైల్ ఉన్నా సరే, దానికి దొరకాల్సిన 'choices' స్ట్రక్చర్‌ని ఇక్కడే క్రియేట్ చేసి పంపుతున్నాం.
    // పైగా టెక్స్ట్‌ని ముందే క్లీన్ చేసి ఇక్కడే <br> యాడ్ చేసేస్తున్నాం.
    if (data.choices && data.choices[0] && data.choices[0].message) {
      let rawContent = data.choices[0].message.content.trim();
      let cleanedContent = rawContent.split('\n')
                                     .map(line => line.trim())
                                     .filter(line => line.length > 0)
                                     .join('<br><br>');
      
      // పాత ఫ్రంటెండ్ కోడ్ వెతికే లాగనే స్ట్రక్చర్ ని మోడిఫై చేశాను
      data.choices[0].message.content = cleanedContent;
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}
