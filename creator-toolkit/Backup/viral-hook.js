async function generateHooks() {
  const topic = document.getElementById("topicInput").value;
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating...";

  const apiKey = "YOUR_NEW_API_KEY";

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Generate 5 viral YouTube hooks in Telugu + English mix for: " + topic
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log(data);

    if (data.error) {
      outputBox.innerHTML = "❌ API Error: " + data.error.message;
    } 
    else if (data.candidates && data.candidates.length > 0) {
      outputBox.innerHTML = data.candidates[0].content.parts[0].text;
    } 
    else {
      outputBox.innerHTML = "❌ No response from AI";
    }

  } catch (error) {
    outputBox.innerHTML = "❌ Network Error";
    console.log(error);
  }
}

