const Course = require('../models/Course');
const User = require('../models/User');
const MoodleService = require('../services/moodleService');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Course.countDocuments({ isVisible: true });
    const courses = await Course.find({ isVisible: true })
      .select('-sections.modules')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar')
      .populate('enrolledUsers.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      'enrolledUsers.user': req.user.id
    }).select('title shortName description image moodleCourseId enrolledUsers');

    // Add user's enrollment info to each course
    const coursesWithProgress = courses.map(course => {
      const enrollment = course.enrolledUsers.find(
        e => e.user.toString() === req.user.id
      );
      return {
        _id: course._id,
        title: course.title,
        shortName: course.shortName,
        description: course.description,
        image: course.image,
        moodleCourseId: course.moodleCourseId,
        progress: enrollment ? enrollment.progress : 0,
        grade: enrollment ? enrollment.grade : null,
        enrolledAt: enrollment ? enrollment.enrolledAt : null
      };
    });

    res.json({
      success: true,
      count: coursesWithProgress.length,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get course content/sections
// @route   GET /api/courses/:id/content
// @access  Private
exports.getCourseContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledUsers.some(
      e => e.user.toString() === req.user.id
    );

    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled to view course content'
      });
    }

    res.json({
      success: true,
      sections: course.sections
    });
  } catch (error) {
    console.error('Get course content error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
exports.searchCourses = async (req, res) => {
  try {
    const { q, category } = req.query;
    
    let query = { isVisible: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { shortName: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query)
      .select('title shortName description image category enrolledCount')
      .limit(20)
      .sort({ enrolledCount: -1 });

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get course participants
// @route   GET /api/courses/:id/participants
// @access  Private
exports.getCourseParticipants = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledUsers.user', 'name avatar bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledUsers.some(
      e => e.user.toString() === req.user.id
    );

    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You must be enrolled to view participants'
      });
    }

    const participants = course.enrolledUsers.map(e => ({
      user: e.user,
      role: e.role,
      enrolledAt: e.enrolledAt
    }));

    res.json({
      success: true,
      count: participants.length,
      participants
    });
  } catch (error) {
    console.error('Get course participants error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
