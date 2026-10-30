const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateUserPermissions,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Require authentication for all user routes
router.use(protect);

// Allow Super Admin, Main Admin, Admin, and Sub-Admin to view user list
router.get('/', authorizeRoles('Super Admin', 'Main Admin', 'Admin', 'Sub-Admin'), getAllUsers);

// Write/Manage operations restricted to Super Admin, Main Admin, Admin
router.post('/', authorizeRoles('Super Admin', 'Main Admin', 'Admin'), createUser);
router.patch('/:id/role', authorizeRoles('Super Admin', 'Main Admin', 'Admin'), updateUserRole);
router.patch('/:id/status', authorizeRoles('Super Admin', 'Main Admin', 'Admin'), updateUserStatus);
router.patch('/:id/permissions', authorizeRoles('Super Admin', 'Main Admin', 'Admin'), updateUserPermissions);
router.delete('/:id', authorizeRoles('Super Admin', 'Main Admin', 'Admin'), deleteUser);

module.exports = router;
