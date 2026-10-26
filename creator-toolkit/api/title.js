// Title generator API.
// Response shape is unchanged ({ titles: "line1\nline2..." }) because the Android/iOS app uses it too.
// New optional request field: language = "mix" (default) | "english" | "telugu"

const MAX_TITLE_LENGTH = 60;   // visible characters before YouTube truncates a title
const FINAL_COUNT = 20;        // titles returned to the user
const ASK_COUNT = 24;          // we ask for extra, because some get filtered out
const MAX_TOPIC_LENGTH = 200;

const LANGUAGES = ["mix", "english", "telugu"];

// Phrases that overpromise or leak internal labels into the titles.
const BANNED = /\b(tenglish|guaranteed?|you won['’]?t believe|10x|100x)\b/i;

function lengthOf(text) {
  try {
    const seg = new Intl.Segmenter("te", { granularity: "grapheme" });
    return [...seg.segment(text)].length;
  } catch {
    return [...text].length;
  }
}

function languageRules(language) {
  const half = ASK_COUNT / 2;
  if (language === "english") {
    return `- All ${ASK_COUNT} titles: PURE ENGLISH only (no Telugu words at all)`;
  }
  if (language === "telugu") {
    return `- All ${ASK_COUNT} titles: natural Telugu-English mix, the way Telugu YouTubers actually talk. Use Telugu script for the Telugu words and keep tool names and keywords in English, e.g. "Ee Trick తో YouTube Views పెంచుకోండి"`;
  }
  return `- First ${half} titles: PURE ENGLISH only (no Telugu words at all)
- Next ${half} titles: natural Telugu-English mix, the way Telugu YouTubers actually talk. Use Telugu script for the Telugu words and keep tool names and keywords in English, e.g. "Ee Trick తో YouTube Views పెంచుకోండి"`;
}

function buildPrompt(topic, language) {
  return `
Write ${ASK_COUNT} YouTube titles for a video about: ${topic}

Language split:
${languageRules(language)}

Rules:
- Every title must be ${MAX_TITLE_LENGTH - 5} characters or fewer, including spaces. Shorter is better.
- Put the main keyword in the first few words.
- Be specific and honest. The title must be something the video can actually deliver.
- Do NOT invent numbers, time claims or results. Only use a number or a time (like "in 5 minutes") if the topic itself contains it. A list number like "5 Mistakes" is fine.
- Do NOT use "10x", "guaranteed", "you won't believe", or similar hype.
- Do NOT write the word "Tenglish" and do NOT label the language in the title.
- Mix structures: how-to, question, list, curiosity gap, specific outcome.
- One title per line. No numbering, no bullets, no quotes, no headings, no blank lines.
`.trim();
}

function parseLines(raw) {
  return String(raw || "")
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, "") // bullets / numbering
        .replace(/^["“”']+|["“”']+$/g, "")        // wrapping quotes
        .replace(/\*\*/g, "")                       // markdown bold
        .trim()
    )
    .filter(Boolean);
}

// Turns the raw model text into the final list of titles.
function selectTitles(raw, language) {
  const lines = parseLines(raw);
  const half = ASK_COUNT / 2;
  const seen = new Set();

  const entries = lines.map((text, index) => ({
    text,
    group: language === "mix" && index >= half ? 1 : 0,
  }));

  const clean = entries.filter((e) => {
    const key = e.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return !BANNED.test(e.text);
  });

  const fits = clean.filter((e) => lengthOf(e.text) <= MAX_TITLE_LENGTH);
  // If filtering removed almost everything, fall back to the unfiltered list rather than return nothing.
  const pool = fits.length >= 6 ? fits : clean;

  let chosen;
  if (language === "mix") {
    const perGroup = FINAL_COUNT / 2;
    chosen = [
      ...pool.filter((e) => e.group === 0).slice(0, perGroup),
      ...pool.filter((e) => e.group === 1).slice(0, perGroup),
    ];
  } else {
    chosen = pool.slice(0, FINAL_COUNT);
  }
  return chosen.map((e) => e.text);
}

export default async function handler(req, res) {
  // Allow requests from the Android/iOS app and browser
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }
  try {
    const body = req.body || {};
    const topic = String(body.topic || "").replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH);
    const language = LANGUAGES.includes(body.language) ? body.language : "mix";
    if (!topic) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: API key not set." });
    }
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
              content: "You are a YouTube SEO expert who writes accurate, specific, clickable titles for English and Telugu-English (mixed) audiences. You never exaggerate or promise results a video cannot deliver."
            },
            {
              role: "user",
              content: buildPrompt(topic, language)
            }
          ],
          temperature: 0.8,
          max_tokens: 1800
        })
      }
    );
    const data = await response.json();
    console.log("Status:", response.status);
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : "";
    const titles = selectTitles(content, language);
    if (!titles.length) {
      return res.status(502).json({ error: "The AI returned no titles. Please try again." });
    }
    return res.status(200).json({
      titles: titles.join("\n"),
      language
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
