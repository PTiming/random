const Course = require('../models/Course');
const User = require('../models/User');
const moodleConnector = require('../services/moodleConnector');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = req.query.enrolled === 'true' 
      ? { 'enrolledStudents.userId': req.user._id }
      : {};

    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .populate('instructor', 'username firstName lastName')
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username firstName lastName avatar')
      .populate('enrolledStudents.userId', 'username firstName lastName avatar');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync courses from Moodle
// @route   POST /api/courses/sync-from-moodle
// @access  Private
const syncFromMoodle = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'No Moodle account linked' });
    }

    // Get courses from Moodle
    const moodleCourses = await moodleConnector.getUserCourses(user.moodleUserId);

    const syncedCourses = [];

    for (const moodleCourse of moodleCourses) {
      let course = await Course.findOne({ moodleCourseId: moodleCourse.id });

      if (!course) {
        course = await Course.create({
          name: moodleCourse.fullname,
          code: moodleCourse.shortname,
          moodleCourseId: moodleCourse.id,
          description: moodleCourse.summary || '',
          lastMoodleSync: new Date()
        });
      }

      // Enroll user
      const isEnrolled = course.enrolledStudents.some(
        s => s.userId.toString() === user._id.toString()
      );

      if (!isEnrolled) {
        course.enrolledStudents.push({
          userId: user._id,
          enrolledAt: new Date()
        });
        await course.save();
      }

      // Add to user's enrolled courses
      if (!user.enrolledCourses.some(c => c.courseId.toString() === course._id.toString())) {
        user.enrolledCourses.push({
          courseId: course._id,
          moodleCourseId: moodleCourse.id,
          enrolledAt: new Date()
        });
      }

      syncedCourses.push(course);
    }

    user.lastMoodleSync = new Date();
    await user.save();

    res.json({ message: 'Courses synced successfully', courses: syncedCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourse,
  syncFromMoodle
};
