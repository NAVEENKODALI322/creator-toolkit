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


- Prioritize REAL viral Instagram/TikTok hashtags
- Include at least 20% high-reach global hashtags like #fyp #viral #reels #explorepage
- Avoid day-based or repetitive hashtags (like monday/tuesday etc.)
- Avoid low-engagement compound hashtags
- Prefer hashtags used in viral reels
- Ensure mix of:
  40% viral reach hashtags
  30% niche fitness
  20% medium competition
  10% long-tail${platform} hashtags
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
