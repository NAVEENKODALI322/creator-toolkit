async function generateHashtags() {
  const topic = document.getElementById("keyword").value.trim();
  const outputBox = document.getElementById("result");
  if (!topic) {
    outputBox.innerHTML = "⚠️ Please enter a topic!";
    return;
  }
  outputBox.innerHTML = "⏳ Generating AI Hashtags...";
  const apiKey = "gsk_YOUR_REAL_KEY_HERE";
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a social media growth expert." },
          { role: "user", content: `Generate 30 viral hashtags for "${topic}". Requirements:\n* Only hashtags\n* Space separated\n* No numbering\n* No explanations\n* Mix broad and niche hashtags` }
        ],
