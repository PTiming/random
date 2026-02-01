const moodleSyncService = require('../services/moodleSync.service');
const moodleApi = require('../services/moodleApi.service');
const SyncLog = require('../models/SyncLog');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Handle Moodle webhook events
 * POST /api/moodle/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const { eventname, objecttable, objectid, other } = req.body;

    console.log('Received Moodle webhook:', eventname);

    // Process different event types
    switch (eventname) {
      case '\\core\\event\\user_created':
      case '\\core\\event\\user_updated':
        await handleUserEvent(objectid);
        break;

      case '\\core\\event\\course_created':
      case '\\core\\event\\course_updated':
        await handleCourseEvent(objectid);
        break;

      case '\\core\\event\\user_enrolment_created':
        await handleEnrollmentCreated(other?.userid, other?.courseid);
        break;

      case '\\core\\event\\user_enrolment_deleted':
        await handleEnrollmentDeleted(other?.userid, other?.courseid);
        break;

      case '\\core\\event\\grade_item_updated':
      case '\\core\\event\\user_graded':
        await handleGradeEvent(other?.userid, other?.courseid);
        break;

      default:
        console.log('Unhandled Moodle event:', eventname);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
};

/**
 * Handle user events from Moodle
 */
async function handleUserEvent(moodleUserId) {
  try {
    await moodleSyncService.syncUserFromMoodle(moodleUserId, 'webhook');
  } catch (error) {
    console.error('Error handling user event:', error);
  }
}

/**
 * Handle course events from Moodle
 */
async function handleCourseEvent(moodleCourseId) {
  try {
    // Find if we have this course locally
    const course = await Course.findOne({ moodleId: moodleCourseId });
    if (course) {
      // Get admin user for instructor assignment
      const admin = await User.findOne({ role: 'admin' });
      await moodleSyncService.syncCourseFromMoodle(
        moodleCourseId,
        admin?._id,
        'webhook'
      );
    }
  } catch (error) {
    console.error('Error handling course event:', error);
  }
}

/**
 * Handle enrollment created event
 */
async function handleEnrollmentCreated(moodleUserId, moodleCourseId) {
  try {
    const user = await User.findOne({ moodleId: moodleUserId });
    const course = await Course.findOne({ moodleId: moodleCourseId });

    if (user && course) {
      const isEnrolled = user.enrolledCourses.some(
        e => e.course.toString() === course._id.toString()
      );

      if (!isEnrolled) {
        user.enrolledCourses.push({
          course: course._id,
          role: 'student',
          moodleEnrollmentId: moodleUserId
        });
        await user.save();

        course.enrollmentCount += 1;
        await course.save();
      }
    }
  } catch (error) {
    console.error('Error handling enrollment event:', error);
  }
}

/**
 * Handle enrollment deleted event
 */
async function handleEnrollmentDeleted(moodleUserId, moodleCourseId) {
  try {
    const user = await User.findOne({ moodleId: moodleUserId });
    const course = await Course.findOne({ moodleId: moodleCourseId });

    if (user && course) {
      user.enrolledCourses = user.enrolledCourses.filter(
        e => e.course.toString() !== course._id.toString()
      );
      await user.save();

      course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);
      await course.save();
    }
  } catch (error) {
    console.error('Error handling unenrollment event:', error);
  }
}

/**
 * Handle grade events from Moodle
 */
async function handleGradeEvent(moodleUserId, moodleCourseId) {
  try {
    const user = await User.findOne({ moodleId: moodleUserId });
    const course = await Course.findOne({ moodleId: moodleCourseId });

    if (user && course) {
      await moodleSyncService.syncGradesFromMoodle(user._id, course._id, 'webhook');
    }
  } catch (error) {
    console.error('Error handling grade event:', error);
  }
}

/**
 * Get Moodle courses list
 * GET /api/moodle/courses
 */
exports.getMoodleCourses = async (req, res) => {
  try {
    const courses = await moodleApi.getCourses();

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Moodle courses',
      error: error.message
    });
  }
};

/**
 * Import course from Moodle
 * POST /api/moodle/import-course
 */
exports.importCourseFromMoodle = async (req, res) => {
  try {
    const { moodleCourseId } = req.body;

    const result = await moodleSyncService.syncCourseFromMoodle(
      moodleCourseId,
      req.user.id,
      'manual'
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error importing course from Moodle',
      error: error.message
    });
  }
};

/**
 * Get sync history
 * GET /api/moodle/sync-history
 */
exports.getSyncHistory = async (req, res) => {
  try {
    const { syncType, status, limit = 50 } = req.query;

    const history = await moodleSyncService.getSyncHistory(
      { syncType, status },
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sync history',
      error: error.message
    });
  }
};

/**
 * Test Moodle connection
 * GET /api/moodle/test-connection
 */
exports.testConnection = async (req, res) => {
  try {
    // Try to fetch courses as a test
    const courses = await moodleApi.getCourses();

    res.status(200).json({
      success: true,
      message: 'Successfully connected to Moodle',
      data: {
        coursesCount: courses.length,
        moodleUrl: process.env.MOODLE_URL
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Moodle',
      error: error.message
    });
  }
};

/**
 * Manual full sync
 * POST /api/moodle/full-sync
 */
exports.fullSync = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (courseId) {
      // Sync specific course
      const result = await moodleSyncService.fullCourseSync(courseId, 'manual');
      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // Sync all courses
    const courses = await Course.find({ moodleId: { $ne: null } });
    const results = [];

    for (const course of courses) {
      try {
        const result = await moodleSyncService.fullCourseSync(course._id, 'manual');
        results.push({ courseId: course._id, ...result });
      } catch (error) {
        results.push({ courseId: course._id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing full sync',
      error: error.message
    });
  }
};
