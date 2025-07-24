const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const outcomeSummaryController = require('../controllers/outcomeSummaryController');

router.get('/', auth, outcomeSummaryController.getOutcomeSummaries);
router.post('/', auth, outcomeSummaryController.addOutcomeSummary);
router.delete('/:id', auth, outcomeSummaryController.deleteOutcomeSummary);

module.exports = router;
