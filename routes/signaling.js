const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Create call room
router.post('/room/create', (req, res) => {
  const roomId = uuidv4();
  res.json({ roomId, createdAt: Date.now() });
});

// Signal endpoint (HTTP fallback for WebSocket)
router.post('/signal', (req, res) => {
  const { type, roomId, data } = req.body;
  res.json({ received: true, type, roomId, timestamp: Date.now() });
});

module.exports = router;
