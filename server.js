require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const translateRoutes = require('./routes/translate');
const speechRoutes = require('./routes/speech');
const languageRoutes = require('./routes/languages');
const callRoutes = require('./routes/call');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
}));

// Rate limiting - protect API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1/translate', translateRoutes);
app.use('/api/v1/speech', speechRoutes);
app.use('/api/v1/languages', languageRoutes);
app.use('/api/v1/call', callRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TranslateMeta API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 TranslateMeta API running on port ${PORT}`);
});

module.exports = app;
