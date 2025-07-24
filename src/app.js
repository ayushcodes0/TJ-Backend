const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'UP' });
});

module.exports = app;
