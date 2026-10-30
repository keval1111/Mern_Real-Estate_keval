const express = require('express');
const router = express.Router();
const {
  submitKyc,
  getMyKyc,
  getAllKycRequests,
  reviewKyc,
  resetDemoKyc,
} = require('../controllers/kycController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitKyc);
router.get('/my-status', protect, getMyKyc);
router.get('/requests', protect, getAllKycRequests);
router.patch('/review/:userId', protect, reviewKyc);
router.post('/reset-demo', resetDemoKyc);

module.exports = router;

