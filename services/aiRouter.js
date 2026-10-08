const { isRare } = require('./languages');
const { providers } = require('./providers');

const LONG_TEXT = 500;
const ORDER = ['gemini_flash', 'groq', 'deepseek', 'meta_nllb'];
const ALIASES = { gemini: 'gemini_flash', gemini_flash: 'gemini_flash', groq: 'groq', deepseek: 'deepseek', nllb: 'meta_nllb', meta_nllb: 'meta_nllb' };

function routeModel({ text = '', sourceLanguage = 'auto', targetLanguage }) {
  if ((isRare(sourceLanguage) || isRare(targetLanguage)) && providers.meta_nllb.configured()) return 'meta_nllb';
  if (text.length > LONG_TEXT && providers.deepseek.configured()) return 'deepseek';
  return 'gemini_flash';
}

function candidates(preferred) {
  const first = ALIASES[preferred];
  const rest = ORDER.filter((id) => id !== first && providers[id].configured());
  return first ? [first, ...rest] : rest;
}

async function translate({ text, sourceLanguage = 'auto', targetLanguage, model }) {
  const preferred = ALIASES[model] ? model : routeModel({ text, sourceLanguage, targetLanguage });
  const order = candidates(preferred);
  let lastError;
  for (const id of order) {
    try {
      const translatedText = await providers[id].translate(text, sourceLanguage, targetLanguage);
      return { translatedText, modelUsed: id };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || Object.assign(new Error('No translation provider configured'), { status: 503 });
}

module.exports = { routeModel, translate };
