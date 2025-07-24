const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const strategyController = require('../controllers/strategyController');

router.get('/', auth, strategyController.getStrategies);
router.post('/', auth, strategyController.addStrategy);

module.exports = router;
