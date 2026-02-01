const Grade = require('../models/Grade');
const User = require('../models/User');
const Course = require('../models/Course');
const moodleSyncService = require('../services/moodleSync.service');

/**
 * Get grades for a user in a course
 * GET /api/grades/course/:courseId
 */
exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.query.userId || req.user.id;

    // Verify user has access
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      const course = await Course.findById(courseId);
      if (!course || course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these grades'
        });
      }
    }

    const grades = await Grade.find({ user: userId, course: courseId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
};

/**
 * Get all grades for a course (instructor/admin only)
 * GET /api/grades/course/:courseId/all
 */
exports.getAllCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { activityType, page = 1, limit = 50 } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view course grades'
      });
    }

    const query = { course: courseId };
    if (activityType) query.activityType = activityType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const grades = await Grade.find(query)
      .populate('user', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Grade.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        grades,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
};

/**
 * Create or update a grade
 * POST /api/grades
 */
exports.createGrade = async (req, res) => {
  try {
    const {
      userId,
      courseId,
      activityType,
      activityId,
      grade,
      maxGrade,
      feedback
    } = req.body;

    // Verify course exists and user is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade in this course'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if grade already exists
    let gradeRecord = await Grade.findOne({
      user: userId,
      course: courseId,
      activityType,
      activityId: activityId || null
    });

    if (gradeRecord) {
      // Update existing grade
      gradeRecord.grade = grade;
      gradeRecord.maxGrade = maxGrade || gradeRecord.maxGrade;
      gradeRecord.feedback = feedback || gradeRecord.feedback;
      gradeRecord.gradedBy = req.user.id;
      gradeRecord.gradedAt = new Date();
      gradeRecord.syncedWithMoodle = false;
      await gradeRecord.save();
    } else {
      // Create new grade
      gradeRecord = await Grade.create({
        user: userId,
        course: courseId,
        activityType,
        activityId,
        grade,
        maxGrade: maxGrade || 100,
        feedback,
        gradedBy: req.user.id,
        gradedAt: new Date()
      });
    }

    res.status(201).json({
      success: true,
      data: gradeRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating grade',
      error: error.message
    });
  }
};

/**
 * Update a grade
 * PUT /api/grades/:id
 */
exports.updateGrade = async (req, res) => {
  try {
    const { grade, maxGrade, feedback } = req.body;

    const gradeRecord = await Grade.findById(req.params.id);
    if (!gradeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check authorization
    const course = await Course.findById(gradeRecord.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this grade'
      });
    }

    gradeRecord.grade = grade !== undefined ? grade : gradeRecord.grade;
    gradeRecord.maxGrade = maxGrade || gradeRecord.maxGrade;
    gradeRecord.feedback = feedback !== undefined ? feedback : gradeRecord.feedback;
    gradeRecord.gradedBy = req.user.id;
    gradeRecord.gradedAt = new Date();
    gradeRecord.syncedWithMoodle = false;
    await gradeRecord.save();

    res.status(200).json({
      success: true,
      data: gradeRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
};

/**
 * Delete a grade
 * DELETE /api/grades/:id
 */
exports.deleteGrade = async (req, res) => {
  try {
    const gradeRecord = await Grade.findById(req.params.id);
    if (!gradeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check authorization
    const course = await Course.findById(gradeRecord.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this grade'
      });
    }

    await gradeRecord.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting grade',
      error: error.message
    });
  }
};

/**
 * Sync grades from Moodle
 * POST /api/grades/sync-moodle
 */
exports.syncGradesFromMoodle = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const result = await moodleSyncService.syncGradesFromMoodle(
      userId,
      courseId,
      'manual'
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing grades from Moodle',
      error: error.message
    });
  }
};

/**
 * Get user's overall grades across all courses
 * GET /api/grades/my-grades
 */
exports.getMyGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ user: req.user.id })
      .populate('course', 'title shortName')
      .sort({ createdAt: -1 });

    // Group by course
    const gradesByCourse = grades.reduce((acc, grade) => {
      const courseId = grade.course._id.toString();
      if (!acc[courseId]) {
        acc[courseId] = {
          course: grade.course,
          grades: []
        };
      }
      acc[courseId].grades.push(grade);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(gradesByCourse)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
};
