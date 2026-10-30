const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviews,
  deleteReview,
  updateReviewStatus,
} = require('../controllers/reviewController');

const { optionalProtect } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalProtect, getReviews)
  .post(createReview);

router.route('/:id')
  .delete(deleteReview);

router.route('/:id/status')
  .patch(updateReviewStatus);

module.exports = router;
