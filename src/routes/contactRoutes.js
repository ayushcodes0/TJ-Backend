// src/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const rateLimit = require('express-rate-limit');

// Create contact-specific rate limiter - FIXED
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 contact form submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  // FIX: Simple IP-based limiting
  keyGenerator: (req) => req.ip,
  // FIX: Disable IPv6 validation
  validate: {
    keyGeneratorIpFallback: false
  },
  message: {
    success: false,
    message: 'Too many contact form submissions from this IP, please try again after 1 hour.',
    retryAfter: '1 hour'
  },
  handler: (req, res, next) => {
    console.warn(`[RATE LIMIT] Contact form limit exceeded:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      resetTime: new Date(req.rateLimit.resetTime).toISOString(),
      formData: {
        email: req.body?.email || 'not provided',
        subject: req.body?.subject || 'not provided'
      }
    });

    res.status(429).json({
      success: false,
      error: 'Contact form rate limit exceeded',
      message: 'Too many contact form submissions from this IP, please try again after 1 hour.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

// Apply contact rate limiter to POST route
router.post('/', contactLimiter, contactController.sendEmail);

module.exports = router;
