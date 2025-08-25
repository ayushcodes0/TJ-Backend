// src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { analyzeTrades, testAIConnection } = require('../controllers/aiController');
const auth = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

// Create AI-specific rate limiter - FIXED
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  // FIX: Simple keyGenerator without complex IP manipulation
  keyGenerator: (req) => {
    // Use user ID if available, otherwise IP
    return req.user?.id ? `user:${req.user.id}` : req.ip;
  },
  // FIX: Disable IPv6 validation
  validate: {
    keyGeneratorIpFallback: false
  },
  message: {
    success: false,
    message: 'Too many AI analysis requests, please slow down. Try again in 1 minute.',
    retryAfter: '1 minute'
  },
  handler: (req, res, next) => {
    console.warn(`[RATE LIMIT] AI analysis limit exceeded:`, {
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      resetTime: new Date(req.rateLimit.resetTime).toISOString(),
      endpoint: req.path
    });

    res.status(429).json({
      success: false,
      error: 'AI analysis rate limit exceeded',
      message: 'Too many AI analysis requests, please slow down and try again in 1 minute.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Apply AI rate limiter and auth to analyze endpoint
router.post('/analyze', aiLimiter, analyzeTrades);

// Test endpoint (no auth required, but rate limited)
router.get('/test', aiLimiter, testAIConnection);

module.exports = router;
