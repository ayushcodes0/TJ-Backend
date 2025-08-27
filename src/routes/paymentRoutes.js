const express = require('express');
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Create Razorpay Order
router.post('/create-order', createOrder);

// Verify Payment
router.post('/verify-payment', verifyPayment);

// Get Payment Details
router.get('/payment/:paymentId', getPaymentDetails);

module.exports = router;
