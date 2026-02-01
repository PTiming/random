const express = require('express');
const router = express.Router();
const {
  joinChat,
  searchUsers,
  getUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.post('/join', authLimiter, joinChat);
router.get('/', apiLimiter, protect, searchUsers);
router.get('/profile', apiLimiter, protect, getUserProfile);

module.exports = router;
