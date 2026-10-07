require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : '*',
  methods: ['GET', 'POST'],
}));
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));
app.use(express.json({ limit: '15mb' }));

app.use('/api/v1/health', require('./routes/health'));
app.use('/api/v1/languages', require('./routes/languages'));
app.use('/api/v1/translate', require('./routes/translate'));
app.use('/api/v1/call', require('./routes/call'));

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.use((err, req, res, next) => {
  const status = err.status || (err.type === 'entity.too.large' ? 413 : 400);
  res.status(status).json({ error: err.type === 'entity.too.large' ? 'Payload too large' : 'Bad request' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`TranslateMeta API listening on ${port}`));
}

module.exports = app;
