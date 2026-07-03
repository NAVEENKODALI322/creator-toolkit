export default async function handler(req, res) {
  const { topic, platform, hashtagCount } = req.body;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "You are a social media growth expert." },
        {
          role: "user",
          content: `Generate exactly ${hashtagCount} hashtags for the topic "${topic}". You are an expert ${platform} growth strategist. Return EXACTLY ${hashtagCount} hashtags, one per line, starting with #. No duplicates. All hashtags must be real and commonly used.`
        }
      ]
    })
  });

  const data = await response.json();
  res.json({ hashtags: data.choices[0].message.content });
}
