const Grade = require('../models/Grade');
const Course = require('../models/Course');
const { ROLES } = require('../config/roles');

/**
 * @desc    Get grades for a student
 * @route   GET /api/grades/student/:studentId
 * @access  Private/Student (self) or Teacher or Admin
 */
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;

    // Students can only view their own grades
    if (req.user.role === ROLES.STUDENT && 
        req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Can only view your own grades.'
      });
    }

    const query = { student: studentId };
    if (courseId) query.course = courseId;

    const grades = await Grade.find(query)
      .populate('course', 'title')
      .populate('teacher', 'firstName lastName')
      .populate('assignment', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { grades }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades.',
      error: error.message
    });
  }
};

/**
 * @desc    Get grades for a course
 * @route   GET /api/grades/course/:courseId
 * @access  Private/Teacher (owner) or Admin
 */
const getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if teacher owns the course
    if (req.user.role === ROLES.TEACHER && 
        course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view grades for this course.'
      });
    }

    const grades = await Grade.find({ course: courseId })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .sort({ 'student.lastName': 1 });

    res.status(200).json({
      success: true,
      data: { grades }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades.',
      error: error.message
    });
  }
};

/**
 * @desc    Create/Update grade
 * @route   POST /api/grades
 * @access  Private/Teacher or Admin
 */
const createGrade = async (req, res) => {
  try {
    const { student, course, assignment, score, maxScore, feedback, gradeType } = req.body;

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if teacher owns the course
    if (req.user.role === ROLES.TEACHER && 
        courseDoc.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade for this course.'
      });
    }

    // Check if student is enrolled
    const isEnrolled = courseDoc.enrolledStudents.some(
      e => e.student.toString() === student
    );
    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course.'
      });
    }

    // Check for existing grade (update) or create new
    let grade = await Grade.findOne({ student, course, assignment });
    let isNewGrade = !grade;

    if (grade) {
      // Update existing grade
      grade.score = score;
      grade.maxScore = maxScore;
      grade.feedback = feedback;
      grade.gradedAt = new Date();
      await grade.save();
    } else {
      // Create new grade
      grade = await Grade.create({
        student,
        course,
        teacher: req.user._id,
        assignment,
        score,
        maxScore,
        feedback,
        gradeType
      });
    }

    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title')
      .populate('teacher', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: isNewGrade ? 'Grade created successfully.' : 'Grade updated successfully.',
      data: { grade: populatedGrade }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating grade.',
      error: error.message
    });
  }
};

/**
 * @desc    Update grade
 * @route   PUT /api/grades/:id
 * @access  Private/Teacher or Admin
 */
const updateGrade = async (req, res) => {
  try {
    const { score, maxScore, feedback } = req.body;

    let grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found.'
      });
    }

    const course = await Course.findById(grade.course);

    // Check if teacher owns the course
    if (req.user.role === ROLES.TEACHER && 
        course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this grade.'
      });
    }

    grade.score = score !== undefined ? score : grade.score;
    grade.maxScore = maxScore !== undefined ? maxScore : grade.maxScore;
    grade.feedback = feedback !== undefined ? feedback : grade.feedback;
    grade.gradedAt = new Date();

    await grade.save();

    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title')
      .populate('teacher', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Grade updated successfully.',
      data: { grade: populatedGrade }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating grade.',
      error: error.message
    });
  }
};

/**
 * @desc    Delete grade
 * @route   DELETE /api/grades/:id
 * @access  Private/Admin
 */
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found.'
      });
    }

    await grade.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Grade deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting grade.',
      error: error.message
    });
  }
};

/**
 * @desc    Get my grades (for logged in student)
 * @route   GET /api/grades/my-grades
 * @access  Private/Student
 */
const getMyGrades = async (req, res) => {
  try {
    const { courseId } = req.query;

    const query = { student: req.user._id };
    if (courseId) query.course = courseId;

    const grades = await Grade.find(query)
      .populate('course', 'title')
      .populate('teacher', 'firstName lastName')
      .populate('assignment', 'title')
      .sort({ createdAt: -1 });

    // Calculate overall statistics
    const stats = {
      totalGrades: grades.length,
      averagePercentage: grades.length > 0
        ? grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length
        : 0
    };

    res.status(200).json({
      success: true,
      data: { grades, stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching grades.',
      error: error.message
    });
  }
};

module.exports = {
  getStudentGrades,
  getCourseGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getMyGrades
};
