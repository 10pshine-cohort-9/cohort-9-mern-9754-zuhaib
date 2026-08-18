const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Handles user registration requests.
 * @type {import('express').RequestHandler}
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    message: 'Registration successful.',
    data: result,
  });
});

/**
 * Handles user login requests.
 * @type {import('express').RequestHandler}
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    message: 'Login successful.',
    data: result,
  });
});

/**
 * Returns the authenticated user's profile.
 * @type {import('express').RequestHandler}
 */
const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json({
    data: { user },
  });
});

module.exports = {
  register,
  login,
  me,
};
