async function generateHooks() {

  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  // Groq API Key
  const apiKey = "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";

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
      }
    );

    const data = await response.json();

    console.log("API Response:", data);

    if (data.error) {
      outputBox.innerHTML = "❌ API Error: " + data.error.message;
      return;
    }

    // 🔥 ఇక్కడ Safe Check చేస్తున్నాం - ఒకవేళ choices లేకపోయినా యాప్ క్రాష్ అవ్వదు
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let content = data.choices[0].message.content.trim();
      
      // నీట్ గా ఖాళీ లైన్లు తీసేసి బ్రేక్స్ యాడ్ చేయడం
      let cleanedContent = content.split('\n')
                                  .map(line => line.trim())
                                  .filter(line => line.length > 0)
                                  .join('<br><br>');

      outputBox.innerHTML = cleanedContent;
    } else {
      outputBox.innerHTML = "❌ Error: Invalid data structure received from AI.";
    }

  } catch (error) {
    console.error(error);
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHooks() {
  const text = document.getElementById("outputBox").innerText;
  if (!text || text.startsWith("⏳") || text.startsWith("⚠️")) {
    alert("❌ No hooks to copy!");
    return;
  }
  navigator.clipboard.writeText(text);
  alert("✅ Hooks copied!");
}
