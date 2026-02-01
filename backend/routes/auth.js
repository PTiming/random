const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginWithMoodle,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/moodle', authLimiter, loginWithMoodle);
router.get('/me', protect, getMe);

module.exports = router;
