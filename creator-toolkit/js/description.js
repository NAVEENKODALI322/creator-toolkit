async function generateDescription() {

  const topic = document.getElementById("topic").value.trim();
  const channel = document.getElementById("channel").value.trim();
  const keywords = document.getElementById("keywords").value.trim();

  const outputBox = document.getElementById("output");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating AI Description...";

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
              content: "You are a professional YouTube SEO expert."
            },
            {
              role: "user",
              content: `
Generate a YouTube description.

Topic: ${topic}
Channel: ${channel}
Keywords: ${keywords}

Requirements:
- SEO optimized
- Mix Telugu and English naturally
- Include engaging intro
- Include CTA to Like, Share and Subscribe
- Include keywords naturally
- Include 10 relevant hashtags at the end
`
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
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

    outputBox.innerHTML =
      data.choices[0].message.content.replace(/\n/g, "<br>");

  } catch (error) {

    console.error(error);

    outputBox.innerHTML =
      "❌ Error: " + error.message;
  }
}

function copyDescription() {

  const text =
    document.getElementById("output").innerText;

  navigator.clipboard.writeText(text);

  alert("✅ Description Copied!");
}