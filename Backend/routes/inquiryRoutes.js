const express = require('express');
const router = express.Router();
const {
  getInquiries,
  createInquiry,
  updateInquiryStatus
} = require('../controllers/inquiryController');

router.route('/')
  .get(getInquiries)
  .post(createInquiry);

router.patch('/:id/status', updateInquiryStatus);

module.exports = router;
