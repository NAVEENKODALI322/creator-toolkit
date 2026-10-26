// Title generator API.
// Response shape is unchanged ({ titles: "line1\nline2..." }) because the Android/iOS app uses it too.
// Optional request fields:
//   language = "mix" (default) | "english" | "telugu"
//   debug    = true  -> adds a small "debug" object (attempt counts, finish reasons) to the response
//
// How it works: one big request for 24 titles in two languages was unreliable (sometimes empty,
// sometimes no Telugu at all). So each language is asked separately in small parallel requests,
// every batch is checked on the server (language script, length, banned words), and a batch that
// comes back too short is retried once if there is still time.

const MAX_TITLE_LENGTH = 60;     // visible characters before YouTube truncates a title
const EXTRA_ASKED = 4;           // ask for a few more than needed, some get filtered out
const MAX_TOPIC_LENGTH = 200;
const RETRY_ONLY_BEFORE_MS = 4500; // do not start a retry after this much time (serverless time limit)
const CALL_TIMEOUT_MS = 8000;

const LANGUAGES = ["mix", "english", "telugu"];

// Phrases that overpromise or leak internal labels into the titles.
const BANNED = /\b(tenglish|guaranteed?|you won['’]?t believe|10x|100x)\b/i;
const TELUGU_LETTER = /[ఀ-౿]/g;

function teluguLetters(text) {
  const m = text.match(TELUGU_LETTER);
  return m ? m.length : 0;
}

function lengthOf(text) {
  try {
    const seg = new Intl.Segmenter("te", { granularity: "grapheme" });
    return [...seg.segment(text)].length;
  } catch {
    return [...text].length;
  }
}

const ANGLES = {
  mixed: "A mix of how-to titles, questions, list titles and curiosity-gap titles.",
  a: "Mostly how-to titles, questions and list-style titles.",
  b: "Mostly curiosity-gap titles, specific-outcome titles and 'mistakes to avoid' titles.",
};

function languageBlock(kind) {
  if (kind === "english") {
    return "Language: PURE ENGLISH. Do not use any Telugu words or Telugu script.";
  }
  return `Language: natural Telugu-English mix, the way Telugu YouTubers write titles.
- Write the Telugu words in TELUGU SCRIPT (తెలుగు లిపి). Do not write Telugu words in English letters.
- Keep the topic keyword and any tool or brand names in English.
- EVERY title must contain at least three Telugu-script words.
Examples of the style (other topics, never copy them):
Instagram లో Followers పెంచుకోవడం ఎలా? 5 Easy Tips
Canva తో Thumbnail ఈజీగా Design చేయండి
ఇంట్లోనే Paneer Butter Masala ఇలా చేయండి`;
}

function buildPrompt(topic, kind, ask, angle) {
  return `
Write ${ask} YouTube titles for a video about: ${topic}

${languageBlock(kind)}

Style for this batch: ${ANGLES[angle]}

Rules:
- Keep each title short: about 40 to 55 characters, never more than ${MAX_TITLE_LENGTH}.
- Put the main keyword in the first few words.
- Be specific and honest. Only promise what the video can deliver.
- Do NOT invent numbers, times or results. Use a number or a time (like "in 5 minutes") only if the topic itself contains it. List numbers like "5 Mistakes" are fine.
- Do NOT use hype like "10x", "guaranteed" or "you won't believe".
- Never write the word "Tenglish" and never label the language.
- Output exactly ${ask} lines: one title per line, no numbering, no bullets, no quotes, no headings, no blank lines.
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

// Keeps only the lines that really belong in this batch.
function acceptLines(raw, kind) {
  const clean = parseLines(raw).filter((text) => {
    if (BANNED.test(text)) return false;
    const letters = teluguLetters(text);
    return kind === "english" ? letters === 0 : letters >= 3;
  });
  const fits = clean.filter((text) => lengthOf(text) <= MAX_TITLE_LENGTH);
  // If every title is too long, still return them rather than nothing.
  return fits.length ? fits : clean;
}

async function callModel(topic, kind, ask, angle) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    signal: typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(CALL_TIMEOUT_MS) : undefined,
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content: "You are a YouTube SEO expert who writes accurate, specific, clickable titles. You never exaggerate or promise results a video cannot deliver.",
        },
        { role: "user", content: buildPrompt(topic, kind, ask, angle) },
      ],
      temperature: 0.8,
      max_tokens: kind === "telugu" ? 3500 : 1500,
    }),
  });
  const data = await response.json();
  const choice = data && data.choices && data.choices[0];
  return {
    ok: response.ok,
    status: response.status,
    data,
    content: choice && choice.message ? choice.message.content : "",
    finish: choice ? choice.finish_reason : null,
  };
}

// One batch = one language + one style. Retries once when the batch comes back too short.
async function runBatch({ kind, target, angle }, topic, startedAt) {
  const ask = target + EXTRA_ASKED;
  const need = Math.ceil(target / 2);
  const seen = new Set();
  const kept = [];
  const info = { kind, angle, attempts: [], upstreamError: null };

  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt === 2 && (kept.length >= need || Date.now() - startedAt > RETRY_ONLY_BEFORE_MS)) break;
    let result;
    try {
      result = await callModel(topic, kind, ask, angle);
    } catch (err) {
      info.attempts.push({ error: String(err && err.message ? err.message : err) });
      continue;
    }
    if (!result.ok) {
      info.upstreamError = { status: result.status, data: result.data };
      info.attempts.push({ status: result.status });
      continue;
    }
    const accepted = acceptLines(result.content, kind);
    for (const text of accepted) {
      const key = text.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        kept.push(text);
      }
    }
    info.attempts.push({ finish: result.finish, accepted: accepted.length });
  }

  if (kept.length < need) {
    console.warn("title batch short:", kind, angle, "kept", kept.length, "of", target);
  }
  return { titles: kept.slice(0, target), info };
}

function batchesFor(language) {
  if (language === "english") {
    return [
      { kind: "english", target: 10, angle: "a" },
      { kind: "english", target: 10, angle: "b" },
    ];
  }
  if (language === "telugu") {
    return [
      { kind: "telugu", target: 10, angle: "a" },
      { kind: "telugu", target: 10, angle: "b" },
    ];
  }
  return [
    { kind: "english", target: 10, angle: "mixed" },
    { kind: "telugu", target: 10, angle: "mixed" },
  ];
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

    const startedAt = Date.now();
    const results = await Promise.all(
      batchesFor(language).map((batch) => runBatch(batch, topic, startedAt))
    );

    const seen = new Set();
    const titles = [];
    for (const r of results) {
      for (const text of r.titles) {
        const key = text.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          titles.push(text);
        }
      }
    }

    if (!titles.length) {
      const upstream = results.map((r) => r.info.upstreamError).find(Boolean);
      if (upstream) {
        return res.status(upstream.status).json(upstream.data);
      }
      return res.status(502).json({ error: "The AI returned no titles. Please try again." });
    }

    const payload = { titles: titles.join("\n"), language };
    if (body.debug === true) {
      payload.debug = results.map((r) => r.info);
    }
    return res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
