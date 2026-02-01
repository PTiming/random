const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  getEnrolledCourses,
  getCourseContent,
  searchCourses,
  getCourseParticipants
} = require('../controllers/courseController');

// Public routes
router.get('/', getCourses);
router.get('/search', searchCourses);
router.get('/:id', getCourse);

// Protected routes
router.get('/user/enrolled', protect, getEnrolledCourses);
router.get('/:id/content', protect, getCourseContent);
router.get('/:id/participants', protect, getCourseParticipants);

module.exports = router;
