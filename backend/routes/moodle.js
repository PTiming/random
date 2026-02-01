const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const moodleController = require('../controllers/moodleController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get Moodle connection status
router.get('/status', auth, moodleController.getMoodleStatus);

// Connect Moodle account
router.post('/connect', [
  auth,
  body('moodleUrl')
    .notEmpty()
    .withMessage('Moodle URL is required'),
  body('username')
    .notEmpty()
    .withMessage('Moodle username is required'),
  body('password')
    .notEmpty()
    .withMessage('Moodle password is required'),
  validate
], moodleController.connectMoodle);

// Disconnect Moodle account
router.delete('/disconnect', auth, moodleController.disconnectMoodle);

// Get courses
router.get('/courses', auth, moodleController.getCourses);

// Get course content
router.get('/courses/:courseId', auth, moodleController.getCourseContent);

// Get course participants
router.get('/courses/:courseId/participants', auth, moodleController.getCourseParticipants);

// Search courses
router.get('/search', auth, moodleController.searchCourses);

// Get grades
router.get('/grades', auth, moodleController.getGrades);

// Get assignments
router.get('/assignments', auth, moodleController.getAssignments);

// Get calendar events
router.get('/calendar', auth, moodleController.getCalendarEvents);

// Get Moodle notifications
router.get('/notifications', auth, moodleController.getMoodleNotifications);

// Share course post
router.post('/share', [
  auth,
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required'),
  body('courseName')
    .notEmpty()
    .withMessage('Course name is required'),
  validate
], moodleController.shareCoursePost);

// Share grade achievement
router.post('/achievement', [
  auth,
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required'),
  body('courseName')
    .notEmpty()
    .withMessage('Course name is required'),
  body('activityName')
    .notEmpty()
    .withMessage('Activity name is required'),
  body('grade')
    .isNumeric()
    .withMessage('Grade is required'),
  body('maxGrade')
    .isNumeric()
    .withMessage('Max grade is required'),
  validate
], moodleController.syncGradeAchievement);

module.exports = router;
