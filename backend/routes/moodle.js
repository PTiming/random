const express = require('express');
const router = express.Router();
const moodleService = require('../services/moodleService');
const User = require('../models/User');
const Course = require('../models/Course');
const { auth, checkRole } = require('../middleware/auth');

// Sync user data from Moodle
router.post('/sync/user', auth, async (req, res) => {
  try {
    if (!req.user.moodleId) {
      return res.status(400).json({ error: 'User not linked to Moodle account' });
    }

    const syncResult = await moodleService.syncUserFromMoodle(req.user.moodleId, req.user);

    if (syncResult.success) {
      await syncResult.user.save();
      res.json({ 
        message: 'User synced successfully',
        user: syncResult.user,
        courses: syncResult.courses
      });
    } else {
      res.status(500).json({ error: syncResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync course from Moodle
router.post('/sync/course/:moodleCourseId', auth, checkRole(['instructor', 'admin']), async (req, res) => {
  try {
    const syncResult = await moodleService.syncCourseFromMoodle(req.params.moodleCourseId);

    if (syncResult.success) {
      // Check if course already exists
      let course = await Course.findOne({ moodleId: req.params.moodleCourseId });

      if (!course) {
        course = new Course({
          moodleId: syncResult.course.id.toString(),
          moodleShortName: syncResult.course.shortname,
          name: syncResult.course.fullname,
          description: syncResult.course.summary,
          instructor: req.user._id,
          lastMoodleSync: new Date()
        });
      } else {
        course.name = syncResult.course.fullname;
        course.description = syncResult.course.summary;
        course.lastMoodleSync = new Date();
      }

      await course.save();

      res.json({
        message: 'Course synced successfully',
        course,
        enrollments: syncResult.enrollments,
        assignments: syncResult.assignments
      });
    } else {
      res.status(500).json({ error: syncResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user courses from Moodle
router.get('/courses', auth, async (req, res) => {
  try {
    if (!req.user.moodleId) {
      return res.status(400).json({ error: 'User not linked to Moodle account' });
    }

    const courses = await moodleService.getUserCourses(req.user.moodleId);
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user grades from Moodle
router.get('/grades/:courseId', auth, async (req, res) => {
  try {
    if (!req.user.moodleId) {
      return res.status(400).json({ error: 'User not linked to Moodle account' });
    }

    const grades = await moodleService.getUserGrades(req.params.courseId, req.user.moodleId);
    res.json({ grades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get calendar events from Moodle
router.get('/calendar', auth, async (req, res) => {
  try {
    if (!req.user.moodleId) {
      return res.status(400).json({ error: 'User not linked to Moodle account' });
    }

    const startDate = req.query.start ? new Date(req.query.start) : new Date();
    const endDate = req.query.end ? new Date(req.query.end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const events = await moodleService.getCalendarEvents(req.user.moodleId, startDate, endDate);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit assignment to Moodle
router.post('/assignment/:assignmentId/submit', auth, async (req, res) => {
  try {
    if (!req.user.moodleId) {
      return res.status(400).json({ error: 'User not linked to Moodle account' });
    }

    const { submissionText, fileUrl } = req.body;
    const result = await moodleService.submitAssignment(
      req.params.assignmentId,
      req.user.moodleId,
      submissionText,
      fileUrl
    );

    res.json({ 
      message: 'Assignment submitted successfully',
      result 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Moodle events
router.post('/webhook', async (req, res) => {
  try {
    const { eventType, data } = req.body;

    // Process different event types
    switch (eventType) {
      case 'user_enrolled':
        // Handle user enrollment
        console.log('User enrolled:', data);
        break;
      case 'assignment_created':
        // Handle new assignment
        console.log('New assignment:', data);
        break;
      case 'grade_updated':
        // Handle grade update
        console.log('Grade updated:', data);
        break;
      default:
        console.log('Unknown event type:', eventType);
    }

    res.json({ message: 'Webhook received' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
