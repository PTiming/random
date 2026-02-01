/**
 * Simple in-memory rate limiter middleware
 * For production, consider using express-rate-limit with Redis store
 */

const rateLimitStore = new Map();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Create rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later.'
  } = options;

  return (req, res, next) => {
    // Use IP + route as key
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();

    let data = rateLimitStore.get(key);

    if (!data || data.resetTime < now) {
      // Create new window
      data = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, data);
      return next();
    }

    if (data.count >= max) {
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    data.count++;
    return next();
  };
};

// Pre-configured limiters for different use cases
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again after 15 minutes.'
});

const apiLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests
  message: 'Too many requests, please try again later.'
});

const createPostLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10, // 10 posts per minute
  message: 'Too many posts, please slow down.'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  createPostLimiter
};
