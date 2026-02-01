const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applies to most endpoints
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for authentication endpoints
 * Protects against brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for create operations (posts, comments, messages)
 * Prevents spam
 */
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 create requests per minute
  message: {
    success: false,
    message: 'Too many create requests, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for webhook endpoints
 * More permissive for server-to-server communication
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit to 200 webhook requests per minute
  message: {
    success: false,
    message: 'Webhook rate limit exceeded.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for notification endpoints
 */
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    success: false,
    message: 'Too many notification requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  webhookLimiter,
  notificationLimiter
};
