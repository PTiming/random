const express = require('express');
const router = express.Router();
const {
  handleWebhook,
  getMoodleCourses,
  importCourseFromMoodle,
  getSyncHistory,
  testConnection,
  fullSync
} = require('../controllers/moodle.controller');
const { protect, authorize } = require('../middleware/auth');
const { verifyMoodleWebhook, logWebhook } = require('../middleware/moodleWebhook');

// Webhook endpoint (from Moodle - uses its own authentication)
router.post('/webhook', verifyMoodleWebhook, logWebhook, handleWebhook);

// Protected routes (require user authentication)
router.use(protect);

// Admin only routes
router.get('/test-connection', authorize('admin'), testConnection);
router.get('/courses', authorize('admin', 'instructor'), getMoodleCourses);
router.post('/import-course', authorize('admin', 'instructor'), importCourseFromMoodle);
router.get('/sync-history', authorize('admin'), getSyncHistory);
router.post('/full-sync', authorize('admin'), fullSync);

module.exports = router;
