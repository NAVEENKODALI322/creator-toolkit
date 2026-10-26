// Hooks API. Response shape is unchanged ({ hooks: "line1\nline2..." }) because the mobile app uses it too.
//
// Hooks must not invent facts. The model used to write lines such as "I earned $5,000 a month" or
// "78% of YouTubers ignore this", which a creator could not honestly say in a video. The prompt now
// forbids made-up numbers and results, and every line is also checked on the server.

const HOOK_COUNT = 7;
const MAX_TOPIC_LENGTH = 200;

// Money, time, percentage and result claims. Dropped unless the topic itself contains a digit.
const INVENTED_NUMBER = /\d\s*-?\s*(?:minutes?|mins?|seconds?|secs?|hours?|days?|weeks?|months?|years?|x|views|subscribers|subs|lakhs?|crores?|k)\b|\d\s*%|[$₹]\s*\d/i;
// Hype and income promises that a video usually cannot deliver.
const HYPE = /\b(six[- ]?figures?|seven[- ]?figures?|millionaire|get rich|overnight|guaranteed?|you won['’]?t believe|10x|100x)\b/i;

function parseLines(raw) {
  return String(raw || "")
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, "") // bullets / numbering
        .replace(/\*\*/g, "")                       // markdown bold
        .trim()
    )
    .filter(Boolean);
}

function acceptLines(raw, topic) {
  const topicHasNumber = /\d/.test(topic);
  return parseLines(raw).filter((text) => {
    if (HYPE.test(text)) return false;
    if (!topicHasNumber && INVENTED_NUMBER.test(text)) return false;
    return true;
  });
}

function buildPrompt(topic, ask) {
  return `
Write ${ask} YouTube video hooks (the first sentence a creator says or shows) about: ${topic}

Rules:
- Output only English.
- Create curiosity-driven hooks. Mix these styles: a question, a bold but honest claim, a short story opening, and a "mistake most beginners make" line.
- Be specific to the topic and honest. A hook may only promise what a normal video on this topic can deliver.
- Do NOT invent numbers, statistics, percentages, prices, income, view counts or time frames. Use a number only if the topic itself contains one. A plain list number like "3 mistakes" is fine.
- Do NOT claim the creator earned money, got views or got results. Do not write fake personal achievements.
- Do NOT use phrases like "six-figure", "overnight", "get rich", "guaranteed" or "you won't believe".
- One hook per line.
- No numbering, no bullet points, no headings, no quotes.
- Maximum 15 words each.
- Output ONLY the hooks.
`.trim();
}

async function callModel(topic, ask) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content:
            "You are a YouTube growth strategist who writes clickable but honest hooks. You never invent statistics, income or results.",
        },
        { role: "user", content: buildPrompt(topic, ask) },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });
  const data = await response.json();
  return {
    ok: response.ok,
    status: response.status,
    content: data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "",
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed. Use POST."
    });
  }

  try {
    // Safe body parsing
    const body = req.body || {};
    const topic = String(body.topic || "").replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH);

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required."
      });
    }

    // Check API Key
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing.");
      return res.status(500).json({
        error: "Server misconfiguration: API key not found."
      });
    }

    const startedAt = Date.now();
    const seen = new Set();
    const kept = [];
    let upstreamStatus = null;

    // Up to two attempts: the second one only runs when too few hooks passed the checks.
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (attempt === 2 && (kept.length >= 5 || Date.now() - startedAt > 5000)) break;
      const result = await callModel(topic, HOOK_COUNT + 3);
      if (!result.ok) {
        upstreamStatus = result.status;
        // Never show the raw message from the AI service (it can contain account details).
        console.error("AI service error status:", result.status);
        break;
      }
      upstreamStatus = null;
      for (const text of acceptLines(result.content, topic)) {
        const key = text.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          kept.push(text);
        }
      }
    }

    if (!kept.length) {
      if (upstreamStatus !== null) {
        return res.status(upstreamStatus === 429 ? 429 : 502).json({
          error: {
            message: upstreamStatus === 429
              ? "Too many people are using the AI tools right now. Please wait a minute and try again."
              : "The AI service is busy or unavailable at the moment. Please try again in a moment."
          }
        });
      }
      // Every line failed the checks (invented numbers or hype). Ask the user to retry instead of
      // showing claims a creator could not honestly make.
      return res.status(502).json({ error: { message: "The AI did not return usable hooks. Please try again." } });
    }

    return res.status(200).json({
      hooks: kept.slice(0, HOOK_COUNT).join("\n")
    });

  } catch (err) {
    console.error("Hooks API Error:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
