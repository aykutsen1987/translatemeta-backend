const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/translate', async (req, res) => {
  const { audio_base64, source_language, target_language, session_id } = req.body;
  if (!audio_base64 || !source_language || !target_language) return res.status(400).json({ error: 'Missing required fields' });
  const startTime = Date.now();
  try {
    const audioBuffer = Buffer.from(audio_base64, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'call.wav', contentType: 'audio/wav' });
    form.append('model', 'whisper-1');
    form.append('language', source_language);
    const sttResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    const transcript = sttResponse.data.text;
    const { translateWithGemini } = require('../services/translationService');
    const { translatedText } = await translateWithGemini(transcript, source_language, target_language);
    res.json({ transcript, translated_text: translatedText, session_id, latency_ms: Date.now() - startTime, model_used: 'whisper+gemini_flash' });
  } catch (e) {
    res.status(500).json({ error: 'Live call translation failed', details: e.message });
  }
});

module.exports = router;