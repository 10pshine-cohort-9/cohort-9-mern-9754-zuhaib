const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

/**
 * Starts the HTTP server after verifying the database connection.
 * @returns {Promise<void>}
 */
async function start() {
  try {
    await testConnection();
    console.log('MySQL connection established.');

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
