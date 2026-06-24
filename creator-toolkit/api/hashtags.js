export default async function handler(req, res) {
  const { topic } = req.body;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{
        role: "user",
        content: `Generate 15 YouTube hashtags for: "${topic}". Only hashtags, one per line, starting with #.`
      }]
    })
  });

  const data = await response.json();
  res.json({ hashtags: data.choices[0].message.content });
}
