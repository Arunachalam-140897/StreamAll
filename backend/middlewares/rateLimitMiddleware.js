const rateLimit = require('express-rate-limit');
const { logError } = require('../utils/logger');

// Create rate limiter with default options
const createLimiter = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Too many requests, please try again later.'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message
    },
    handler: (req, res) => {
      logError(new Error('Rate limit exceeded'), {
        ip: req.ip,
        path: req.originalUrl
      });
      res.status(429).json({
        status: 'error',
        message
      });
    },
    skip: (req) => process.env.NODE_ENV === 'test' // Skip rate limiting in test environment
  });
};

// Specific rate limiters for different operations
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

const mediaUploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Upload limit reached, please try again later.'
});

const apiLimiter = createLimiter(); // Use default values

module.exports = {
  authLimiter,
  mediaUploadLimiter,
  apiLimiter,
  createLimiter
};