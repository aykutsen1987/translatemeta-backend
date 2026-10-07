const express = require('express');
const config = require('../services/config');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TranslateMeta API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    providers: {
      gemini: Boolean(config.geminiKey()),
      deepseek: Boolean(config.deepseekKey()),
      whisper: Boolean(config.openaiKey()),
      nllb: Boolean(config.nllbUrl()),
    },
  });
});

module.exports = router;
