const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { corsOptions } = require('./config/cors');
const { env } = require('./config/env');
const { uploadsRootPath } = require('./data/teacher-portals.repository');
const { errorHandler } = require('./middleware/error-handler');
const { notFoundHandler } = require('./middleware/not-found');
const { requestContext } = require('./middleware/request-context');
const { apiRouter } = require('./routes');

const app = express();
const webDistPath = path.resolve(__dirname, '../../dist/apps/web');
const webIndexPath = path.join(webDistPath, 'index.html');
const hasBuiltWebApp = fs.existsSync(webIndexPath);

app.disable('x-powered-by');
app.use(requestContext);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/media', express.static(uploadsRootPath));

app.get('/', (_req, res) => {
  if (hasBuiltWebApp) {
    res.sendFile(webIndexPath);
    return;
  }

  res.json({
    message: 'Eduvirse backend is running.',
    docs: `${env.apiPrefix}`,
    timestamp: new Date().toISOString(),
  });
});

app.use(env.apiPrefix, apiRouter);

if (hasBuiltWebApp) {
  app.use(express.static(webDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith(env.apiPrefix)) {
      next();
      return;
    }

    res.sendFile(webIndexPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
