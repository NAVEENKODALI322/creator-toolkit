async function generateHashtags() {
  const topic = document.getElementById("keyword").value.trim();
  const platform = document.getElementById("platform").value;
  const hashtagCount = document.getElementById("hashtagCount").value;
  const outputBox = document.getElementById("result");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating AI Hashtags...";

  try {
    const response = await fetch("https://www.creatortoolkits.in/api/hashtags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, platform, hashtagCount })
    });

    const data = await response.json();

    let hashtags = data.hashtags
      .split("\n")
      .filter(line => line.startsWith("#"))
      .slice(0, parseInt(hashtagCount))
      .join("\n");

    outputBox.innerHTML = hashtags;
  } catch (error) {
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHashtags() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Hashtags Copied!");
}
