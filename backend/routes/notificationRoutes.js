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
const { apiLimiter } = require('../middleware/rateLimiter');

router.route('/').get(apiLimiter, protect, getNotifications).post(apiLimiter, protect, createNotification);
router.get('/unread/count', apiLimiter, protect, getUnreadCount);
router.put('/chat/:chatId', apiLimiter, protect, markChatNotificationsAsRead);
router.route('/:id').put(apiLimiter, protect, markAsRead).delete(apiLimiter, protect, deleteNotification);

module.exports = router;
