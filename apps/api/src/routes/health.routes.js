const express = require('express');

const healthRouter = express.Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', (_req, res) => {
  res.json({
    success: true,
    status: 'ready',
  });
});

module.exports = { healthRouter };
