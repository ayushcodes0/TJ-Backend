const express = require('express');
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Create Razorpay Order
router.post('/create-order',auth, createOrder);

// Verify Payment
router.post('/verify-payment', auth, verifyPayment);

// Get Payment Details
router.get('/payment/:paymentId', auth, getPaymentDetails);

module.exports = router;
