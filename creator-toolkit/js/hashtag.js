async function generateHashtags() {
  const topic = document.getElementById("keyword").value.trim();
  const platform = document.getElementById("platform").value;
  const hashtagCount = document.getElementById("hashtagCount").value;
  const outputBox = document.getElementById("result");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating AI Hashtags...";

  const apiKey = "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"; // ❗ don't expose in frontend

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
            content: "You are a social media growth expert."
          },
          {
            role: "user",
            content: `You are an expert ${platform} SEO strategist.

Generate exactly ${hashtagCount} hashtags for the topic "${topic}".

Rules:


- Return ONLY high-engagement viral hashtags
- Avoid job/business/consultant type hashtags unless topic explicitly requires it
- Focus on Instagram/TikTok trending fitness hashtags
- Remove duplicates strictly
- Prioritize hashtags used in viral reels
- Keep mix:
  40% viral trending
  30% niche fitness
  20% discovery
  10% general${platform} hashtags
- Use only real and commonly used hashtags
- Do not generate fake or unrelated hashtags`
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (data.error) {
      outputBox.innerHTML = "❌ " + data.error.message;
      return;
    }

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
