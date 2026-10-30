const express = require('express');
const router = express.Router();
const {
  sendTestNotification,
  resendOrderEmail,
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController');

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllRead);
router.post('/test-email', sendTestNotification);
router.post('/resend-order/:orderId', resendOrderEmail);

module.exports = router;
