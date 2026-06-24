async function generateHooks() {

const topic = document.getElementById("topicInput").value.trim();
const outputBox = document.getElementById("outputBox");

if (!topic) {
outputBox.innerHTML = "⚠️ Please enter a topic!";
return;
}

outputBox.innerHTML = "⏳ Generating Viral Hooks...";

const apiKey = "YOUR_GROQ_API_KEY";

try {

```
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
```

Generate 10 highly viral YouTube hooks about "${topic}".

Rules:

* Mix Telugu and English naturally
* One hook per line
* No numbering
* No bullet points
* Curiosity-driven
* Under 15 words
  `
  }
  ],
  temperature: 0.9,
  max_tokens: 500
  })
  }
  );

  const data = await response.json();

  if (data.error) {
  outputBox.innerHTML =
  "❌ API Error: " + data.error.message;
  return;
  }

  outputBox.innerHTML =
  data.choices[0].message.content.replace(/\n/g, "<br><br>");

  } catch (error) {

  outputBox.innerHTML =
  "❌ Error: " + error.message;
  }
  }

function copyHooks() {

const text =
document.getElementById("outputBox").innerText;

navigator.clipboard.writeText(text);

alert("✅ Hooks Copied!");
}
