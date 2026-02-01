const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  syncFromMoodle
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { apiLimiter, syncLimiter } = require('../middleware/rateLimiter');

router.get('/', protect, apiLimiter, getCourses);
router.get('/:id', protect, apiLimiter, getCourse);
router.post('/sync-from-moodle', protect, syncLimiter, syncFromMoodle);

module.exports = router;
