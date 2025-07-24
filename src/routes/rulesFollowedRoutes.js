const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const rulesFollowedController = require('../controllers/rulesFollowedController');

router.get('/', auth, rulesFollowedController.getRules);
router.post('/', auth, rulesFollowedController.addRule);

module.exports = router;
