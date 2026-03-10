const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/whisper', async (req, res) => {
  const { audio_base64, source_language = 'auto', target_language } = req.body;
  if (!audio_base64 || !target_language) return res.status(400).json({ error: 'audio_base64 and target_language required' });
  try {
    const audioBuffer = Buffer.from(audio_base64, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
    form.append('model', 'whisper-1');
    if (source_language !== 'auto') form.append('language', source_language);
    const sttResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    const transcript = sttResponse.data.text;
    const { translateWithGemini } = require('../services/translationService');
    const { translatedText } = await translateWithGemini(transcript, source_language, target_language);
    res.json({ transcript, translated_text: translatedText, model_used: 'whisper+gemini_flash' });
  } catch (e) {
    res.status(500).json({ error: 'Speech translation failed', details: e.message });
  }
});

module.exports = router;