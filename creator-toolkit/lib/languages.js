// Shared language support for every AI endpoint.
//
// Request values (the "language" field):
//   "english"                         pure English
//   "<lang>"        e.g. "hindi"      pure <lang> in its own script (brand names may stay in English)
//   languages: hindi telugu tamil kannada malayalam marathi bengali gujarati punjabi odia urdu assamese bhojpuri
//   "<lang>-mix"    e.g. "hindi-mix"  <lang> + English mixed, the way creators actually talk
//   "mix"                             legacy value = "telugu-mix" (kept for the website's old pages and the mobile app)
//   "telugu"                          pure Telugu (legacy value, same meaning as before)

export const LANGS = {
  hindi:     { name: "Hindi",     native: "हिन्दी",   script: "Devanagari", range: /[ऀ-ॿ]/g, sample: "Instagram पर Followers कैसे बढ़ाएं? 5 Easy Tips" },
  telugu:    { name: "Telugu",    native: "తెలుగు",   script: "Telugu",     range: /[ఀ-౿]/g, sample: "Instagram లో Followers పెంచుకోవడం ఎలా? 5 Easy Tips" },
  tamil:     { name: "Tamil",     native: "தமிழ்",    script: "Tamil",      range: /[஀-௿]/g, sample: "Instagram-ல Followers அதிகரிப்பது எப்படி? 5 Easy Tips" },
  kannada:   { name: "Kannada",   native: "ಕನ್ನಡ",    script: "Kannada",    range: /[ಀ-೿]/g, sample: "Instagram ನಲ್ಲಿ Followers ಹೆಚ್ಚಿಸುವುದು ಹೇಗೆ? 5 Easy Tips" },
  malayalam: { name: "Malayalam", native: "മലയാളം",  script: "Malayalam",  range: /[ഀ-ൿ]/g, sample: "Instagram-ൽ Followers കൂട്ടാൻ എങ്ങനെ? 5 Easy Tips" },
  marathi:   { name: "Marathi",   native: "मराठी",    script: "Devanagari", range: /[ऀ-ॿ]/g, sample: "Instagram वर Followers कसे वाढवायचे? 5 Easy Tips" },
  bengali:   { name: "Bengali",   native: "বাংলা",    script: "Bengali",    range: /[ঀ-৿]/g, sample: "Instagram-এ Followers কীভাবে বাড়াবেন? 5 Easy Tips" },
  gujarati:  { name: "Gujarati",  native: "ગુજરાતી",  script: "Gujarati",   range: /[઀-૿]/g, sample: "Instagram પર Followers કેવી રીતે વધારવા? 5 Easy Tips" },
  punjabi:   { name: "Punjabi",   native: "ਪੰਜਾਬੀ",   script: "Gurmukhi",   range: /[਀-੿]/g, sample: "Instagram ਤੇ Followers ਕਿਵੇਂ ਵਧਾਈਏ? 5 Easy Tips" },
  odia:      { name: "Odia",      native: "ଓଡ଼ିଆ",    script: "Odia",       range: /[଀-୿]/g, sample: "Instagram ରେ Followers କିପରି ବଢ଼ାଇବେ? 5 Easy Tips" },
  urdu:      { name: "Urdu",      native: "اردو",     script: "Urdu (Perso-Arabic, right to left)", range: /[؀-ۿݐ-ݿ]/g, sample: "Instagram پر Followers کیسے بڑھائیں؟ 5 Easy Tips",
               note: "Write Urdu in Urdu script, not Hindi in Devanagari." },
  assamese:  { name: "Assamese",  native: "অসমীয়া",  script: "Assamese (Bengali-Assamese)", range: /[ঀ-৿]/g, sample: "Instagram ত Followers কেনেকৈ বঢ়াব? 5 Easy Tips",
               note: "Write Assamese, not Bengali: use Assamese words and the letters ৰ and ৱ." },
  bhojpuri:  { name: "Bhojpuri",  native: "भोजपुरी",  script: "Devanagari", range: /[ऀ-ॿ]/g, sample: "Instagram पर Followers कइसे बढ़ाईं? 5 Easy Tips",
               note: "Write real Bhojpuri the way Bhojpuri creators speak (for example बा, रहल, कइसे, हमनी), not standard Hindi." },
};

// Returns { lang: "english" | key of LANGS, mix: boolean, value: canonical string }.
export function normalizeLanguage(value, fallback = "english") {
  const v = String(value || "").toLowerCase().trim();
  if (v === "english") return { lang: "english", mix: false, value: "english" };
  if (v === "mix") return { lang: "telugu", mix: true, value: "telugu-mix" };
  const m = v.match(/^([a-z]+)(-mix)?$/);
  if (m && LANGS[m[1]]) return { lang: m[1], mix: !!m[2], value: v };
  return fallback === "english" ? { lang: "english", mix: false, value: "english" } : normalizeLanguage(fallback);
}

export function isKnownLanguage(value) {
  const v = String(value || "").toLowerCase().trim();
  if (v === "english" || v === "mix") return true;
  const m = v.match(/^([a-z]+)(-mix)?$/);
  return !!(m && LANGS[m[1]]);
}

export function languageName(L) {
  if (L.lang === "english") return "English";
  return LANGS[L.lang].name + (L.mix ? " + English mix" : "");
}

// Prompt block telling the model which language and script to write in.
export function languageBlock(L) {
  if (L.lang === "english") {
    return "Language: simple, natural ENGLISH. Do not use any Indian-language words or scripts.";
  }
  const info = LANGS[L.lang];
  if (!L.mix) {
    return `Language: natural, everyday ${info.name.toUpperCase()}, written in ${info.script} script (${info.native}).
- Only well-known brand or tool names (YouTube, Instagram, Canva, Android) may stay in English letters.
- Do not write ${info.name} words in English letters.
- Use simple words a normal viewer speaks, not formal or bookish ${info.name}.${info.note ? "\n- " + info.note : ""}`;
  }
  return `Language: the ${info.name.toUpperCase()} + ENGLISH MIX that ${info.name} YouTubers actually speak.
- Write ${info.name} words in ${info.script} script (${info.native}), never in English letters.
- Keep tool names, brand names and common English words (video, tips, easy, mobile) in English.
- Mix both languages naturally in every line. Example of the style (another topic, never copy it): ${info.sample}${info.note ? "\n- " + info.note : ""}`;
}

function count(text, re) {
  const m = String(text).match(re);
  return m ? m.length : 0;
}

// Does a line fit the requested language? Used to drop lines in the wrong language.
export function matchesLanguage(text, L) {
  const latin = count(text, /[A-Za-z]/g);
  if (L.lang === "english") {
    return !/[؀-ۿऀ-෿]/.test(text);
  }
  const native = count(text, LANGS[L.lang].range);
  if (L.mix) return native >= 3 && latin >= 3;
  return native >= 6 && native >= 2 * latin;
}

// More tokens are needed for Indian scripts.
export function maxTokensFor(L, englishTokens, otherTokens) {
  return L.lang === "english" ? englishTokens : otherTokens;
}
