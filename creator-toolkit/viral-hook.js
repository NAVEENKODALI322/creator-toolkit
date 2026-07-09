 async function generateHooks() {
  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  try {
    // మీ Vercel API కి రిక్వెస్ట్ పంపుతున్నాం
    const response = await fetch("/api/hooks", {
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

    // ఇక్కడ Groq API నుండి వచ్చే రెస్పాన్స్ ని పక్కాగా చెక్ చేస్తున్నాం
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      let content = data.choices[0].message.content.trim();
      
      // ఖాళీ లైన్లు తీసేసి నీట్ గా <br><br> యాడ్ చేయడం
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

    // AI ఇచ్చే స్పేస్‌లు, ఖాళీ లైన్లని క్లీన్ గా ఫార్మాట్ చేయడానికి
    let content = data.choices[0].message.content.trim();
    let cleanedContent = content.split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .join('<br><br>');

    outputBox.innerHTML = cleanedContent;

  } catch (error) {

    console.error(error);

    outputBox.innerHTML =
      "❌ Error: " + error.message;
  }
}

function copyHooks() {

  const text =
    document.getElementById("outputBox").innerText;

  if (!text || text.startsWith("⏳") || text.startsWith("⚠️")) {
    alert("❌ No hooks to copy!");
    return;
  }

  navigator.clipboard.writeText(text);

  alert("✅ Hooks copied!");
}
