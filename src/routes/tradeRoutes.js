// src/routes/tradeRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const tradeController = require('../controllers/tradeController');
const { tradeLimiter } = require('../middlewares/rateLimiter');
const upload = require('../middlewares/upload');


// All routes require authentication
router.use(auth);

// GET routes (less restrictive - only general API limiter applies)
router.get('/', tradeController.getTrades);
router.get('/stats', tradeController.getTradeStats);
router.get('/:id', tradeController.getTradeById);

// Write operations (CREATE, UPDATE, DELETE) - apply trade-specific rate limiting
router.post('/', tradeLimiter, tradeController.createTrade);
router.put('/:id', tradeLimiter, tradeController.updateTrade);
router.delete('/:id', tradeLimiter, tradeController.deleteTrade);
// CSV import (write operation, apply auth + tradeLimiter + upload)
router.post(
  '/import/csv',
  upload.single('file'),  // frontend must send form-data with key "file"
  tradeController.importTradesFromCsv
);


module.exports = router;
