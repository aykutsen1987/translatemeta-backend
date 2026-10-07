const env = (name, fallback = '') => (process.env[name] || fallback).trim();

module.exports = {
  geminiKey: () => env('GEMINI_API_KEY'),
  geminiModel: () => env('GEMINI_MODEL', 'gemini-3.5-flash'),
  deepseekKey: () => env('DEEPSEEK_API_KEY'),
  deepseekModel: () => env('DEEPSEEK_MODEL', 'deepseek-v4-flash'),
  openaiKey: () => env('OPENAI_API_KEY'),
  sttModel: () => env('OPENAI_STT_MODEL', 'whisper-1'),
  nllbUrl: () => env('NLLB_API_URL'),
  hfKey: () => env('HF_API_KEY'),
};
