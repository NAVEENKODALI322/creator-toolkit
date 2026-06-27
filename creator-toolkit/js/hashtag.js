async function generateHashtags() {
  const topic = document.getElementById("keyword").value.trim();
  const platform = document.getElementById("platform").value;
const hashtagCount = document.getElementById("hashtagCount").value;
  const outputBox = document.getElementById("result");
  if (!topic) { outputBox.innerHTML = "⚠️ Please enter a topic!"; return; }
  outputBox.innerHTML = "⏳ Generating AI Hashtags...";
  const apiKey = "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";
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
     body: JSON.stringify({
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "system", content: "You are a social media growth expert." },
   {
  role: "user",
  content: `You are an expert ${platform} SEO strategist.

Generate exactly ${hashtagCount} hashtags for the topic "${topic}".

Rules:
- Return ONLY hashtags.
- One hashtag per line.
- No numbering.
- No explanations.
- No duplicate hashtags.
- Every hashtag must be relevant.
- Mix:
  • 30% keyword hashtags
  • 30% niche hashtags
  • 20% discovery hashtags
  • 20% trending ${platform} hashtags
- Do not generate unrelated hashtags like Gaming, Kpop, etc. unless directly relevant.
- Start every hashtag with #.
- Use real, commonly used hashtags only.`
}
Rules:
- Use only real and commonly used hashtags.
- Mix broad, niche and trending hashtags.
- Do not create fancy or made-up hashtags.
- Output hashtags only.
- One line separated by spaces.
- Start every hashtag with #.` }
  ],
  temperature: 0.5,
  max_tokens: 500
})
    });
    const data = await response.json();
    if (data.error) { outputBox.innerHTML = "❌ " + data.error.message; return; }
    outputBox.innerHTML = data.choices[0].message.content;
  } catch (error) {
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHashtags() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Hashtags Copied!");
}
