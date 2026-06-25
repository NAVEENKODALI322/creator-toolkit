async function generateHooks() {

  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  // PASTE YOUR NEW GROQ API KEY HERE
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
              content:
                "You are an expert YouTube growth strategist who creates highly clickable viral hooks."
            },
            {
              role: "user",
              content: `
Generate 10 highly viral YouTube hooks about "${topic}".

Rules:
- Mix Telugu and English naturally
- Make hooks curiosity-driven
- Make hooks suitable for YouTube videos
- One hook per line
- Do not number them
- Do not use bullet points
- Keep each hook under 15 words
`
            }
          ],
          temperature: 0.9,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.error) {
      outputBox.innerHTML =
        "❌ API Error: " + data.error.message;
      return;
    }

    if (!data.choices || !data.choices.length) {
      outputBox.innerHTML =
        "❌ No hooks generated";
      return;
    }

    outputBox.innerHTML =
      data.choices[0].message.content.replace(/\n/g, "<br><br>");

  } catch (error) {

    console.error(error);

    outputBox.innerHTML =
      "❌ Error: " + error.message;
  }
}

function copyHooks() {

  const text =
    document.getElementById("outputBox").innerText;

  navigator.clipboard.writeText(text);

  alert("✅ Hooks copied!");
}
