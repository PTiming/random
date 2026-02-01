const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
  markChatNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications).post(protect, createNotification);
router.get('/unread/count', protect, getUnreadCount);
router.put('/chat/:chatId', protect, markChatNotificationsAsRead);
router.route('/:id').put(protect, markAsRead).delete(protect, deleteNotification);

module.exports = router;
