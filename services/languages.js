const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', native_name: 'Auto', flag: '🌐', nllb: null, rare: false },
  { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧', nllb: 'eng_Latn', rare: false },
  { code: 'tr', name: 'Turkish', native_name: 'Türkçe', flag: '🇹🇷', nllb: 'tur_Latn', rare: false },
  { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', nllb: 'deu_Latn', rare: false },
  { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', nllb: 'fra_Latn', rare: false },
  { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', nllb: 'spa_Latn', rare: false },
  { code: 'it', name: 'Italian', native_name: 'Italiano', flag: '🇮🇹', nllb: 'ita_Latn', rare: false },
  { code: 'pt', name: 'Portuguese', native_name: 'Português', flag: '🇵🇹', nllb: 'por_Latn', rare: false },
  { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', nllb: 'rus_Cyrl', rare: false },
  { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', nllb: 'jpn_Jpan', rare: false },
  { code: 'ko', name: 'Korean', native_name: '한국어', flag: '🇰🇷', nllb: 'kor_Hang', rare: false },
  { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', nllb: 'zho_Hans', rare: false },
  { code: 'ar', name: 'Arabic', native_name: 'العربية', flag: '🇸🇦', nllb: 'arb_Arab', rare: false },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳', nllb: 'hin_Deva', rare: false },
  { code: 'nl', name: 'Dutch', native_name: 'Nederlands', flag: '🇳🇱', nllb: 'nld_Latn', rare: false },
  { code: 'pl', name: 'Polish', native_name: 'Polski', flag: '🇵🇱', nllb: 'pol_Latn', rare: false },
  { code: 'sv', name: 'Swedish', native_name: 'Svenska', flag: '🇸🇪', nllb: 'swe_Latn', rare: false },
  { code: 'uk', name: 'Ukrainian', native_name: 'Українська', flag: '🇺🇦', nllb: 'ukr_Cyrl', rare: false },
  { code: 'el', name: 'Greek', native_name: 'Ελληνικά', flag: '🇬🇷', nllb: 'ell_Grek', rare: false },
  { code: 'he', name: 'Hebrew', native_name: 'עברית', flag: '🇮🇱', nllb: 'heb_Hebr', rare: false },
  { code: 'th', name: 'Thai', native_name: 'ไทย', flag: '🇹🇭', nllb: 'tha_Thai', rare: false },
  { code: 'vi', name: 'Vietnamese', native_name: 'Tiếng Việt', flag: '🇻🇳', nllb: 'vie_Latn', rare: false },
  { code: 'id', name: 'Indonesian', native_name: 'Bahasa Indonesia', flag: '🇮🇩', nllb: 'ind_Latn', rare: false },
  { code: 'sw', name: 'Swahili', native_name: 'Kiswahili', flag: '🇰🇪', nllb: 'swh_Latn', rare: true },
  { code: 'ha', name: 'Hausa', native_name: 'Hausa', flag: '🇳🇬', nllb: 'hau_Latn', rare: true },
  { code: 'yo', name: 'Yoruba', native_name: 'Yorùbá', flag: '🇳🇬', nllb: 'yor_Latn', rare: true },
  { code: 'zu', name: 'Zulu', native_name: 'isiZulu', flag: '🇿🇦', nllb: 'zul_Latn', rare: true },
  { code: 'am', name: 'Amharic', native_name: 'አማርኛ', flag: '🇪🇹', nllb: 'amh_Ethi', rare: true },
  { code: 'so', name: 'Somali', native_name: 'Soomaali', flag: '🇸🇴', nllb: 'som_Latn', rare: true },
];

const byCode = new Map(LANGUAGES.map((l) => [l.code, l]));

const find = (code) => byCode.get(String(code || '').toLowerCase());
const nameOf = (code) => (find(code) ? find(code).name : String(code));
const isRare = (code) => Boolean(find(code) && find(code).rare);
const publicList = () => LANGUAGES.map(({ code, name, native_name, flag }) => ({ code, name, native_name, flag }));

module.exports = { find, nameOf, isRare, publicList };
