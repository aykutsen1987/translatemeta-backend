const express = require('express');
const { translate } = require('../services/aiRouter');
const { ocrTranslate } = require('../services/providers');
const { transcribe } = require('../services/speechService');
const { handle } = require('./handle');

const router = express.Router();

router.post('/text', handle(async (req, res) => {
  const { text, source_language = 'auto', target_language, model } = req.body;
  if (!text || !target_language) return res.status(400).json({ error: 'text and target_language are required' });
  const started = Date.now();
  const result = await translate({ text, sourceLanguage: source_language, targetLanguage: target_language, model });
  res.json({
    translated_text: result.translatedText,
    detected_language: source_language === 'auto' ? null : source_language,
    model_used: result.modelUsed,
    latency_ms: Date.now() - started,
  });
}));

router.post('/speech', handle(async (req, res) => {
  const { audio_base64, source_language = 'auto', target_language } = req.body;
  if (!audio_base64 || !target_language) return res.status(400).json({ error: 'audio_base64 and target_language are required' });
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
  });
}));

router.post('/image', handle(async (req, res) => {
  const { image_base64, source_language = 'auto', target_language } = req.body;
  if (!image_base64 || !target_language) return res.status(400).json({ error: 'image_base64 and target_language are required' });
  const started = Date.now();
  const translatedText = await ocrTranslate(image_base64, source_language, target_language);
  res.json({
    translated_text: translatedText,
    detected_language: null,
    model_used: 'gemini_flash',
    latency_ms: Date.now() - started,
  });
}));

module.exports = router;
