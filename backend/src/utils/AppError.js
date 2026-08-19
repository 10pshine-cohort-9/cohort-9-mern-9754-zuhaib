/**
 * Application error with an HTTP status code for operational failures.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} [statusCode=500] - HTTP status code to return.
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = AppError;
