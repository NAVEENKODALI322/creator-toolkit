<script>
async function generateHashtags() {
  const topic = document.getElementById("keyword").value.trim();
  const platform = document.getElementById("platform").value;
  const hashtagCount = document.getElementById("hashtagCount").value;
  const outputBox = document.getElementById("result");

  if (!topic) { outputBox.innerHTML = "⚠️ Please enter a topic!"; return; }
  outputBox.innerHTML = "⏳ Generating AI Hashtags...";

  try {
    const response = await fetch("/api/hashtags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, platform, hashtagCount })
    });

    const data = await response.json();

    if (!response.ok) {
      outputBox.innerHTML = "❌ " + (data.error?.message || data.error || "Something went wrong");
      return;
    }

    outputBox.innerHTML = data.hashtags;
  } catch (error) {
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHashtags() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text);
  alert("✅ Hashtags Copied!");
}
</script>
