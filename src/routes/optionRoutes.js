// src/routes/optionRoutes.js
const express = require('express');
const router = express.Router();
const { getOptions, createOption } = require('../controllers/optionController');
const auth = require('../middlewares/auth');
const { tradeLimiter } = require('../middlewares/rateLimiter');

// All routes require authentication
router.use(auth);

// GET options (no additional rate limiting needed)
router.get("/", getOptions);

// CREATE options (apply rate limiting to prevent spam)
router.post("/", tradeLimiter, createOption);

module.exports = router;
