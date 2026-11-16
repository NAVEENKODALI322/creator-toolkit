async function generateTags() {
  const topic = document.getElementById("keyword").value.trim();
  const outputBox = document.getElementById("output");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }
  outputBox.innerHTML = "⏳ Generating AI Tags...";

  try {
    const response = await fetch("https://www.creatortoolkits.in/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, language: (document.getElementById("language") || {}).value })
    });

    const data = await response.json();

    if (!response.ok) {
      outputBox.textContent = "❌ API Error: " + (data.error?.message || data.error || "Something went wrong");
      return;
    }

    outputBox.textContent = data.tags;
  } catch (error) {
    console.error(error);
    outputBox.textContent = "❌ Error: " + error.message;
  }
}

function copyTags() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Tags copied!");
}
