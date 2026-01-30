const Course = require('../models/Course');
const User = require('../models/User');
const { ROLES } = require('../config/roles');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public (published) / Private (all)
 */
const getAllCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // Non-admin users only see published courses
    if (!req.user || req.user.role === ROLES.STUDENT) {
      query.isPublished = true;
    }

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(query)
      .populate('teacher', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses.',
      error: error.message
    });
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public (published) / Private (owner/admin)
 */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'firstName lastName email avatar')
      .populate('enrolledStudents.student', 'firstName lastName email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check access for unpublished courses
    if (!course.isPublished) {
      if (!req.user || 
          (req.user.role !== ROLES.ADMIN && 
           course.teacher._id.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to unpublished course.'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course.',
      error: error.message
    });
  }
};

/**
 * @desc    Create course
 * @route   POST /api/courses
 * @access  Private/Teacher or Admin
 */
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      thumbnail,
      enrollmentLimit,
      startDate,
      endDate,
      tags
    } = req.body;

    const course = await Course.create({
      title,
      description,
      shortDescription,
      category,
      level,
      thumbnail,
      enrollmentLimit,
      startDate,
      endDate,
      tags,
      teacher: req.user._id
    });

    // Add course to teacher's teaching courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { teachingCourses: course._id }
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: { course: populatedCourse }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course.',
      error: error.message
    });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Teacher (owner) or Admin
 */
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check ownership
    if (req.user.role !== ROLES.ADMIN && 
        course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course.'
      });
    }

    const updateData = { ...req.body };
    delete updateData.teacher; // Prevent changing teacher
    delete updateData.enrolledStudents; // Prevent manipulating enrollments

    course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacher', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course.',
      error: error.message
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Teacher (owner) or Admin
 */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check ownership
    if (req.user.role !== ROLES.ADMIN && 
        course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course.'
      });
    }

    // Remove course from teacher's teaching courses
    await User.findByIdAndUpdate(course.teacher, {
      $pull: { teachingCourses: course._id }
    });

    // Remove course from all enrolled students
    await User.updateMany(
      { 'enrolledCourses.course': course._id },
      { $pull: { enrolledCourses: { course: course._id } } }
    );

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course.',
      error: error.message
    });
  }
};

/**
 * @desc    Enroll in course
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student
 */
const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished course.'
      });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course.'
      });
    }

    // Check enrollment limit
    if (course.enrollmentLimit && 
        course.enrolledStudents.length >= course.enrollmentLimit) {
      return res.status(400).json({
        success: false,
        message: 'Course enrollment limit reached.'
      });
    }

    // Add student to course
    course.enrolledStudents.push({
      student: req.user._id,
      enrolledAt: new Date()
    });
    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        enrolledCourses: {
          course: course._id,
          enrolledAt: new Date()
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course.',
      error: error.message
    });
  }
};

/**
 * @desc    Unenroll from course
 * @route   DELETE /api/courses/:id/enroll
 * @access  Private/Student
 */
const unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if enrolled
    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course.'
      });
    }

    // Remove student from course
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // Remove course from student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: { course: course._id } }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unenrolling from course.',
      error: error.message
    });
  }
};

/**
 * @desc    Get teacher's courses
 * @route   GET /api/courses/teacher/my-courses
 * @access  Private/Teacher
 */
const getTeacherCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find({ teacher: req.user._id })
      .populate('enrolledStudents.student', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ teacher: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses.',
      error: error.message
    });
  }
};

/**
 * @desc    Get student's enrolled courses
 * @route   GET /api/courses/student/enrolled
 * @access  Private/Student
 */
const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'teacher',
          select: 'firstName lastName email'
        }
      });

    res.status(200).json({
      success: true,
      data: {
        enrolledCourses: user.enrolledCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses.',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getTeacherCourses,
  getEnrolledCourses
};
