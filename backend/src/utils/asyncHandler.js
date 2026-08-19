/**
 * Wraps an async Express handler and forwards rejected promises to `next`.
 * @param {import('express').RequestHandler} fn - Async route handler.
 * @returns {import('express').RequestHandler} Wrapped handler.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
