const express = require('express');
const router = express.Router();
const { getOptions, createOption } = require('../controllers/optionController');
const auth = require('../middlewares/auth');


router.get("/", auth, createOption);
router.post("/", auth, getOptions);

module.exports = router;