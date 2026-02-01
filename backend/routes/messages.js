const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all conversations
router.get('/conversations', auth, messageController.getConversations);

// Get unread count
router.get('/unread', auth, messageController.getUnreadCount);

// Get conversation with a specific user
router.get('/conversation/:userId', auth, messageController.getConversation);

// Send message
router.post('/', [
  auth,
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  validate
], messageController.sendMessage);

// Mark message as read
router.put('/:messageId/read', auth, messageController.markAsRead);

// Delete message
router.delete('/:messageId', auth, messageController.deleteMessage);

module.exports = router;
