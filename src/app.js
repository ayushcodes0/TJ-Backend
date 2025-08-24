// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import passport configuration
require('./config/passport'); // This initializes the passport strategy

const app = express();

const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');
const optionRoutes = require('./routes/optionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const contactRoutes = require('./routes/contactRoutes'); 

// Middleware
app.use(express.json());

// CORS configuration for Google OAuth
app.use(cors());

app.use(helmet());

// Initialize Passport (without session)
const passport = require('passport');
app.use(passport.initialize());

// Mount the existing routes
app.use('/api/trades', tradeRoutes);
app.use('/api/users', userRoutes); // Google auth routes are now here
app.use("/api/options", optionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/contact", contactRoutes); 


// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'UP' });
});

module.exports = app;
