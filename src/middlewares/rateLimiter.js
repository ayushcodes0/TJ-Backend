// src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  handler: (req, res, next) => {
    // Log rate limit violations
    console.warn(`[RATE LIMIT] General API limit exceeded:`, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      resetTime: new Date(req.rateLimit.resetTime).toISOString()
    });

    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Trade-specific rate limiter (more restrictive)
const tradeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 trade operations per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if available (from auth token), otherwise use IP
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    message: 'Too many trade operations, please slow down. Try again in 5 minutes.',
    retryAfter: '5 minutes'
  },
  handler: (req, res, next) => {
    // Log trade-specific rate limit violations
    console.warn(`[RATE LIMIT] Trade limit exceeded:`, {
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      resetTime: new Date(req.rateLimit.resetTime).toISOString(),
      tradeOperation: req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : req.method === 'DELETE' ? 'DELETE' : 'READ'
    });

    res.status(429).json({
      success: false,
      error: 'Trade rate limit exceeded',
      message: 'Too many trade operations, please slow down and try again in 5 minutes.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Auth rate limiter (most restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  handler: (req, res, next) => {
    // Log authentication rate limit violations
    console.warn(`[RATE LIMIT] Auth limit exceeded:`, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      resetTime: new Date(req.rateLimit.resetTime).toISOString(),
      attemptedEmail: req.body?.email || 'not provided'
    });

    res.status(429).json({
      success: false,
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

module.exports = {
  apiLimiter,
  tradeLimiter,
  authLimiter
};
