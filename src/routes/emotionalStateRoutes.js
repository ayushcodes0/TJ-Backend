const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const emotionalStateController = require('../controllers/emotionalStateController');

router.get('/', auth, emotionalStateController.getEmotionalStates);
router.post('/', auth, emotionalStateController.addEmotionalState);

module.exports = router;
