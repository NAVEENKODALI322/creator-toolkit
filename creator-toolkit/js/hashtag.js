async function generateHashtags() {
  const topic = document.getElementById("keyword").value.trim();
  const outputBox = document.getElementById("result");
  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }
  outputBox.innerHTML = "⏳ Generating AI Hashtags...";
  const apiKey = "gsk_YOUR_REAL_GROQ_KEY";
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
          { role: "system", content: "You are a social media growth expert." },
          { role: "user", content: `Generate 30 viral hashtags for "${topic}". Requirements:\n* Only hashtags\n* Space separated\n* No numbering\n* No explanations\n* Mix broad and niche hashtags` }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });
    const data = await response.json();
    if (data.error) {
      outputBox.innerHTML = "❌ API Error: " + data.error.message;
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
