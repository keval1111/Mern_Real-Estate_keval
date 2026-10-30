const express = require('express');
const router = express.Router();
const {
  scheduleVisit,
  getAvailableSlots,
  getVisits,
  updateVisitStatus,
  deleteVisit,
} = require('../controllers/visitController');

// Slot check
router.get('/available-slots', getAvailableSlots);

// Schedule visit
router.post('/schedule', scheduleVisit);

// Get visits list
router.get('/', getVisits);

// Update status
router.patch('/:id/status', updateVisitStatus);

// Delete / Cancel visit
router.delete('/:id', deleteVisit);

module.exports = router;
