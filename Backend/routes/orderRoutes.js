const express = require('express');
const router = express.Router();
const {
  getOrders,
  createOrder,
  updateOrderStatus,
  advanceOrderStep,
  assignAgentToOrder,
  updateKycStatus,
} = require('../controllers/orderController');

const { optionalProtect } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalProtect, getOrders)
  .post(createOrder);

router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/advance-step', advanceOrderStep);
router.patch('/:id/assign-agent', assignAgentToOrder);
router.patch('/:id/kyc-status', updateKycStatus);

module.exports = router;

