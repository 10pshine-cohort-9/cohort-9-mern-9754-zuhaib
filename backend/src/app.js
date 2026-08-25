const { randomUUID } = require('crypto');
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./config/logger');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    genReqId(req, res) {
      const headerId = req.headers['x-request-id'];
      const id = typeof headerId === 'string' && headerId.trim() ? headerId.trim() : randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    customLogLevel(req, res, err) {
      if (res.statusCode >= 500 || err) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
