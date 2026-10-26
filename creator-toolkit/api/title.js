// Title generator API.
// Response shape is unchanged ({ titles: "line1\nline2..." }) because the Android/iOS app uses it too.
// Optional request fields:
//   language = "mix"     Telugu + English mixed inside every title (Telugu words in Telugu script)
//              "english" pure English
//              "telugu"  pure Telugu script (only well-known brand names stay in English)
//              missing   old behaviour used by the mobile app: 10 English + 10 Telugu-English mix
//   debug    = true  -> adds a small "debug" array (attempt counts, finish reasons) to the response
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

const LANGUAGES = ["mix", "english", "telugu"]; // anything else (or missing) = "both", the old default

// Phrases that overpromise or leak internal labels into the titles.
const BANNED = /\b(tenglish|guaranteed?|you won['’]?t believe|10x|100x)\b/i;
// Time, money and result claims a video may not deliver. Dropped unless the topic itself has a digit.
const INVENTED_NUMBER = /\d\s*-?\s*(?:minutes?|mins?|seconds?|secs?|hours?|days?|weeks?|months?|years?|x|views|subscribers|subs|lakhs?|crores?|k)\b|\d\s*%|[$₹]\s*\d/i;

const TELUGU_LETTER = /[\u0C00-\u0C7F]/g;
const LATIN_LETTER = /[A-Za-z]/g;

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}
const teluguLetters = (text) => countMatches(text, TELUGU_LETTER);
const latinLetters = (text) => countMatches(text, LATIN_LETTER);

function lengthOf(text) {
  try {
    const seg = new Intl.Segmenter("te", { granularity: "grapheme" });
    return [...seg.segment(text)].length;
  } catch {
    return [...text].length;
  }
}

// Does this line belong to the requested kind of batch?
//   english : no Telugu script at all
//   mix     : Telugu script AND English words in the same title
//   telugu  : mostly Telugu script (a brand name like "Canva" may stay in English)
function matchesKind(text, kind) {
  const te = teluguLetters(text);
  const la = latinLetters(text);
  if (kind === "english") return te === 0;
  if (kind === "mix") return te >= 3 && la >= 3;
  return te >= 6 && te >= 2 * la; // telugu
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
  if (kind === "telugu") {
    return `Language: PURE TELUGU, written in TELUGU SCRIPT (తెలుగు లిపి).
- Write the whole title in Telugu script. Translate the topic keyword into Telugu where it is natural (for example బిర్యానీ, వీడియో ఎడిటింగ్).
- Only very well-known brand or tool names (YouTube, Instagram, Canva, Android) may stay in English letters.
- Do not write Telugu words in English letters.
Examples of the style (other topics, never copy them):
ఇంట్లోనే పనీర్ బటర్ మసాలా ఇలా చేయండి
మొబైల్ లో వీడియో ఎడిటింగ్ సులభంగా నేర్చుకోండి
డబ్బు ఆదా చేయడానికి 5 సులభమైన మార్గాలు`;
  }
  return `Language: TELUGU-ENGLISH MIX, the way Telugu YouTubers write titles. Every title mixes Telugu and English words.
- Write the Telugu words in TELUGU SCRIPT (తెలుగు లిపి). Do not write Telugu words in English letters.
- Keep the topic keyword and any tool or brand names in English.
- EVERY title must contain at least three Telugu-script words AND some English words.
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
- Do NOT invent
