const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Define the POST route for the contact form submission
router.post('/', contactController.sendEmail);

module.exports = router;