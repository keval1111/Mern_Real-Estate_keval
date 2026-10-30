const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  getAllAdminChats,
  markChatRead,
} = require('../controllers/chatController');

router.get('/admin/all', getAllAdminChats);
router.get('/history/:roomId', getChatHistory);
router.patch('/:roomId/read', markChatRead);

module.exports = router;
