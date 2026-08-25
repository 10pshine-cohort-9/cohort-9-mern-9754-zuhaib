/**
 * Operational application error with HTTP status and optional machine code.
 */
class AppError extends Error {
  /**
   * @param {string} message - Safe message to return to the client.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {string} [code='APP_ERROR'] - Stable error code for clients.
   */
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

module.exports = AppError;
