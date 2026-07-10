async function generateHooks() {
  const topic = document.getElementById("topicInput").value.trim();
  const outputBox = document.getElementById("outputBox");

  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }

  outputBox.innerHTML = "⏳ Generating Viral Hooks...";

  try {
    const response = await fetch("/api/hooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await response.json();

    if (!response.ok) {
      outputBox.innerHTML =
        "❌ " + (data.error?.message || data.error || "Failed to generate hooks.");
      return;
    }

    if (data.hooks) {
      const cleanedHooks = data.hooks
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("<br><br>");

      outputBox.innerHTML = cleanedHooks;
    } else {
      outputBox.innerHTML = "❌ No hooks generated.";
    }

  } catch (error) {
    console.error(error);
    outputBox.innerHTML = "❌ Error: " + error.message;
  }
}

function copyHooks() {
  const text = document.getElementById("outputBox").innerText;

  if (
    !text ||
    text.startsWith("⏳") ||
    text.startsWith("⚠️") ||
    text.startsWith("❌")
  ) {
    alert("❌ No hooks to copy!");
    return;
  }

  navigator.clipboard.writeText(text);

  alert("✅ Hooks copied!");
}

window.generateHooks = generateHooks;
window.copyHooks = copyHooks;
