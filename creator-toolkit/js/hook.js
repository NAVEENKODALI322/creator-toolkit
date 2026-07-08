async function generateHooks() {
  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }
  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  try {
    const response = await fetch("https://www.creatortoolkits.in/api/hooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (!response.ok) {
      outputBox.innerHTML = "❌ API Error: " + (data.error?.message || data.error || "Something went wrong");
      return;
    }

    outputBox.innerHTML = data.hooks.replace(/\n/g, "<br><br>");
  } catch (error) {
    console.error(error);
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHooks() {
  const text = document.getElementById("outputBox").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Hooks copied!");
}
