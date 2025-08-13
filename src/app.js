const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');
const optionRoutes = require('./routes/optionRoutes')

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/trades', tradeRoutes);
app.use('/api/users', userRoutes);
app.use("/api/options", optionRoutes);


// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'UP' });
});

module.exports = app;
