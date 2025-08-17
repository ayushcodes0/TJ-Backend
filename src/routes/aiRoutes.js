// src/routes/aiRoutes.js

const express = require('express');
const router = express.Router();
const { analyzeTrades, testAIConnection } = require('../controllers/aiController');

// This is the main route that the frontend will call to get an analysis.
// Endpoint: POST /api/ai/analyze
router.post('/analyze', analyzeTrades);

// This is the testing route to verify backend connectivity.
// Endpoint: GET /api/ai/test
router.get('/test', testAIConnection);

module.exports = router;
