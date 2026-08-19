const { testConnection } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Confirms API and database connectivity.
 * @type {import('express').RequestHandler}
 */
const healthCheck = asyncHandler(async (req, res) => {
  await testConnection();

  res.status(200).json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  healthCheck,
};
