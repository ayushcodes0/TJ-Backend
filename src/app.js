// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import rate limiters
// const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');

// Import passport configuration
require('./config/passport'); // This initializes the passport strategy

const app = express();

const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');
const optionRoutes = require('./routes/optionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const contactRoutes = require('./routes/contactRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const referralRoutes = require("./routes/referralRoutes");



// Middleware
app.use(express.json());

// CORS configuration for Google OAuth
app.use(cors());

app.use(helmet());

// Initialize Passport (without session)
const passport = require('passport');
app.use(passport.initialize());

// Apply general rate limiting to all API routes
// app.use('/api', apiLimiter);

// Log successful requests for monitoring
app.use('/api', (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Log API usage (only for important operations)
    if (req.method !== 'GET') {
      console.log(`[API ACCESS] ${req.method} ${req.path}:`, {
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode
      });
    }
    originalSend.call(this, data);
  };
  next();
});

// Mount the existing routes
app.use('/api/trades', tradeRoutes); // Trade-specific limiter applied in routes
app.use('/api/users', userRoutes); // Apply auth limiter to user routes
app.use("/api/options", optionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/contact", contactRoutes); 
app.use('/api/payments', paymentRoutes);
app.use("/api/referral", referralRoutes);


// Health check route (no rate limiting)
app.get('/', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

module.exports = app;