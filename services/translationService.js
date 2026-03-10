const axios = require('axios');

async function translateWithGemini(text, sourceLanguage, targetLanguage) {
  const prompt = `Translate to ${targetLanguage}. Return only translated text:\n\n${text}`;
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 2048 } }
  );
  const translatedText = response.data.candidates[0].content.parts[0].text.trim();
  return { translatedText, modelUsed: 'gemini_flash' };
}

async function translateWithDeepSeek(text, sourceLanguage, targetLanguage) {
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Professional translator. Return only the translation.' },
      { role: 'user', content: `Translate from ${sourceLanguage} to ${targetLanguage}:\n\n${text}` }
    ],
    temperature: 0.1, max_tokens: 4096
  }, { headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` } });
  return { translatedText: response.data.choices[0].message.content.trim(), modelUsed: 'deepseek' };
}

async function translateWithNLLB(text, sourceLanguage, targetLanguage) {
  const langMap = { 'tr':'tur_Latn','en':'eng_Latn','de':'deu_Latn','fr':'fra_Latn','es':'spa_Latn','ar':'arb_Arab','zh':'zho_Hans','ja':'jpn_Jpan','ko':'kor_Hang','ru':'rus_Cyrl','hi':'hin_Deva','sw':'swh_Latn' };
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',
    { inputs: text, parameters: { src_lang: langMap[sourceLanguage] || 'eng_Latn', tgt_lang: langMap[targetLanguage] || 'eng_Latn' } },
    { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
  );
  return { translatedText: response.data[0]?.translation_text || text, modelUsed: 'meta_nllb' };
}

module.exports = { translateWithGemini, translateWithDeepSeek, translateWithNLLB };