
const express = require('express');
const router = express.Router();
const { getOptions, createOption } = require('../controllers/optionController');
const auth = require('../middlewares/auth'); // Assuming your middleware is named 'auth'

router.get("/", auth, getOptions);
router.post("/", auth, createOption);

module.exports = router;
