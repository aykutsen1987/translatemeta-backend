// Health route
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'TranslateMeta Backend',
    version: '1.0.0',
    developer: '@aykutsen1987',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
