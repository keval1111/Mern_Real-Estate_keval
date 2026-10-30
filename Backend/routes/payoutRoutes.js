const express = require('express');
const router = express.Router();
const {
  getPayouts,
  getPayoutSummary,
  getUserStats,
  getUserTrackingDetails,
  processPayout,
} = require('../controllers/payoutController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, getPayouts);
router.get('/summary', optionalProtect, getPayoutSummary);
router.get('/user-stats', optionalProtect, getUserStats);
router.get('/user-stats/:userId', optionalProtect, getUserTrackingDetails);
router.post('/process/:id', optionalProtect, processPayout);

module.exports = router;
