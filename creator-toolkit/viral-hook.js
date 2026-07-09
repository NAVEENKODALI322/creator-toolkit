async function generateHooks() {
  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  try {
    // 🔥 ఇక్కడ మీ పూర్తి Vercel డొమైన్ URL ఇవ్వాలి. 
    // దీనివల్ల మీ వెబ్‌సైట్ లోనూ, ఆండ్రాయిడ్ యాప్ లోనూ ఎక్కడా ఎర్రర్ రాకుండా రన్ అవుతుంది.
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

    // Groq నుండి వచ్చిన రెస్పాన్స్‌ని పక్కాగా చెక్ చేస్తున్నాం
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let content = data.choices[0].message.content.trim();
      
      // ఖాళీ లైన్లు తీసేసి నీట్ గా ప్రతి హుక్ కి మధ్యలో <br><br> యాడ్ చేయడం
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
