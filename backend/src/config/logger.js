const pino = require('pino');

const nodeEnv = process.env.NODE_ENV || 'development';
const level = process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug');
const usePretty = nodeEnv !== 'production' && nodeEnv !== 'test' && level !== 'silent';

/**
 * Shared Pino logger. Secrets and credentials are redacted.
 */
const logger = pino({
  level,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'password_hash',
      'token',
      'jwt',
      'authorization',
      'req.headers.authorization',
      'headers.authorization',
    ],
    censor: '[Redacted]',
  },
  ...(usePretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

module.exports = logger;
