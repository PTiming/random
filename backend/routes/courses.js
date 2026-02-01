const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  syncFromMoodle
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourse);
router.post('/sync-from-moodle', protect, syncFromMoodle);

module.exports = router;
