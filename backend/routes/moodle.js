const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const moodleController = require('../controllers/moodleController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// ==========================================
// CONNECTION & STATUS
// ==========================================

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

// ==========================================
// READ OPERATIONS (One-Way Sync - FROM Moodle)
// ==========================================

// Get courses
router.get('/courses', auth, moodleController.getCourses);

// Get course content
router.get('/courses/:courseId', auth, moodleController.getCourseContent);

// Get course participants
router.get('/courses/:courseId/participants', auth, moodleController.getCourseParticipants);

// Get course completion status
router.get('/courses/:courseId/completion', auth, moodleController.getCourseCompletion);

// Search courses
router.get('/search', auth, moodleController.searchCourses);

// Get grades
router.get('/grades', auth, moodleController.getGrades);

// Get assignments
router.get('/assignments', auth, moodleController.getAssignments);

// Get assignment submission status
router.get('/assignments/:assignmentId/status', auth, moodleController.getAssignmentStatus);

// Get calendar events
router.get('/calendar', auth, moodleController.getCalendarEvents);

// Get Moodle notifications
router.get('/notifications', auth, moodleController.getMoodleNotifications);

// Get forum discussions
router.get('/forums/:forumId/discussions', auth, moodleController.getForumDiscussions);

// ==========================================
// WRITE OPERATIONS (Two-Way Sync - TO Moodle)
// ==========================================

// Submit assignment
router.post('/assignments/:assignmentId/submit', [
  auth,
  body('text')
    .notEmpty()
    .withMessage('Submission text is required'),
  validate
], moodleController.submitAssignment);

// Create forum discussion
router.post('/forums/:forumId/discussion', [
  auth,
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .notEmpty()
    .withMessage('Message is required'),
  validate
], moodleController.createForumDiscussion);

// Reply to forum post
router.post('/forums/posts/:postId/reply', [
  auth,
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .notEmpty()
    .withMessage('Message is required'),
  validate
], moodleController.replyToForumPost);

// Send message to Moodle user
router.post('/messages', [
  auth,
  body('toUserId')
    .notEmpty()
    .withMessage('Recipient user ID is required'),
  body('text')
    .notEmpty()
    .withMessage('Message text is required'),
  validate
], moodleController.sendMoodleMessage);

// Mark Moodle messages as read
router.put('/messages/read', [
  auth,
  body('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required'),
  validate
], moodleController.markMoodleMessagesRead);

// Create calendar event
router.post('/calendar/events', [
  auth,
  body('name')
    .notEmpty()
    .withMessage('Event name is required'),
  body('timeStart')
    .notEmpty()
    .withMessage('Start time is required'),
  validate
], moodleController.createCalendarEvent);

// Delete calendar event
router.delete('/calendar/events/:eventId', auth, moodleController.deleteCalendarEvent);

// Mark notifications as read
router.put('/notifications/read', auth, moodleController.markNotificationsRead);

// Self-enroll in course
router.post('/courses/:courseId/enroll', auth, moodleController.selfEnroll);

// Mark activity as complete
router.post('/activities/:cmid/complete', auth, moodleController.completeActivity);

// ==========================================
// SHARING TO PLATFORM (Internal)
// ==========================================

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
