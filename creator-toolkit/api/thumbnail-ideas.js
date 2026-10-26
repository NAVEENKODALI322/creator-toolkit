// Vercel serverless route: /api/thumbnail-ideas
// Uses the same Groq setup as your other tools.
// If your other api files use "export default", change the last line style to match.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  var b = req.body || {};
  var topic = String(b.topic || '').trim().slice(0, 300);
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  var niche = String(b.niche || 'General').slice(0, 60);
  var mood = String(b.mood || 'Shocking / Curiosity').slice(0, 60);
  var lang = String(b.lang || 'Telugu').slice(0, 80);
  var face = b.face === 'no' ? 'no, use objects/graphics only' : 'yes, creator face is used';

  var prompt =
    'You are an expert YouTube thumbnail strategist for Indian creators, fluent in Telugu.\n' +
    'Video topic: ' + topic + '\nChannel type: ' + niche + '\nMood: ' + mood + '\n' +
    'Thumbnail text language: ' + lang + '\nFace on thumbnail: ' + face + '\n\n' +
    'Create exactly 5 DIFFERENT thumbnail concepts (different angle, layout and color scheme each).\n' +
    'Rules: thumbnail text must be 2 to 4 short punchy words, natural spoken Telugu in correct Telugu script ' +
    '(not transliterated English unless the language option says mix). High contrast, readable on a phone.\n' +
    'Return ONLY JSON in this shape: {"concepts":[{"text":"","meaning":"","emoji":"","expression":"","layout":"","visual":"","bg":"#hex","textColor":"#hex","accent":"#hex","why":""}]}\n' +
    'text = thumbnail text; meaning = English meaning; emoji = one emoji matching the expression/object; ' +
    'expression = face expression to shoot (or main object if no face); layout = where text/face/objects go; ' +
    'visual = background and props; why = one sentence on why it gets clicks.';

  try {
    var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use the SAME env var name your other API routes use
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        reasoning_effort: 'low',
        max_tokens: 4000,
        temperature: 1,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    var j = await r.json();
    if (!r.ok) return res.status(502).json({ error: (j.error && j.error.message) || 'AI error' });

    var text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
    var m = text.match(/\{[\s\S]*\}/);
    var data = JSON.parse(m ? m[0] : text);
    if (!data.concepts || !data.concepts.length) throw new Error('Empty');
    return res.status(200).json({ concepts: data.concepts.slice(0, 5) });
  } catch (e) {
    return res.status(500).json({ error: 'Could not generate ideas. Please try again.' });
  }
};
