function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      const status = e.status || 500;
      console.error(`${req.method} ${req.originalUrl} -> ${status}: ${e.message}`);
      res.status(status).json({ error: status === 503 ? e.message : 'Request failed', details: e.message });
    }
  };
}

module.exports = { handle };
