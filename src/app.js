const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const emotionalStateRoutes = require('./routes/emotionalStateRoutes');
const outcomeSummaryRoutes = require('./routes/outcomeSummaryRoutes');
const rulesFollowedRoutes = require('./routes/rulesFollowedRoutes');

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/trades', tradeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/emotions', emotionalStateRoutes);
app.use('/api/outcome-summaries', outcomeSummaryRoutes);
app.use('/api/rules-followed', rulesFollowedRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'UP' });
});

module.exports = app;
