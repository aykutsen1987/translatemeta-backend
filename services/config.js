const env = (name, fallback = '') => (process.env[name] || fallback).trim();

module.exports = {
  geminiKey: () => env('GEMINI_API_KEY'),
  geminiModel: () => env('GEMINI_MODEL', 'gemini-3.5-flash'),
  deepseekKey: () => env('DEEPSEEK_API_KEY'),
  deepseekModel: () => env('DEEPSEEK_MODEL', 'deepseek-v4-flash'),
  groqKey: () => env('GROQ_API_KEY'),
  groqModel: () => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  groqSttModel: () => env('GROQ_STT_MODEL', 'whisper-large-v3-turbo'),
  openaiKey: () => env('OPENAI_API_KEY'),
  sttModel: () => env('OPENAI_STT_MODEL', 'whisper-1'),
  nllbUrl: () => env('NLLB_API_URL'),
  hfKey: () => env('HF_API_KEY'),
};
