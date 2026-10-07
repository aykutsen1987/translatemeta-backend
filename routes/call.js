const express = require('express');
const { translate } = require('../services/aiRouter');
const { transcribe } = require('../services/speechService');
const { handle } = require('./handle');

const router = express.Router();

router.post('/translate', handle(async (req, res) => {
  const { audio_base64, source_language, target_language, session_id = '' } = req.body;
  if (!audio_base64 || !source_language || !target_language) {
    return res.status(400).json({ error: 'audio_base64, source_language and target_language are required' });
  }
  const started = Date.now();
  const transcript = await transcribe(audio_base64, source_language);
  if (!transcript) return res.status(422).json({ error: 'No speech detected' });
  const result = await translate({ text: transcript, sourceLanguage: source_language, targetLanguage: target_language });
  res.json({
    transcript,
    translated_text: result.translatedText,
    detected_language: source_language === 'auto' ? null : source_language,
    model_used: `whisper+${result.modelUsed}`,
    latency_ms: Date.now() - started,
    session_id,
  });
}));

module.exports = router;
