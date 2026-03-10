const express = require('express');
const router = express.Router();
const { routeModel } = require('../services/aiRouter');
const { translateWithGemini, translateWithDeepSeek, translateWithNLLB } = require('../services/translationService');

router.post('/text', async (req, res) => {
  const { text, source_language = 'auto', target_language, model } = req.body;
  if (!text || !target_language) return res.status(400).json({ error: 'text and target_language required' });
  const startTime = Date.now();
  try {
    const selectedModel = model || routeModel({ inputType: 'text', text, sourceLanguage: source_language });
    let result;
    if (selectedModel === 'deepseek') result = await translateWithDeepSeek(text, source_language, target_language);
    else if (selectedModel === 'nllb') result = await translateWithNLLB(text, source_language, target_language);
    else result = await translateWithGemini(text, source_language, target_language);
    res.json({ ...result, detected_language: source_language, latency_ms: Date.now() - startTime });
  } catch (e) {
    res.status(500).json({ error: 'Translation failed', details: e.message });
  }
});

module.exports = router;