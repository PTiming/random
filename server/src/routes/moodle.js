const express = require('express');
const { auth, instructorOrAdmin } = require('../middleware/auth');
const MoodleService = require('../services/moodle/moodleService');
const MoodleSyncService = require('../services/moodle/moodleSyncService');
const { MoodleCourse, UserMoodleMapping } = require('../models/Moodle');
const User = require('../models/User');
const config = require('../config');
const { webhookLimiter, createLimiter } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * @route   GET /api/moodle/courses
 * @desc    Get user's Moodle courses
 * @access  Private
 */
router.get('/courses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleId || !user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const courses = await moodleService.getUserCourses(user.moodleId);
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get Moodle courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Moodle courses'
    });
  }
});

/**
 * @route   GET /api/moodle/courses/:courseId
 * @desc    Get Moodle course details
 * @access  Private
 */
router.get('/courses/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    // Check local cache first
    let course = await MoodleCourse.findOne({ 
      moodleCourseId: parseInt(req.params.courseId) 
    });
    
    // Fetch from Moodle if not cached or stale
    if (!course || Date.now() - course.lastFullSync?.getTime() > 3600000) {
      const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
      const courseData = await moodleService.getCourseDetails(req.params.courseId);
      
      if (!course) {
        course = new MoodleCourse({ moodleCourseId: parseInt(req.params.courseId) });
      }
      
      Object.assign(course, {
        shortName: courseData.shortname,
        fullName: courseData.fullname,
        summary: courseData.summary,
        categoryId: courseData.categoryid,
        startDate: new Date(courseData.startdate * 1000),
        endDate: courseData.enddate ? new Date(courseData.enddate * 1000) : null,
        visible: courseData.visible,
        format: courseData.format,
        lastFullSync: new Date()
      });
      
      await course.save();
    }
    
    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course details'
    });
  }
});

/**
 * @route   GET /api/moodle/assignments
 * @desc    Get user's assignments
 * @access  Private
 */
router.get('/assignments', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const assignments = await moodleService.getAssignments(user.moodleId);
    
    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments'
    });
  }
});

/**
 * @route   GET /api/moodle/grades
 * @desc    Get user's grades
 * @access  Private
 */
router.get('/grades', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const grades = await moodleService.getUserGrades(user.moodleId);
    
    // Update local cache
    await UserMoodleMapping.findOneAndUpdate(
      { platformUserId: req.userId },
      { 
        grades,
        lastGradesSync: new Date()
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      data: { grades }
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grades'
    });
  }
});

/**
 * @route   GET /api/moodle/calendar
 * @desc    Get Moodle calendar events
 * @access  Private
 */
router.get('/calendar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const events = await moodleService.getCalendarEvents();
    
    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar events'
    });
  }
});

/**
 * @route   POST /api/moodle/sync
 * @desc    Trigger manual sync with Moodle
 * @access  Private
 */
router.post('/sync', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const syncService = new MoodleSyncService();
    const result = await syncService.syncUserData(user);
    
    // Update last sync timestamp
    user.lastMoodleSync = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Sync completed',
      data: { result }
    });
  } catch (error) {
    console.error('Moodle sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed'
    });
  }
});

/**
 * @route   POST /api/moodle/submit-assignment
 * @desc    Submit assignment to Moodle
 * @access  Private
 */
router.post('/submit-assignment', auth, async (req, res) => {
  try {
    const { assignmentId, submissionText, fileUrl } = req.body;
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const result = await moodleService.submitAssignment(assignmentId, {
      text: submissionText,
      fileUrl
    });
    
    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: { result }
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment'
    });
  }
});

/**
 * @route   POST /api/moodle/forum-post
 * @desc    Post to Moodle forum
 * @access  Private
 */
router.post('/forum-post', auth, async (req, res) => {
  try {
    const { forumId, discussionId, subject, message, replyToId } = req.body;
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const result = await moodleService.createForumPost({
      forumId,
      discussionId,
      subject,
      message,
      replyToId
    });
    
    res.json({
      success: true,
      message: 'Posted to forum successfully',
      data: { result }
    });
  } catch (error) {
    console.error('Forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post to forum'
    });
  }
});

/**
 * Verify Moodle webhook signature
 */
const verifyWebhookSignature = (req) => {
  const signature = req.headers['x-moodle-signature'];
  const webhookSecret = process.env.MOODLE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('MOODLE_WEBHOOK_SECRET is not configured');
  }
  
  if (!signature) {
    throw new Error('Missing webhook signature');
  }
  
  // Create expected signature using HMAC-SHA256
  const crypto = require('crypto');
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  // Compare signatures using timing-safe comparison
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  
  if (signatureBuffer.length !== expectedBuffer.length || 
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid webhook signature');
  }
  
  return true;
};

/**
 * @route   POST /api/moodle/webhook
 * @desc    Webhook endpoint for Moodle events
 * @access  Public (with signature verification)
 */
router.post('/webhook', webhookLimiter, async (req, res) => {
  try {
    // Verify webhook signature
    verifyWebhookSignature(req);
    
    const { event, data } = req.body;
    
    const syncService = new MoodleSyncService();
    await syncService.handleWebhookEvent(event, data);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * @route   GET /api/moodle/notifications
 * @desc    Get Moodle notifications
 * @access  Private
 */
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const notifications = await moodleService.getNotifications(user.moodleId);
    
    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    console.error('Get Moodle notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Moodle notifications'
    });
  }
});

/**
 * @route   GET /api/moodle/resources/:courseId
 * @desc    Get course resources
 * @access  Private
 */
router.get('/resources/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+moodleToken');
    
    if (!user.moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle account not linked'
      });
    }
    
    const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
    const resources = await moodleService.getCourseResources(req.params.courseId);
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resources'
    });
  }
});

module.exports = router;
