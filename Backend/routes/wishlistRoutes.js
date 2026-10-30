const express = require('express');
const router = express.Router();
const {
  toggleWishlist,
  getWishlist,
  clearWishlist,
  getAdminWishlistSummary,
} = require('../controllers/wishlistController');

// GET /api/wishlist/admin/all - Fetch all favorited properties across customers for Admin
router.get('/admin/all', getAdminWishlistSummary);

// GET /api/wishlist - Fetch saved homes
router.get('/', getWishlist);

// DELETE /api/wishlist - Clear wishlist
router.delete('/', clearWishlist);

// POST /api/wishlist/toggle/:propertyId - Toggle save/unsave property
router.post('/toggle/:propertyId', toggleWishlist);

module.exports = router;
