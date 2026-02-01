const express = require('express');
const router = express.Router();
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.route('/').post(apiLimiter, protect, accessChat).get(apiLimiter, protect, fetchChats);
router.post('/group', apiLimiter, protect, createGroupChat);
router.put('/rename', apiLimiter, protect, renameGroupChat);
router.put('/groupadd', apiLimiter, protect, addToGroup);
router.put('/groupremove', apiLimiter, protect, removeFromGroup);

module.exports = router;
