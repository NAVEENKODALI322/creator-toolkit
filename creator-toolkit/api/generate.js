import { normalizeLanguage, isKnownLanguage, languageBlock as langBlock, LANGS } from "../lib/languages.js";

// Shared AI endpoint for the newer tools, so the site stays within Vercel's function limit.
// POST { tool: "shorts" | "ideas" | "thumbtext" | "replies", topic, language: "mix" | "english" | "telugu",
//        seconds?: 30 | 45 | 60 (shorts), context?: video topic (replies), tone?: see TONES (replies) }
// Response: { text: "..." }
//
// Like the title and hook APIs, the prompts forbid invented numbers, income claims and hype,
// because a creator would have to say these lines on camera as their own.

const MAX_TOPIC_LENGTH = 200;
const CALL_TIMEOUT_MS = 9000;
const TOOLS = ["shorts", "ideas", "thumbtext", "replies"];
const MAX_COMMENT_LENGTH = 600;
const TONES = {
  friendly: "warm and friendly, like talking to a regular viewer",
  thanks: "grateful, thanking the viewer for watching and commenting",
  answer: "helpful, directly answering the viewer's question in simple steps",
  critical: "calm and respectful, acknowledging fair points in criticism without arguing or getting defensive",
};

const RATE_LIMIT_MESSAGE = "Too many people are using the AI tools right now. Please wait a minute and try again.";
const UPSTREAM_MESSAGE = "The AI service is busy or unavailable at the moment. Please try again in a moment.";

const HYPE = /\b(six[- ]?figures?|seven[- ]?figures?|millionaire|get rich|overnight|guaranteed?|you won['’]?t believe|10x|100x|tenglish)\b/gi;

function languageBlock(language) {
  return langBlock(language);
}

const HONESTY = `Honesty rules:
- Do NOT invent numbers, statistics, prices, income, view counts or results. Use a number only if the topic contains it. A list count like "3 tips" is fine.
- Do NOT claim the creator earned money or got views. No fake personal stories.
- Do NOT use hype words like "guaranteed", "overnight", "get rich", "10x" or "you won't believe".
- Never write the word "Tenglish" and never label the language.`;

function shortsPrompt(topic, language, seconds) {
  const lines = seconds <= 30 ? "5 to 6" : seconds <= 45 ? "7 to 8" : "9 to 11";
  return `Write a ${seconds}-second YouTube Shorts / Instagram Reels script about: ${topic}

${languageBlock(language)}

Use exactly this plain-text layout (keep the English section labels as written):

HOOK (0-3 sec):
<one line the creator says to stop the scroll>

SCRIPT:
<${lines} short spoken lines, one per line, each starting with its time range like "3-8 sec:">

ON-SCREEN TEXT:
<3 to 4 very short captions to show on screen, one per line>

CTA:
<one short closing line asking viewers to follow, comment or watch the full video>

Rules:
- Spoken lines must be short and easy to say in one breath.
- The script must fit ${seconds} seconds at a normal speaking speed.
- Give real, practical steps or points about the topic, not filler.
- If the topic names a region, language or culture (for example Telugu, Tamil Nadu, Punjab, Bengal), stay true to it.
- No markdown, no asterisks, no emojis in the spoken lines.

${HONESTY}`;
}

function ideasPrompt(topic, language) {
  return `Suggest 10 YouTube video ideas for a channel about: ${topic}

${languageBlock(language)}

For each idea write exactly two lines, then a blank line:
<number>. <a working video title, under 60 characters>
Why it works: <one sentence on the viewer problem it solves or the search it answers>

Rules:
- Mix formats: how-to tutorials, beginner mistakes, comparisons, step-by-step guides, myths, and questions people search.
- Make every idea specific to the topic. No generic ideas that fit any channel.
- If the topic names a region, language or culture (for example Telugu, Tamil Nadu, Punjab, Bengal), every idea must belong to it. Do not drift to dishes, places or customs from other regions.
- Ideas should be things a small creator can actually film with a phone.
- No markdown, no asterisks, no headings, no intro or closing text.

${HONESTY}`;
}

function thumbTextPrompt(topic, language) {
  return `Suggest 10 short THUMBNAIL TEXT options (the big words written on a YouTube thumbnail) for a video about: ${topic}

${languageBlock(language)}

Rules:
- Each option is 2 to 4 words, never more than 25 characters. Thumbnail text must be readable on a small phone screen.
- Do NOT repeat the video title. Thumbnail text should add curiosity or show the result, while the title explains the topic.
- Mix styles: the result or outcome, a short question, a before/after contrast, a warning or mistake, and a single bold word.
- Output exactly 10 lines, one option per line, no numbering, no quotes, no emojis.

${HONESTY}`;
}

function repliesPrompt(comment, context, language, tone) {
  return `A viewer left this comment on a YouTube video${context ? ` about "${context}"` : ""}:
"""${comment}"""

Write 3 different replies the creator could post. Tone: ${TONES[tone] || TONES.friendly}.

${languageBlock(language)}

Rules:
- Each reply is 1 to 3 short sentences. Sound like a real person, not a brand.
- Reply to what the viewer actually said. If they asked a question you cannot answer from the comment, say you will help and ask one short follow-up question instead of guessing.
- Never insult the viewer, argue, or promise things the creator may not do (like "I will make a video tomorrow").
- If the comment is spam or abusive, write polite short replies or suggest not replying.
- Output the 3 replies separated by a blank line, each starting with "Reply 1:", "Reply 2:" and "Reply 3:". No markdown.

${HONESTY}`;
}

// Time, money and result claims a video may not deliver (same rule as the title API).
const INVENTED_NUMBER = /\d\s*-?\s*(?:minutes?|mins?|seconds?|secs?|hours?|days?|weeks?|months?|years?|x|views|subscribers|subs|lakhs?|crores?|k)\b|\d\s*(?:నిమిషా|నిమిష|గంట|రోజు|రోజుల|సెకన)|\d\s*%|[$₹]\s*\d/i;

function graphemeCount(text) {
  try { return [...new Intl.Segmenter("te", { granularity: "grapheme" }).segment(text)].length; }
  catch { return [...text].length; }
}

// Thumbnail text must be short and must not promise times or results the topic does not mention.
function filterThumbText(text, topic) {
  const topicHasNumber = /\d/.test(topic);
  const lines = String(text || "").split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, "").replace(/^["“”']+|["“”']+$/g, "").trim())
    .filter(Boolean)
    .filter((l) => topicHasNumber || !INVENTED_NUMBER.test(l));
  const short = lines.filter((l) => l.split(/\s+/).length <= 4 && graphemeCount(l) <= 28);
  return (short.length >= 5 ? short : lines).join("\n");
}

function cleanOutput(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(HYPE, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function callModel(prompt, language) {
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
          content: "You are an experienced YouTube creator coach for Indian creators who make videos in many Indian languages. You write practical, honest, specific content and never exaggerate.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: language.lang === "english" ? 1800 : 4000, // Telugu script uses many more tokens
    }),
  });
  const data = await response.json().catch(() => ({}));
  const choice = data && data.choices && data.choices[0];
  return {
    ok: response.ok,
    status: response.status,
    content: choice && choice.message ? choice.message.content : "",
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed. Use POST." });

  try {
    const body = req.body || {};
    const tool = TOOLS.includes(body.tool) ? body.tool : null;
    const language = normalizeLanguage(isKnownLanguage(body.language) ? body.language : "english");
    const topic = String(body.topic || "").replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH);
    const seconds = [30, 45, 60].includes(Number(body.seconds)) ? Number(body.seconds) : 60;

    if (!tool) return res.status(400).json({ error: "Unknown tool." });
    if (!topic) return res.status(400).json({ error: "Please enter a topic." });
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: API key not set." });
    }

    const context = String(body.context || "").replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH);
    const tone = Object.prototype.hasOwnProperty.call(TONES, body.tone) ? body.tone : "friendly";
    const comment = String(body.topic || "").replace(/\s+/g, " ").trim().slice(0, MAX_COMMENT_LENGTH);
    const prompt =
      tool === "shorts" ? shortsPrompt(topic, language, seconds)
      : tool === "ideas" ? ideasPrompt(topic, language)
      : tool === "thumbtext" ? thumbTextPrompt(topic, language)
      : repliesPrompt(comment, context, language, tone);

    let result = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await callModel(prompt, language);
      } catch (err) {
        console.warn("generate call failed:", err && err.message);
        result = null;
        continue;
      }
      if (result.ok && cleanOutput(result.content).length > 40) break;
      if (result.status === 429) break; // do not hammer the AI service when it is rate limiting
    }

    if (!result) return res.status(502).json({ error: UPSTREAM_MESSAGE });
    if (!result.ok) {
      console.error("generate upstream error:", result.status);
      return res
        .status(result.status === 429 ? 429 : 502)
        .json({ error: result.status === 429 ? RATE_LIMIT_MESSAGE : UPSTREAM_MESSAGE });
    }
    let text = cleanOutput(result.content);
    if (tool === "thumbtext") text = filterThumbText(text, topic);
    if (text.length <= 40) return res.status(502).json({ error: "The AI returned an empty answer. Please try again." });

    return res.status(200).json({ text, tool, language: language.value });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
