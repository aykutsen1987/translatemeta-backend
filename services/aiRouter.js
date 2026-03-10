const RARE_LANGUAGES = new Set(['sw','yo','ig','ha','am','so','ti','km','lo','my','si','ne','ky','tg','uz','tk','mn','ka','hy','az']);
const COMMON_LANGUAGES = new Set(['en','es','fr','de','it','pt','ru','ja','ko','zh','ar','hi','tr','nl','pl','sv','da','no','fi']);

function routeModel({ inputType, text, sourceLanguage }) {
  if (inputType === 'speech') return 'whisper';
  if (inputType === 'image')  return 'mlkit';
  const isRare = sourceLanguage !== 'auto' && (RARE_LANGUAGES.has(sourceLanguage) || !COMMON_LANGUAGES.has(sourceLanguage));
  if (isRare) return 'nllb';
  if ((text || '').length > 500) return 'deepseek';
  return 'gemini_flash';
}

module.exports = { routeModel };