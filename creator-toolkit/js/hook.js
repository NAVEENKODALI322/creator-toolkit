async function generateHooks() {
  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  try {
    // 🔥 డైరెక్ట్ గ్రోక్ లింక్ తీసేసి, మీ వర్సెల్ బ్యాకెండ్ ఎండ్ పాయింట్ ఇస్తున్నాం
    // దీనివల్ల Vercel లో మీరు పెట్టిన కొత్త GROQ_API_KEY రన్ అవుతుంది
    const response = await fetch("https://creator-toolkit-one.vercel.app/api/hooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic: topic })
    });

    const data = await response.json();

    if (data.error) {
      outputBox.innerHTML = "❌ API Error: " + data.error.message;
      return;
    }

    // రెస్పాన్స్ ని క్లీన్ గా చెక్ చేసి స్క్రీన్ పై చూపించడం
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let content = data.choices[0].message.content.trim();
      
      let cleanedContent = content.split('\n')
                                  .map(line => line.trim())
                                  .filter(line => line.length > 0)
                                  .join('<br><br>');

      outputBox.innerHTML = cleanedContent;
    } else {
      outputBox.innerHTML = "❌ No hooks generated. Please try again.";
    }

  } catch (error) {
    console.error(error);
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHooks() {
  const text = document.getElementById("outputBox").innerText;
  if (!text || text.startsWith("⏳") || text.startsWith("⚠️") || text.startsWith("❌")) {
    alert("❌ No hooks to copy!");
    return;
  }
  navigator.clipboard.writeText(text);
  alert("✅ Hooks copied!");
}
