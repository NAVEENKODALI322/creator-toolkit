async function generateDescription() {
  const topic = document.getElementById("keyword").value.trim();
  const outputBox = document.getElementById("result");
  const language = document.getElementById("language").value;

  if (!topic) { outputBox.innerHTML = "⚠️ Please enter a topic!"; return; }
  outputBox.innerHTML = "⏳ Generating...";

  const langInstruction = {
    telugu: "Write ONLY in Telugu language. No English at all.",
    english: "Write ONLY in English language. No Telugu at all.",
    mix: "Write in Telugu-English mix. Telugu as main, English words naturally mixed."
  };

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
          { role: "system", content: "You are a YouTube SEO expert." },
          { role: "user", content: `Write a YouTube description for: "${topic}"

Language rule: ${langInstruction[language]}

STRICT RULES:
- NO markdown like ** or ##
- NO "Description:" or "Note:" labels
- NO numbered lists
- Start directly with content
- 150-200 words
- Natural conversational tone
- End with like, share, subscribe line
- 10 hashtags at the end, space separated` }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    const data = await response.json();
    if (data.error) { outputBox.innerHTML = "❌ " + data.error.message; return; }
    outputBox.innerHTML = data.choices[0].message.content;
  } catch (error) {
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyDescription() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Copied!");
}
