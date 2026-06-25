async function generateTags() {

  const topic = document.getElementById("keyword").value.trim();
  const outputBox = document.getElementById("output");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating AI Tags...";

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
              content: "You are a YouTube SEO expert."
            },
            {
              role: "user",
              content: `
Generate 30 YouTube SEO tags for "${topic}".

Requirements:
- Comma separated
- Include short-tail keywords
- Include long-tail keywords
- No numbering
- No explanations
- Only tags
`
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      }
    );

  const data = await response.json();

console.log("TAGS RESPONSE:", data);

if (data.error) {
  outputBox.innerHTML =
    "❌ API Error: " + data.error.message;
  return;
}

    outputBox.innerHTML =
      data.choices[0].message.content;

  } catch (error) {

    console.error(error);

    outputBox.innerHTML =
      "❌ Error: " + error.message;
  }
}

function copyTags() {

  const text =
    document.getElementById("output").innerText;

  navigator.clipboard.writeText(text);

  alert("✅ Tags Copied!");
}
