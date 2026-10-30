const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyByIdOrSlug,
  createProperty,
  updateProperty,
  togglePropertyStatus,
  deleteProperty,
  resetDefaults,
  submitSellRequest,
  getSellerRequests,
  approveSellRequest,
  rejectSellRequest,
  getMySubmissions,
} = require('../controllers/propertyController');
const { optionalProtect, checkKycApproved } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalProtect, getProperties)
  .post(optionalProtect, checkKycApproved, createProperty);

router.post('/reset-defaults', resetDefaults);

// Seller submission workflow routes
router.post('/sell-request', submitSellRequest);
router.get('/seller-requests', getSellerRequests);
router.get('/my-submissions', getMySubmissions);
router.patch('/:id/approve', approveSellRequest);
router.patch('/:id/reject', rejectSellRequest);

router.route('/:idOrSlug')
  .get(getPropertyByIdOrSlug)
  .put(optionalProtect, checkKycApproved, updateProperty)
  .delete(optionalProtect, deleteProperty);

router.patch('/:id/toggle-status', optionalProtect, togglePropertyStatus);

module.exports = router;

