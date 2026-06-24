async function generateTitles() {

const topic = document.getElementById("keyword").value.trim();
const outputBox = document.getElementById("output");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating AI Titles...";

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
                "You are a YouTube SEO expert who creates highly clickable titles."
            },
            {
              role: "user",
              content: `
Generate 20 highly clickable YouTube titles about "${topic}".

Rules:
- Mix Telugu and English naturally
- Create curiosity
- Optimize for clicks
- One title per line
- Do not number
- Do not use bullet points
`
            }
          ],
          temperature: 0.9,
          max_tokens: 700
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
      data.choices[0].message.content.replace(/\n/g, "<br><br>");

  } catch (error) {

    console.error(error);

    outputBox.innerHTML =
      "❌ Error: " + error.message;
  }
}

function copyTitles() {

  const text =
    document.getElementById("outputBox").innerText;

  navigator.clipboard.writeText(text);

  alert("✅ Titles copied!");
}