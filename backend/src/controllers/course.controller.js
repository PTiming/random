const Course = require('../models/Course');
const User = require('../models/User');
const moodleSyncService = require('../services/moodleSync.service');

/**
 * Get all courses
 * GET /api/courses
 */
exports.getCourses = async (req, res) => {
  try {
    const { search, category, instructor, published, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (instructor) query.instructor = instructor;
    if (published !== undefined) query.isPublished = published === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        courses,
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
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 */
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment count
    const enrollmentCount = await User.countDocuments({
      'enrolledCourses.course': course._id
    });

    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        enrollmentCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

/**
 * Create a new course
 * POST /api/courses
 */
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      shortName,
      description,
      category,
      startDate,
      endDate,
      isPublished,
      maxStudents,
      settings
    } = req.body;

    const course = await Course.create({
      title,
      shortName,
      description,
      category,
      instructor: req.user.id,
      startDate,
      endDate,
      isPublished,
      maxStudents,
      settings
    });

    // Sync to Moodle if configured
    moodleSyncService.syncCourseToMoodle(course._id, 'system').catch(err => {
      console.error('Failed to sync course to Moodle:', err.message);
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A course with this short name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

/**
 * Update a course
 * PUT /api/courses/:id
 */
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName email');

    // Sync to Moodle if connected
    if (updatedCourse.moodleId) {
      moodleSyncService.syncCourseToMoodle(updatedCourse._id, 'manual').catch(err => {
        console.error('Failed to sync course to Moodle:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

/**
 * Delete a course
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Remove course from all users' enrollments
    await User.updateMany(
      { 'enrolledCourses.course': course._id },
      { $pull: { enrolledCourses: { course: course._id } } }
    );

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

/**
 * Enroll user in course
 * POST /api/courses/:id/enroll
 */
exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.body.userId || req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already enrolled
    const isEnrolled = user.enrolledCourses.some(
      e => e.course.toString() === courseId
    );
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'User is already enrolled in this course'
      });
    }

    // Check max students
    if (course.maxStudents > 0 && course.enrollmentCount >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course has reached maximum enrollment'
      });
    }

    // Enroll user
    user.enrolledCourses.push({
      course: courseId,
      role: 'student'
    });
    await user.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    // Sync enrollment to Moodle
    if (user.moodleId && course.moodleId) {
      moodleSyncService.syncEnrollmentToMoodle(userId, courseId, 'system').catch(err => {
        console.error('Failed to sync enrollment to Moodle:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
};

/**
 * Unenroll user from course
 * DELETE /api/courses/:id/enroll
 */
exports.unenrollFromCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.body.userId || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove enrollment
    user.enrolledCourses = user.enrolledCourses.filter(
      e => e.course.toString() !== courseId
    );
    await user.save();

    // Update course enrollment count
    const course = await Course.findById(courseId);
    if (course) {
      course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);
      await course.save();
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unenrolling from course',
      error: error.message
    });
  }
};

/**
 * Get enrolled students in a course
 * GET /api/courses/:id/students
 */
exports.getCourseStudents = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find({
      'enrolledCourses.course': courseId
    })
      .select('firstName lastName email role moodleId enrolledCourses')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      'enrolledCourses.course': courseId
    });

    res.status(200).json({
      success: true,
      data: {
        students,
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
      message: 'Error fetching course students',
      error: error.message
    });
  }
};

/**
 * Sync course with Moodle
 * POST /api/courses/:id/sync-moodle
 */
exports.syncCourseWithMoodle = async (req, res) => {
  try {
    const { direction = 'bidirectional' } = req.body;
    const courseId = req.params.id;

    let result;
    if (direction === 'bidirectional') {
      result = await moodleSyncService.fullCourseSync(courseId, 'manual');
    } else if (direction === 'to_moodle') {
      result = await moodleSyncService.syncCourseToMoodle(courseId, 'manual');
    } else {
      const course = await Course.findById(courseId);
      if (!course?.moodleId) {
        return res.status(400).json({
          success: false,
          message: 'Course not linked to Moodle'
        });
      }
      result = await moodleSyncService.syncCourseFromMoodle(course.moodleId, req.user.id, 'manual');
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing course with Moodle',
      error: error.message
    });
  }
};
