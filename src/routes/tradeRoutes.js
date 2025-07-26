const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const tradeController = require('../controllers/tradeController');

// All routes are protected
router.post('/', auth, tradeController.createTrade);
router.get('/', auth, tradeController.getTrades);
router.get('/stats', auth, tradeController.getTradeStats);
router.get('/:id', auth, tradeController.getTradeById);
router.put('/:id', auth, tradeController.updateTrade);
router.delete('/:id', auth, tradeController.deleteTrade);


module.exports = router;
