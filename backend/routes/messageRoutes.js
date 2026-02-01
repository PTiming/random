const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { messageLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.route('/').post(messageLimiter, protect, sendMessage);
router.route('/:chatId').get(apiLimiter, protect, getMessages);

module.exports = router;
