const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { testConnection } = require('./config/db');

/**
 * Starts the HTTP server after verifying the database connection.
 * @returns {Promise<void>}
 */
async function start() {
  try {
    await testConnection();
    logger.info({ database: env.db.database }, 'MySQL connection established');

    app.listen(env.port, () => {
      logger.info({ port: env.port, env: env.nodeEnv }, 'Server started');
    });
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed during startup');
    process.exit(1);
  }
}

start();
