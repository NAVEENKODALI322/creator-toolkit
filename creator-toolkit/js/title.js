async function generateTitles() {
  const topic = document.getElementById("keyword").value.trim();
  const outputBox = document.getElementById("output");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }
  outputBox.innerHTML = "⏳ Generating AI Titles...";

  try {
    const response = await fetch("https://creator-toolkit-one.vercel.app/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (!response.ok) {
      outputBox.innerHTML = "❌ API Error: " + (data.error?.message || data.error || "Something went wrong");
      return;
    }

    outputBox.innerHTML = data.titles.replace(/\n/g, "<br><br>");
  } catch (error) {
    console.error(error);
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyTitles() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Titles copied!");
}
