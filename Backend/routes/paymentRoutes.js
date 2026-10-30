const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getAllotmentReceipt,
} = require('../controllers/paymentController');

// Razorpay Payment Flow
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/receipt/:orderId', getAllotmentReceipt);

module.exports = router;
