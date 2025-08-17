// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');
const optionRoutes = require('./routes/optionRoutes');
const aiRoutes = require('./routes/aiRoutes'); // <--- ADD THIS LINE

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Mount the existing routes
app.use('/api/trades', tradeRoutes);
app.use('/api/users', userRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/ai", aiRoutes); // <--- AND ADD THIS LINE

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'UP' });
});

module.exports = app;
