const config = require('./config');
const { postJson, UpstreamError } = require('./http');
const { find, nameOf } = require('./languages');

function prompt(text, source, target) {
  const from = source === 'auto' ? 'the detected source language' : nameOf(source);
  return `Translate the following text from ${from} to ${nameOf(target)}. Return only the translated text, with no explanations, notes or quotation marks.\n\n${text}`;
}

function requireKey(value, name) {
  if (!value) throw new UpstreamError(`${name} is not configured`, 503);
  return value;
}

function geminiText(data) {
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
  const text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join('').trim();
  if (!text) throw new UpstreamError('Gemini returned an empty response', 502);
  return text;
}

async function gemini(parts) {
  const key = requireKey(config.geminiKey(), 'GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel())}:generateContent`;
  const data = await postJson(url, { contents: [{ role: 'user', parts }] }, { 'x-goog-api-key': key }, 45000);
  return geminiText(data);
}

async function chat(url, key, model, text, source, target, label) {
  const data = await postJson(
    url,
    {
      model,
      messages: [
        { role: 'system', content: 'You are a professional translator. Return only the translation.' },
        { role: 'user', content: prompt(text, source, target) },
      ],
      temperature: 0.1,
      stream: false,
    },
    { Authorization: `Bearer ${key}` },
    60000
  );
  const out = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!out || !out.trim()) throw new UpstreamError(`${label} returned an empty response`, 502);
  return out.trim();
}

const providers = {
  gemini_flash: {
    configured: () => Boolean(config.geminiKey()),
    translate: (text, source, target) => gemini([{ text: prompt(text, source, target) }]),
  },
  deepseek: {
    configured: () => Boolean(config.deepseekKey()),
    translate: (text, source, target) =>
      chat('https://api.deepseek.com/chat/completions', requireKey(config.deepseekKey(), 'DEEPSEEK_API_KEY'), config.deepseekModel(), text, source, target, 'DeepSeek'),
  },
  groq: {
    configured: () => Boolean(config.groqKey()),
    translate: (text, source, target) =>
      chat('https://api.groq.com/openai/v1/chat/completions', requireKey(config.groqKey(), 'GROQ_API_KEY'), config.groqModel(), text, source, target, 'Groq'),
  },
  meta_nllb: {
    configured: () => Boolean(config.nllbUrl()),
    async translate(text, source, target) {
      const url = requireKey(config.nllbUrl(), 'NLLB_API_URL');
      const src = find(source) && find(source).nllb;
      const tgt = find(target) && find(target).nllb;
      if (!src || !tgt) throw new UpstreamError('Language not supported by NLLB', 400);
      const headers = config.hfKey() ? { Authorization: `Bearer ${config.hfKey()}` } : {};
      const data = await postJson(url, { inputs: text, parameters: { src_lang: src, tgt_lang: tgt } }, headers, 60000);
      const first = Array.isArray(data) ? data[0] : data;
      const out = first && (first.translation_text || first.generated_text);
      if (!out) throw new UpstreamError('NLLB returned an empty response', 502);
      return out.trim();
    },
  },
};

async function ocrTranslate(imageBase64, source, target) {
  const from = source === 'auto' ? 'the detected language' : nameOf(source);
  const instruction = `Read all text in this image and translate it from ${from} to ${nameOf(target)}. Return only the translated text.`;
  return gemini([{ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }, { text: instruction }]);
}

module.exports = { providers, ocrTranslate };
