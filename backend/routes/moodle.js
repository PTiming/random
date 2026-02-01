const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  connectMoodle,
  disconnectMoodle,
  syncCourses,
  syncCourseContent,
  getCourseGrades,
  getMoodleStatus,
  getAssignments
} = require('../controllers/moodleController');

// All Moodle routes require authentication
router.use(protect);

// Connection management
router.post('/connect', connectMoodle);
router.delete('/disconnect', disconnectMoodle);
router.get('/status', getMoodleStatus);

// Sync routes
router.post('/sync/courses', syncCourses);
router.post('/sync/course/:courseId/content', syncCourseContent);

// Data routes
router.get('/grades/:courseId', getCourseGrades);
router.get('/assignments', getAssignments);

module.exports = router;
