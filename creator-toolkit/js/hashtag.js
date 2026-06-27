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

content: `Generate exactly ${hashtagCount} hashtags for the topic "${topic}".

You are an expert ${platform} growth strategist.

Rules:
- Return ONLY hashtags (no explanations)
- One hashtag per line
- No duplicates
- All hashtags must be real and commonly used
- Avoid fake, spam, or irrelevant hashtags
- Avoid day-based or repetitive hashtags (like monday/tuesday series)

Hashtag strategy mix:
- 40% high viral reach hashtags (e.g. #viral #reels #fyp #explorepage)
- 30% niche-specific hashtags related to the topic
- 20% medium competition engagement hashtags
- 10% long-tail specific hashtags for targeted reach

Priority:
- Prefer hashtags used in viral Instagram/TikTok reels
- Include global reach hashtags when relevant
- Ensure high engagement potential, not just keyword stuffing`
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
