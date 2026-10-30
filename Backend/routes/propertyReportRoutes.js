const express = require('express');
const router = express.Router();
const {
  submitPropertyReport,
  getReports,
  getReportById,
  updateReportStatus,
  takeDownPropertyBySuperAdmin,
} = require('../controllers/propertyReportController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, submitPropertyReport);
router.get('/', protect, getReports);
router.post('/takedown/:propertyId', protect, takeDownPropertyBySuperAdmin);
router.post('/take-down/:propertyId', protect, takeDownPropertyBySuperAdmin);
router.put('/:id/status', protect, updateReportStatus);
router.patch('/:id/status', protect, updateReportStatus);
router.get('/:id', protect, getReportById);

module.exports = router;
